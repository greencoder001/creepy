// Creepy by Green_Lab (licensed: MIT)

const { httpPort, httpsPort, httpsConf } = require('./conf/config.js')
const [http, https] = [require('http'), require('https')]
const listener = require('./listener.js')

http.createServer(listener(false)).listen(httpPort)
https.createServer(httpsConf, listener(true)).listen(httpsPort)
