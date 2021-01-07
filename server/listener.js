const { URL } = require('url')
const fs = require('fs')

module.exports = (isHttps) => {
  console.log(`[WebServer] ${isHttps ? 'HTTPS' : 'HTTP'} Server running`)
  return (req, res) => {
    const u = new URL(req.url, `http${isHttps ? 's' : ''}://localhost`)
    const rl = u.pathname

    if (rl === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(require('./pages/home.js')(isHttps, req, u, require('./conf/config.js')))
      res.end()
    } else if (rl === '/main.min.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' })
      res.end(fs.readFileSync('./pages/main.min.css'))
    } else if (rl === '/main.min.css.map') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(fs.readFileSync('./pages/main.min.css.map'))
    } else if (rl === '/icon.svg') {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
      res.end(fs.readFileSync('../icon.svg'))
    } else if (rl === '/icon-inverted.svg') {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
      res.end(fs.readFileSync('../icon-inverted.svg'))
    } else if (rl === '/main.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript' })
      res.end(fs.readFileSync('./pages/main.js'))
    } else if (rl === '/osdata.json') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      require('./pages/os-data.js')(req, require('./conf/config.js'), (val) => {
        res.end(val)
      })
    } else if (rl.startsWith('/exec/')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      require('./pages/exec.js')(req, require('./conf/config.js'), (val) => {
        res.end(val)
      }, rl)
    } else if (rl.startsWith('/tasks/') && rl.endsWith('.json')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      require('./pages/taskinfo.js')(req, require('./conf/config.js'), (val) => {
        res.end(val)
      }, rl)
    } else if (rl === '/tasks.json') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      require('./pages/tasksinfo.js')(req, require('./conf/config.js'), (val) => {
        res.end(val)
      }, rl)
    } else if (rl.startsWith('/getfile/')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      require('./pages/getFile.js')(req, require('./conf/config.js'), (val) => {
        res.end(val)
      }, rl.substr(9))
    } else if (rl.startsWith('/setfile/')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      require('./pages/setFile.js')(req, require('./conf/config.js'), (val) => {
        res.end(val)
      }, rl.substr(9))
    } else if (rl.startsWith('/deletefile/')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      require('./pages/deleteFile.js')(req, require('./conf/config.js'), (val) => {
        res.end(val)
      }, rl.substr(12))
    }
  }
}
