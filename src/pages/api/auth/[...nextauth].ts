import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credenciais faltando");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user) {
          console.log("Usuário encontrado:", user);
        } else {
          console.log("Usuário não encontrado");
          return null;
        }
      

        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            asweredQuestions: user.asweredQuestions ?? undefined, // Converta null para undefined
          };
        }

        return null;
      }

    })
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: String(token.id),
          name: token.name,
          email: token.email,
          roleId: token.roleId,
          asweredQuestions: token.asweredQuestions // Corrigido para usar asweredQuestions
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.roleId = user.roleId;
        token.asweredQuestions = user.asweredQuestions; // Corrigido para usar asweredQuestions no JWT
      }
      return token;
    },
  },
  pages: {
    signIn: '/login', // Página de login personalizada
  },
  debug: process.env.NODE_ENV === 'development', // Modo de depuração
};

export default NextAuth(authOptions);
