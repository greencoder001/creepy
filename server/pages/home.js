function parseCkis (ckis) {
  const p = {}
  const ck = ckis.split(';')
  for (const c of ck) {
    p[decodeURIComponent(c.split('=')[0])] = decodeURIComponent(c.split('=')[1])
  }

  return p
}

const navbar = require('./navbar.js')

module.exports = (isHttps, req, url, conf) => {
  // Login Check
  if (req.headers.cookie === undefined) {
    // Login
    return require('./login.js')(isHttps, req, url, conf)
  } else {
    if ((parseCkis(req.headers.cookie).login || '') !== conf.pwd) {
      // Login
      return require('./login.js')(isHttps, req, url, conf)
    }
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dashboard - Creepy</title>
          <meta charset="utf-8" />
          <link rel="stylesheet" href="main.min.css" />
          <link rel="icon" href="/icon.svg" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/greencoder001/sessionjs@latest/main.js"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/greencoder001/async.js@latest/dist/bundle.js"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/greencoder001/zGET@latest/dist/bundle.js"></script>
          <script src="https://kit.fontawesome.com/8a7d9bf784.js" crossorigin="anonymous"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/greencoder001/queryjs@latest/dist/query.js"></script>
          <script src="/main.js"></script>
        </head>
        <body>
          <nav>
            <img src="/icon-inverted.svg" alt="Creepy" class="icon-aside" />
            <ul>
              ${(() => {
                let res = ''

                for (const item of navbar) {
                  res += `<li data-page="${item.page}" onclick="requestPage('${item.page}', '${item.name}')">${item.icon} ${item.name}</li>`
                }

                return res
              })()}
            </ul>
          </nav>
          <main>

          </main>
        </body>
      </html>
    `
  }
}
