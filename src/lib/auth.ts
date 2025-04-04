import { NextAuthOptions } from 'next-auth'
import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Estender o tipo da sessão para incluir roleId
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roleId: number;
      asweredQuestions?: boolean;
      isAdminPreview?: boolean;
    }
  }
  
  // Estender o tipo User para incluir os campos customizados
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roleId: number;
    asweredQuestions?: boolean;
    isAdminPreview: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  // Removemos o adapter completamente para evitar problemas de tipagem
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            roleId: true,
            asweredQuestions: true,
            isAdminPreview: true
          }
        })

        if (!user || !user?.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        // Retornar usuário com os campos necessários
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          asweredQuestions: user.asweredQuestions || false,
          isAdminPreview: user.isAdminPreview || false,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Copiar todos os campos do usuário para o token
        token.id = user.id;
        token.roleId = user.roleId;
        token.asweredQuestions = user.asweredQuestions;
        token.isAdminPreview = user.isAdminPreview;
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.roleId = token.roleId as number;
        session.user.asweredQuestions = (token.asweredQuestions as boolean) || false;
        session.user.isAdminPreview = (token.isAdminPreview as boolean) || false;
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 