/* global $$, zGET, session */

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
  },
  shell: () => {
    window.executeCmd = (cmd) => {
      if (cmd === 'clear' || cmd === 'cls') {
        $$('#shell-out').innerText = ''
        return { then: () => {} }
      }
      return zGET({ url: '/exec/' + encodeURIComponent(cmd) })
    }

    window.cmd = () => {
      if (window.event.charCode === 13) {
        $$('#shell-out').innerText += (window.termUser || 'user@creepy') + '> ' + $$('.shell input').value + '\n'

        window.executeCmd($$('input').value).then((val) => {
          $$('#shell-out').innerText += val + '\n'
          $$('#shell-out').scrollTop += 99999999999999999999
        })
        $$('.shell input').value = ''
      }
    }

    zGET({ url: '/osdata.json' }).then((value) => {
      window.termUser = `${JSON.parse(value).user.name}@${JSON.parse(value).host}`
      $$('.shell input').placeholder = `${JSON.parse(value).user.name}@${JSON.parse(value).host}>`
    })

    return `
      <div class="shell">
        <pre class="shell-out" id="shell-out"></pre>
        <input placeholder="user@creepy>" onkeypress="cmd()" type="text" />
      </div>
    `
  },
  tasks: () => {
    zGET({ url: '/tasks.json' }).then((tasks) => {
      tasks = JSON.parse(tasks).sort()

      for (const taskid of tasks) {
        zGET({ url: '/tasks/' + taskid + '.json' }).then((taskinfo) => {
          taskinfo = JSON.parse(taskinfo)

          var languageIcon = ''
          var lang = ''

          if (taskinfo.language === 'python') { languageIcon = '<i class="fab fa-python"></i>'; lang = 'Python' }
          if (taskinfo.language === 'javascript') { languageIcon = '<i class="fab fa-js"></i>'; lang = 'JavaScript' }

          $$('div#tasklist.tasklist').innerHTML += `
            <div class="task" data-task="${taskinfo.id}">
              <h3 class="href" onclick="session.choosedTask='${taskinfo.id}';requestPage('ide', 'IDE')">${taskinfo.name}</h3>
              <span class="coding-langage">${languageIcon} ${lang}</span>
            </div>
          `
        })
      }
    })

    return `
      <h1>Tasks</h1>
      <div class="tasklist" id="tasklist"></div>
    `
  },
  ide: () => {
    if (typeof session.choosedTask !== 'string') {
      return requestPage('tasks', 'Tasks') || pages.tasks()
    } else {
      return `
        ${session.choosedTask}
      `
    }
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
