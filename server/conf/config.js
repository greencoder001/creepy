const fs = require('fs')
const path = require('path')

module.exports = {
  httpPort: 80,
  httpsPort: 443,
  pwd: 'cpy',
  useHTTP: false,
  httpsConf: {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
  }
}
