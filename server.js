const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Cache de resposta para rotas estáticas
const ssrCache = {};
const CACHE_DURATION = 60 * 1000; // 1 minuto

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;
    
    // Verifica se a rota pode ser cacheada
    const isStaticRoute = 
      !pathname.startsWith('/_next/') && 
      !pathname.startsWith('/api/') &&
      req.method === 'GET';
    
    // Usa cache para rotas estáticas em produção
    if (!dev && isStaticRoute) {
      const cacheKey = `${pathname}${JSON.stringify(query)}`;
      
      if (ssrCache[cacheKey] && Date.now() < ssrCache[cacheKey].expiresAt) {
        console.log(`Serving cached page for ${pathname}`);
        res.setHeader('X-Cache', 'HIT');
        res.end(ssrCache[cacheKey].html);
        return;
      }
      
      // Substitui res.end para interceptar e cachear a resposta
      const originalEnd = res.end;
      res.end = function(data) {
        if (res.statusCode === 200) {
          ssrCache[cacheKey] = {
            html: data,
            expiresAt: Date.now() + CACHE_DURATION
          };
        }
        res.setHeader('X-Cache', 'MISS');
        originalEnd.call(res, data);
      };
    }
    
    // Deixa o Next.js lidar com a requisição
    try {
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
