import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware customizado, pode adicionar logs ou outras verificações se necessário
  },
  {
    pages: {
      signIn: '/login', // Redireciona para a página de login se não autenticado
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Permite acesso irrestrito à homepage
        if (pathname === '/') {
          return true
        }

        // Exige token para qualquer outra rota
        return !!token
      },
    },
  },
)

export const config = {
  // Protege todas as rotas, exceto aquelas explicitamente excluídas
  matcher: [
    '/((?!register|login|recuperar-senha|resetar|api).*)', // Permite algumas rotas específicas
    '/app/:path*', // Protege todas as rotas de app
  ],
}
