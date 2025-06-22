module.exports = {
    apps: [{
        name: 'fintrack',
        script: 'npm',
        args: 'start',
        cwd: '/var/www/fintrack',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
            NEXT_PUBLIC_API_URL: 'http://localhost:8000'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000,
            NEXT_PUBLIC_API_URL: 'http://localhost:8000'
        },
        error_file: '/var/log/fintrack/err.log',
        out_file: '/var/log/fintrack/out.log',
        log_file: '/var/log/fintrack/combined.log',
        time: true
    }]
};