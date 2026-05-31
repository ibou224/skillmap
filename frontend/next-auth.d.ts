import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    error?: string;
    user: {
      id: string;
      role?: string;
      nom?: string;
      prenom?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    nom?: string;
    prenom?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    nom?: string;
    prenom?: string;
    refreshToken?: string;
    accessTokenExpires: number;
    error?: string;
  }
}