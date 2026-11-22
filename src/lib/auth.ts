import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { rateLimit, getClientIp } from "./rateLimit";

const loginSchema = z.object({
  email: z.string().email("Invalid college email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token && session.user && token.id) {
        session.user.id = token.id as string;
        session.user.rollNumber = token.rollNumber as string;
        session.user.department = token.department as string;
        session.user.year = token.year as number;

        try {
          // Live check to invalidate sessions immediately if user is DISABLED or deleted
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { status: true, role: true },
          });

          if (dbUser) {
            session.user.status = dbUser.status;
            session.user.role = dbUser.role;
          } else {
            session.user.status = "DISABLED";
          }
        } catch {
          session.user.status = token.status as any;
          session.user.role = token.role as any;
        }
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "College Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const clientIp = getClientIp();
        const rl = await rateLimit(`login:ip:${clientIp}`, 5, 60);
        if (!rl.success) {
          throw new Error("Too many login attempts. Please wait 1 minute before trying again.");
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            status: true,
            rollNumber: true,
            department: true,
            year: true,
          },
        });

        if (!user) {
          return null;
        }

        if (user.status === "DISABLED") {
          throw new Error("Account has been disabled. Please contact the campus administrator.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          rollNumber: user.rollNumber,
          department: user.department,
          year: user.year,
        };
      },
    }),
  ],
});
