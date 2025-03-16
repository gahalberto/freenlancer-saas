module.exports = {
  apps: [
    {
      name: 'freenlancer-saas',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_SHARP_PATH: '/var/www/byk/html/freenlancer-saas/node_modules/sharp',
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      cwd: '/var/www/byk/html/freenlancer-saas',
      interpreter: '/usr/bin/node'
    }
  ]
} 