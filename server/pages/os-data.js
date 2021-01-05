function parseCkis (ckis) {
  const p = {}
  const ck = ckis.split(';')
  for (const c of ck) {
    p[c.split('=')[0]] = c.split('=')[1]
  }

  return p
}

const osu = require('os-utils')
const os = require('os')

module.exports = async (req, conf, end) => {
  // Login Check
  if (req.headers.cookie === undefined) {
    // Not logged in
    return '{"error":true,"msg":"You aren\'t logged in!"}'
  } else {
    if ((parseCkis(req.headers.cookie).login || '') !== conf.pwd) {
      // Not logged in
      return '{"error":true,"msg":"You aren\'t logged in!"}'
    }

    osu.cpuUsage((cpuUsage) => {
      require('dns').lookup(os.hostname(), function (err, add, fam) {
        if (err) throw err
        end(JSON.stringify({
          cpuUsage: Number(cpuUsage.toString().substr(2, 2)),
          platform: osu.platform(),
          ram: {
            free: Math.round(osu.freemem()),
            total: Math.round(osu.totalmem())
          },
          running: {
            cpy: Math.round(osu.processUptime()),
            system: osu.sysUptime()
          },
          host: os.hostname(),
          ip: add,
          os: (() => {
            if (osu.platform() === 'win32') return 'Windows'
            if (osu.platform() === 'darwin') return 'MacOS'
            if (osu.platform() === 'linux') return 'Linux'
            if (osu.platform() === 'android') return 'Android'
            if (osu.platform() === 'sunos' || osu.platform() === 'freebsd' || osu.platform() === 'openbsd' || osu.platform() === 'aix') return 'Unix'
          })(),
          user: {
            name: os.userInfo().username,
            dir: os.userInfo().homedir
          }
        }))
      })
    })
  }
}
