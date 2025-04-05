import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const timestamp = new Date().getTime()
  
  return (
    <Html lang="pt-BR">
      <Head>
        {isDevelopment && (
          <>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
            <meta name="version" content={`${timestamp}`} />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
        {isDevelopment && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Forçar atualização da página quando detectar mudanças no código
                console.log('[DEV] Monitorando mudanças - ${timestamp}');
                window.addEventListener('focus', function() {
                  const lastVersion = sessionStorage.getItem('app-version');
                  const currentVersion = '${timestamp}';
                  
                  if (lastVersion && lastVersion !== currentVersion) {
                    console.log('[DEV] Detectada nova versão, recarregando...');
                    window.location.reload();
                  }
                  
                  sessionStorage.setItem('app-version', currentVersion);
                });
                sessionStorage.setItem('app-version', '${timestamp}');
              `,
            }}
          />
        )}
      </body>
    </Html>
  )
} 