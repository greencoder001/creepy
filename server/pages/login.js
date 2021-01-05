module.exports = (isHttps, req, url, conf) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Login - Creepy</title>
    </head>
    <body>
      <noscript>Please activate JavaScript</noscript>
      <input type="password" id="pwd" class="pwd" placeholder="General password" />
      <button class="btn" type="button" onclick="let a = new Date();a.setTime(new Date().getTime() + 28 * (1000 * 60 * 60 * 24));document.cookie = 'login=' + document.getElementById('pwd').value + ';expires=' + a.toUTCString();window.location.href = '/'">Login</button>
    </body>
  </html>
  `
}
