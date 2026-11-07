// PM2 process file — keeps the Node server running and restarts it on crash / reboot.
// Start or reload:  pm2 startOrReload deploy/ecosystem.config.cjs --update-env
const path = require('node:path');

const serverDir = path.join(__dirname, '..', 'server');

module.exports = {
  apps: [
    {
      name: 'planbfm',
      cwd: serverDir,
      script: path.join(serverDir, 'src', 'server.js'),
      // Absolute path: PM2 does not resolve node flags against `cwd`.
      node_args: `--env-file=${path.join(serverDir, '.env')}`,
      instances: 1,
      max_memory_restart: '300M',
      time: true, // timestamps in `pm2 logs planbfm`
    },
  ],
};
