function parseCkis (ckis) {
  let p = {}
  ck = ckis.split(';')
  for (c of ck) {
    p[c.split('=')[0]] = c.split[c.split('=')[1]]
  }

  return p
}

module.exports = (isHttps, req, url, conf) => {
  // Login Check
  if (req.headers['cookie'] === undefined || parseCkis(req.headers.cookie).login === conf.pwd) {
    // Login
    return require('./login.js')(isHttps, req, url, conf)
  } else {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dashboard - Creepy</title>
        </head>
        <body>
          <noscript>Please activate JavaScript</noscript>
        </body>
      </html>
    `
  }
}
