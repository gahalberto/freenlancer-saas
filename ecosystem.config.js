module.exports = {
  apps: [
    {
      name: 'freenlancer-saas',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
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
      interpreter: '/usr/bin/node',
      exp_backoff_restart_delay: 100,
      shutdown_with_message: true,
      node_args: '--expose-gc',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
} 