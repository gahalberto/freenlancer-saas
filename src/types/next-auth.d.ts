// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: number; // Adiciona o roleId na sessão
      isAdminPreview: boolean; // Adiciona a sua propriedade aqui
      asweredQuestions?: boolean; // Adicione a sua propriedade aqui
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roleId: number; // Adiciona o roleId ao usuário
    isAdminPreview: boolean; // Adiciona a sua propriedade aqui
    asweredQuestions?: boolean; // Adicione a sua propriedade aqui
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: number; // Adiciona o roleId no token JWT
    isAdminPreview: boolean; // Adiciona a sua propriedade aqui
    asweredQuestions?: boolean; // Adicione a sua propriedade aqui
    image?: string | null;
  }
}
