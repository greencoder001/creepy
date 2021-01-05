const { URL } = require('url')

module.exports = (isHttps) => {
  console.log(`[WebServer] ${isHttps ? 'HTTPS' : 'HTTP'} Server running`)
  return (req, res) => {
    const u = new URL(req.url, `http${isHttps ? 's' : ''}://localhost`)
    const rl = u.pathname

    if (rl === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(require('./pages/home.js')(isHttps, req, u, require('./conf/config.js')))
      res.end()
    }
  }
}
