module.exports = (isHttps, req, url, conf) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Login - Creepy</title>
      <link rel="stylesheet" href="main.min.css" />
      <link rel="icon" href="/icon.svg" />
    </head>
    <body>
      <noscript>Please activate JavaScript</noscript>
      <div class="login">
        <span><img src="/icon.svg" alt="Creepy" style="width:10vw;height:10vw" /></span>
        <span><input onkeypress="if(event.charCode===13){let a = new Date();a.setTime(new Date().getTime() + 28 * (1000 * 60 * 60 * 24));document.cookie = 'login=' + encodeURIComponent(document.getElementById('pwd').value) + ';expires=' + a.toUTCString();window.location.href = '/'}" type="password" id="pwd" class="pwd inp" placeholder="General password" /></span>
        <br />
        <span><button class="btn" type="button" onclick="let a = new Date();a.setTime(new Date().getTime() + 28 * (1000 * 60 * 60 * 24));document.cookie = 'login=' + encodeURIComponent(document.getElementById('pwd').value) + ';expires=' + a.toUTCString();window.location.href = '/'">Login</button></span>
      </div>
    </body>
  </html>
  `
}
