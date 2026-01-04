module.exports = {
  apps: [{
    name: 'gestion-proyectos',
    script: 'node',
    args: '.next/standalone/server.js',
    cwd: '/var/www/tu-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/error.log',
    out_file: '/var/log/pm2/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: [
      'node_modules',
      'public',
      'logs'
    ]
  }]
};
