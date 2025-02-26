import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }


        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          isAdminPreview: user.isAdminPreview,
          asweredQuestions: user.asweredQuestions ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "default_jwt_secret",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.roleId) {
        token.roleId = session.roleId;
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.roleId = user.roleId; // 🔥 Permite alteração do roleId
        token.isAdminPreview = user.isAdminPreview;
        token.asweredQuestions = user.asweredQuestions ?? undefined;
      }
      return token;
    },
    async session({ session, token, trigger, newSession }) {
      if (token) {
        if (trigger === "update" && newSession?.roleId) {
          session.user.roleId = newSession.roleId;
        }
        session.user = {
          id: token.id as string,
          name: token.name,
          email: token.email,
          roleId: token.roleId, // 🔄 Atualiza roleId na sessão
          isAdminPreview: token.isAdminPreview,
          asweredQuestions: token.asweredQuestions,
        };
      }
      return session;
    },
  },
      
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
