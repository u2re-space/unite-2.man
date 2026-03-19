/** @type {import('eslint').Linter.Config} */
module.exports = {
  apps: [
    {
      name: 'cws',
      cwd: 'C:\\Users\\U2RE\\endpoint-portable',

      // Запускать напрямую собранный JS, а не npm/tsx/cmd
      "script": "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js",
      interpreter: 'none',

      // Обычный форк без кластера
      exec_mode: 'fork',
      instances: 1,

      // Без вотчеров для production
      watch: false,
      autorestart: true,

      // Аргументы приложения
      args: 'run --config ./portable.config.json --data ./.data ./dist/server-v2/index.js',

      // Логи
      error_file: 'C:\\Users\\U2RE\\.pm2\\logs\\cws-error.log',
      out_file: 'C:\\Users\\U2RE\\.pm2\\logs\\cws-out.log',
      merge_logs: true,
      time: true,

      // Поведение рестарта
      min_uptime: '5s',
      max_restarts: 10,
      restart_delay: 3000,

      env: {
        NODE_ENV: 'development'
      },

      env_production: {
        NODE_ENV: 'production',

        CWS_AIRPAD_VERBOSE: '1',
        CWS_TUNNEL_DEBUG: 'true',

        CWS_BRIDGE_ENABLED: 'true',
        CWS_BRIDGE_MODE: 'active',
        CWS_BRIDGE_CONNECTION_TYPE: 'exchanger-initiator',
        CWS_BRIDGE_ENDPOINT_URL: 'https://45.147.121.152:8443/',

        // Если приложение умеет читать массивы только как JSON-строки:
        CWS_BRIDGE_ENDPOINTS: JSON.stringify([
          'https://45.147.121.152:8443/',
          'https://100.76.202.88:8443/',
          'https://192.168.0.200:8443/'
        ]),

        CWS_BRIDGE_PRECONNECT_TARGETS: JSON.stringify([
          'L-192.168.0.200'
        ]),

        CWS_BRIDGE_RECONNECT_MS: '3000',

        CWS_PORTABLE_CONFIG_PATH: './portable.config.json',
        CWS_PORTABLE_DATA_PATH: './.data',

        CWS_ASSOCIATED_TOKEN: 'n3v3rm1nd',
        CWS_BRIDGE_USER_ID: 'L-192.168.0.200',
        CWS_BRIDGE_USER_KEY: 'n3v3rm1nd',
        CWS_BRIDGE_DEVICE_ID: 'L-192.168.0.200',

        CWS_AIRPAD_NATIVE_ACTIONS: 'true',
        CWS_AIRPAD_ROBOTJS_ENABLED: 'true',
        CWS_BRIDGE_REJECT_UNAUTHORIZED: 'false',

        CWS_HTTPS_ENABLED: 'true',
        CWS_HTTPS_KEY: './https/local/multi.key',
        CWS_HTTPS_CERT: './https/local/multi.crt',
        CWS_HTTPS_CA: './https/local/rootCA.crt',

        CWS_CLIPBOARD_LOGGING: 'true',
        CWS_ASSOCIATED_ID: 'L-192.168.0.200',

        CWS_ROLES: JSON.stringify([
          'responser-initiated',
          'requestor-initiated',
          'responser-initiator',
          'requestor-initiator',
          'exchanger-initiator',
          'exchanger-initiated'
        ]),

        CWS_CLIPBOARD_LOG_HASH: 'true',
        CWS_CLIPBOARD_LOG_PREVIEW: '64'
      }
    }
  ]
}