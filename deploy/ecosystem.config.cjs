// PM2 process file — keeps the Node server running and restarts it on crash / reboot.
// Start or reload:  pm2 startOrReload deploy/ecosystem.config.cjs --update-env
const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'planb',
      cwd: path.join(__dirname, '..', 'server'),
      script: 'src/server.js',
      node_args: '--env-file=.env',
      instances: 1,
      max_memory_restart: '300M',
      time: true, // timestamps in `pm2 logs planb`
    },
  ],
};
