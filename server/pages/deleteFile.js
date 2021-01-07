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
    try {
      const a = JSON.parse(fs.readFileSync('../tasks/' + decodeURIComponent(url.split('/')[0]) + '.json').toString('utf-8'))
      a.files = a.files.filter((e) => { return e !== decodeURIComponent(url.split('/')[1]) })
      fs.writeFileSync('../tasks/' + decodeURIComponent(url.split('/')[0]) + '.json', JSON.stringify(a))

      end(fs.unlinkSync('../tasks/' + decodeURIComponent(url.split('/')[0]) + '/' + decodeURIComponent(url.split('/')[1])))
    } catch {
      end('Creepy Server Error: File Error')
    }
  }
}
