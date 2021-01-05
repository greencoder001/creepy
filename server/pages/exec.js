function parseCkis (ckis) {
  const p = {}
  const ck = ckis.split(';')
  for (const c of ck) {
    p[c.split('=')[0]] = c.split('=')[1]
  }

  return p
}

const { exec } = require('child_process')

module.exports = (req, conf, end, url) => {
  // Login Check
  if (req.headers.cookie === undefined) {
    // Not logged in
    return '{"error":true,"msg":"You aren\'t logged in!"}'
  } else {
    if ((parseCkis(req.headers.cookie).login || '') !== conf.pwd) {
      // Not logged in
      return '{"error":true,"msg":"You aren\'t logged in!"}'
    }

    exec('cd ' + require('os').userInfo().homedir + ' && ' + decodeURIComponent(url.substr(6)), (err, out, e) => {
      let res = ''
      res += out

      if (e) {
        res += '\n\n' + e
      }

      if (err) {
        res += '\n\n' + err
      }

      return end(res)
    })
  }
}
