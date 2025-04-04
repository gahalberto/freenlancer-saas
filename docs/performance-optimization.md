# Otimizações de Desempenho para o BYK

Este documento contém instruções e recomendações para otimizar o desempenho do site BYK, especialmente para a página `/app/admin/events/todos` que apresentava lentidão.

## Otimizações já implementadas

1. **Paginação de dados**: Implementamos paginação na listagem de eventos para reduzir a quantidade de dados carregados de uma vez.
2. **Otimização de consultas ao banco de dados**: Reduzimos a quantidade de dados incluídos na consulta principal, carregando apenas o necessário.
3. **Indicador de carregamento**: Adicionamos um spinner para melhorar a experiência do usuário durante o carregamento.
4. **Cache no servidor**: Implementamos cache no servidor para páginas estáticas.
5. **Otimizações no Next.js**: Configuramos o Next.js para otimizar CSS, imagens e cabeçalhos de cache.

## Recomendações adicionais

### 1. Configurar Redis para cache

Para um cache mais robusto, considere implementar Redis:

```bash
# Instalar Redis
npm install ioredis

# Criar um arquivo de cliente Redis em src/app/_lib/redis.ts
```

Exemplo de implementação:

```typescript
// src/app/_lib/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export default redis;
```

### 2. Otimizar imagens

Verifique se todas as imagens estão sendo otimizadas corretamente:

- Use o componente `next/image` em vez de tags `<img>` comuns
- Converta imagens para formatos modernos como WebP ou AVIF
- Implemente lazy loading para imagens

### 3. Implementar Code Splitting

Divida seu JavaScript em pacotes menores:

```js
// Use importação dinâmica para componentes grandes
const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Carregando...</p>,
  ssr: false
})
```

### 4. Análise de bundle size

Execute uma análise do tamanho do seu bundle:

```bash
# Instalar analisador de bundle
npm install @next/bundle-analyzer --save-dev

# Configurar em next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)
```

### 5. Melhorar o desempenho do servidor

- Aumente a quantidade de memória disponível para Node.js 
- Configure o PM2 para melhor gerenciamento de processos

```bash
# Editar o arquivo ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "byk",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        NODE_OPTIONS: "--max-old-space-size=1536"
      }
    }
  ]
}
```

### 6. Implementar serviço de CDN

Configure um CDN como Cloudflare ou Vercel Edge Network para servir conteúdo estático mais rapidamente.

### 7. Implementar API Routes bem projetadas

- Use cache em API routes com stale-while-revalidate
- Implemente paginação em todas as APIs que retornam listas
- Otimize para incluir apenas os dados necessários

## Como monitorar desempenho

1. **Lighthouse**: Execute auditorias do Lighthouse regularmente
2. **Web Vitals**: Monitore as métricas Core Web Vitals
3. **Tempo de carregamento**: Use o Chrome DevTools para analisar o desempenho de carregamento de página

## Próximos passos

1. Implementar as recomendações acima
2. Medir o desempenho antes e depois de cada otimização
3. Focar em otimizações que trazem o maior impacto para o usuário final 