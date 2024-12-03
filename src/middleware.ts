import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    //  console.log('Middleware running:', req.nextUrl.pathname); // Log para verificação
  },
  {
    pages: {
      signIn: '/login', // Redireciona para a página de login se não autenticado
    },
    callbacks: {
      authorized: ({ token }) => {
        // Verifica se o token existe para autorizar o usuário
        if (token) {
          //        console.log('User authorized with token:', token);
          return true // Se o token existe, permite o acesso
        }
        //       console.log('User not authorized, no token found');
        return false // Sem token, não autoriza
      },
    },
  },
)

export const config = {
  // Protege todas as rotas, exceto algumas rotas específicas como '/register'
  matcher: [
    '/', // Protege a rota principal
    '/dashboard/:path*', // Protege todas as rotas de dashboard
    '/((?!register|login|recuperar-senha|resetar|api).*)', // Permite o acesso às páginas '/register' e '/login'
  ],
}
