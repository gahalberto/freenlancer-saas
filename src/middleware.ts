import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

    if (maintenanceMode && !req.nextUrl.pathname.startsWith('/maintenance')) {
      return NextResponse.next(); // Permite que a página continue carregada
    }
    return NextResponse.next();
    },
  {
    pages: {
      signIn: '/login', // Redireciona para a página de login se não autenticado
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Permite acesso irrestrito à homepage, política de privacidade e exclusão de conta
        if (pathname === '/' || pathname === '/privacy' || pathname === '/excluir-conta') {
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
    '/((?!register|login|recuperar-senha|resetar|api|privacy|excluir-conta|store|public|estabelecimentos).*)', // Permite algumas rotas específicas
    '/app/:path*', // Protege todas as rotas de app
  ],
}
