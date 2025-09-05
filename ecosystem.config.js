module.exports = {
  apps: [{
    name: 'urban-nucleus',
    script: 'backend/server.js',
    cwd: '/var/www/urban-nucleus',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      MYSQL_HOST: 'localhost',
      MYSQL_USER: 'urban_user',
      MYSQL_PASSWORD: '@Arqum789',
      MYSQL_DATABASE: 'urban_nucleus',
      MYSQL_PORT: 3306
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      MYSQL_HOST: 'localhost',
      MYSQL_USER: 'urban_user',
      MYSQL_PASSWORD: '@Arqum789',
      MYSQL_DATABASE: 'urban_nucleus',
      MYSQL_PORT: 3306,
      DOMAIN_URL: 'http://31.97.239.99'
    },
    error_file: '/var/log/urban-nucleus/err.log',
    out_file: '/var/log/urban-nucleus/out.log',
    log_file: '/var/log/urban-nucleus/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    // Add health check
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    // Better error handling
    kill_timeout: 5000,
    listen_timeout: 8000,
    // Environment file
    env_file: './backend/env.production'
  }]
}; 