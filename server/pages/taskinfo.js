function parseCkis (ckis) {
  const p = {}
  const ck = ckis.split(';')
  for (const c of ck) {
    p[decodeURIComponent(c.split('=')[0])] = decodeURIComponent(c.split('=')[1])
  }

  return p
}

const fs = require('fs')

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
  }

  end(fs.readFileSync(`../tasks/${url.substr(7).replace(/\.json/g, '')}.json`).toString('utf-8'))
}
