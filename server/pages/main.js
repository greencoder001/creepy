/* global $$, zGET */

var cp = 'dash'

const pages = {
  dash: () => {
    const parseTime = (seconds) => {
      let out = ''

      function zeroFirst (n) {
        return String(n).padStart(2, '0')
      }

      if (seconds < 60) {
        out = seconds + ' seconds'
      } else if (seconds >= 60 && seconds < 60 * 60) {
        let min = 0
        let sec = seconds

        while (sec >= 60) {
          min++
          sec -= 60
        }

        out = zeroFirst(min) + ':' + zeroFirst(sec) + ' minutes'
      } else if (seconds >= 60 * 60 && seconds < 60 * 60 * 24) {
        let h = 0
        let min = 0
        let sec = seconds

        while (sec >= 60) {
          min++
          sec -= 60
        }

        while (min >= 60) {
          h++
          min -= 60
        }

        out = zeroFirst(h) + ':' + zeroFirst(min) + ':' + zeroFirst(sec) + ' hours'
      } else {
        let d = 0
        let h = 0
        let min = 0
        let sec = seconds

        while (sec >= 60) {
          min++
          sec -= 60
        }

        while (min >= 60) {
          h++
          min -= 60
        }

        while (h >= 24) {
          d++
          h -= 24
        }

        out = zeroFirst(d) + ':' + zeroFirst(h) + ':' + zeroFirst(min) + ':' + zeroFirst(sec) + ' days'
      }

      return out
    }

    const sysinfointerval = () => {
      if (cp === 'dash') {
        const sysinfo = $$('div.sysinfo#sysinfo')

        zGET({ url: '/osdata.json' }).then((value) => {
          const info = JSON.parse(value)
          sysinfo.innerHTML = `
            <h3>${info.host} (${info.ip})</h3>
            <div class="flex-justify">
              <div>
                <span>${(() => {
                  if (info.os === 'Windows') return '<i class="fab fa-windows"></i>'
                  if (info.os === 'MacOS') return '<i class="fab fa-apple"></i>'
                  if (info.os === 'Linux') return '<i class="fab fa-linux"></i>'
                  if (info.os === 'Unix') return '<i class="fab fa-linux"></i>'
                  if (info.os === 'Android') return '<i class="fab fa-android"></i>'
                })()} ${info.os}</span>
                <br />
                <span>Has been running for ${parseTime(info.running.cpy)}</span>
              </div>
              <div>
                CPU - ${info.cpuUsage}% <div class="cpu-usage">
                  <div style="width:${info.cpuUsage}%;background:${info.cpuUsage < 33.5 ? '#13e467' : (info.cpuUsage > 66.5 ? '#f47766' : '#d7fa73')};"></div>
                </div>
              </div>
              <div>
                RAM - ${Math.round(100 - ((info.ram.free / info.ram.total) * 100))}% <div class="cpu-usage">
                  <div style="width:${Math.round(100 - ((info.ram.free / info.ram.total) * 100))}%;background:${Math.round(100 - ((info.ram.free / info.ram.total) * 100)) < 33.5 ? '#13e467' : (Math.round(100 - ((info.ram.free / info.ram.total) * 100)) > 66.5 ? '#f47766' : '#d7fa73')};"></div>
                </div>
              </div>
            </div>
          `
        })
      }
    }
    setInterval(sysinfointerval, 1000)

    return `
      <h1>Dashboard</h1>

      <div class="sysinfo" id="sysinfo"></div>
    `
  }
}

const requestPage = (pageId, name) => {
  cp = pageId

  try {
    for (const elem of $$('nav ul li')) {
      elem.classList.remove('active')
    }
  } catch {
    $$('nav ul li').classList.remove('active')
  }

  $$(`nav ul li[data-page="${pageId}"]`).classList.add('active')

  $$('title').innerHTML = `${name} - Creepy`
  $$('main').innerHTML = pages[pageId]()
}

$$(document)(() => {
  requestPage('dash', 'Dashboard')
})
