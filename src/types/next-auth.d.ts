import { DefaultSession } from "next-auth";
import { Role, AccountStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: AccountStatus;
      rollNumber: string;
      department: string;
      year: number;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: Role;
    status: AccountStatus;
    rollNumber: string;
    department: string;
    year: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    status?: AccountStatus;
    rollNumber?: string;
    department?: string;
    year?: number;
  }
}
