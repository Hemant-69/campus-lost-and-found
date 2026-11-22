import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth configuration.
 * Must NOT import Prisma, bcrypt, or native modules so it can execute in Edge middleware.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.rollNumber = user.rollNumber;
        token.department = user.department;
        token.year = user.year;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        if (token.id) session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.status = token.status as any;
        session.user.rollNumber = token.rollNumber as string;
        session.user.department = token.department as string;
        session.user.year = token.year as number;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Immediately reject disabled users from any authenticated action or protected route
      if (isLoggedIn && auth.user.status === "DISABLED") {
        return false;
      }

      // Allow static files, api auth, health, cron, and images
      if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/health") ||
        pathname.startsWith("/api/cron")
      ) {
        return true;
      }

      // Admin routes require role ADMIN
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        return auth.user.role === "ADMIN";
      }

      // Protected student routes
      const isProtectedRoute =
        pathname.startsWith("/posts/new") ||
        pathname.startsWith("/my-posts") ||
        pathname.startsWith("/my-claims") ||
        pathname.startsWith("/messages") ||
        pathname.startsWith("/notifications") ||
        pathname.startsWith("/profile");

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      // Guest routes: redirect to feed if already logged in
      const isAuthRoute = pathname === "/login" || pathname === "/register";
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/posts", nextUrl));
      }

      return true;
    },
  },
  providers: [],
};
