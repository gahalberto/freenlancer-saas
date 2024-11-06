// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: number; // Adiciona o roleId na sessão
      asweredQuestions?: boolean; // Adicione a sua propriedade aqui
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roleId: number; // Adiciona o roleId ao usuário
    asweredQuestions?: boolean; // Adicione a sua propriedade aqui
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: number; // Adiciona o roleId no token JWT
    asweredQuestions?: boolean; // Adicione a sua propriedade aqui
  }
}
