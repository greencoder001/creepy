/* global $$, zGET, session, ace */

var cp = 'dash'

const pages = {
  dash: () => {
    window.executeCmd = (cmd) => {
      if (cmd === 'clear' || cmd === 'cls') {
        try { $$('#shell-out').innerText = '' } catch {}
        return { then: () => {} }
      }
      return zGET({ url: '/exec/' + encodeURIComponent(cmd) })
    }

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

            <div style="margin-top:2vh">
              <button onclick="executeCmd('${info.os === 'Windows' ? 'shutdown -s -t 0' : 'shutdown now'}')">Shutdown</button>
              <button onclick="executeCmd('${info.os === 'Windows' ? 'shutdown -r -t 0' : 'shutdown -r now'}')">Reboot</button>
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
        try { $$('#shell-out').innerText = '' } catch {}
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
      zGET({ url: '/tasks/' + session.choosedTask + '.json' }).then((taskinfo) => {
        taskinfo = JSON.parse(taskinfo)

        if (session.tasks === undefined) session.tasks = {}
        if (session.tasks[session.choosedTask] === undefined) session.tasks[session.choosedTask] = { currentFile: null }

        const currentFile = session.tasks[session.choosedTask].currentFile

        window.deleteFile = (fn) => {
          const tsk = session.choosedTask
          zGET({ url: '/deletefile/' + encodeURIComponent(tsk) + '/' + encodeURIComponent(fn) }).then(() => {
            zGET({ url: '/tasks/' + encodeURIComponent(tsk) + '.json' }).then((tski) => {
              console.log(tski)
              session.files = JSON.parse(tski).files

              window.openFile(tsk, session.files[0])
            })
          })
        }

        window.openFile = (task, fname) => {
          session.tasks[session.choosedTask].currentFile = fname
          $$('.files ul').innerHTML = ''
          for (const filename of session.files) {
            $$('.files ul').innerHTML += `
              <li oncontextmenu="event.preventDefault(),deleteFile('${filename}')" onclick="session.tasks[session.choosedTask].currentFile='${filename}';openFile(session.choosedTask,'${filename}')" class="${fname === filename ? 'active' : ''}">${(() => {
                if (filename.endsWith('.py') || filename.endsWith('.pyw')) {
                  return '<i class="fab fa-python"></i>'
                } else if (filename.endsWith('.js')) {
                  return '<i class="fab fa-js"></i>'
                } else if (filename.endsWith('.cmd') || filename.endsWith('.bat') || filename.endsWith('.sh')) {
                  return '<i class="fas fa-terminal"></i>'
                } else if (filename.endsWith('.txt')) {
                  return '<i class="far fa-file-alt"></i>'
                } else if (filename.endsWith('.zip') || filename.endsWith('.tar.gz') || filename.endsWith('.tar.bz') || filename.endsWith('.rar')) {
                  return '<i class="far fa-file-archive"></i>'
                } else if (filename.endsWith('.csv')) {
                  return '<i class="fas fa-file-csv"></i>'
                } else if (filename.endsWith('.ico') || filename.endsWith('.png') || filename.endsWith('.svg') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
                  return '<i class="far fa-file-image"></i>'
                } else if (filename.endsWith('.css')) {
                  return '<i class="fab fa-css3"></i>'
                } else if (filename.endsWith('.sass') || filename.endsWith('.scss')) {
                  return '<i class="fab fa-sass"></i>'
                } else {
                  return '<i class="far fa-file"></i>'
                }
              })()} ${filename}</li>
            `
          }

          editor.getSession().setMode('ace/mode/text')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.js')) editor.getSession().setMode('ace/mode/javascript')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.py') || session.tasks[session.choosedTask].currentFile.endsWith('.pyw')) editor.getSession().setMode('ace/mode/python')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.css')) editor.getSession().setMode('ace/mode/css')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.json')) editor.getSession().setMode('ace/mode/json')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.coffee')) editor.getSession().setMode('ace/mode/coffe')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.rb')) editor.getSession().setMode('ace/mode/ruby')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.bat')) editor.getSession().setMode('ace/mode/batchfile')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.cmd')) editor.getSession().setMode('ace/mode/batchfile')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.php')) editor.getSession().setMode('ace/mode/php')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.inc')) editor.getSession().setMode('ace/mode/php')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.cpp')) editor.getSession().setMode('ace/mode/c_cpp')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.ino')) editor.getSession().setMode('ace/mode/c_cpp')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.cs')) editor.getSession().setMode('ace/mode/csharp')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.sass')) editor.getSession().setMode('ace/mode/sass')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.scss')) editor.getSession().setMode('ace/mode/scss')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.less')) editor.getSession().setMode('ace/mode/less')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.text')) editor.getSession().setMode('ace/mode/markdown')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.md')) editor.getSession().setMode('ace/mode/markdown')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.markdown')) editor.getSession().setMode('ace/mode/markdown')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.sql')) editor.getSession().setMode('ace/mode/sql')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.dart')) editor.getSession().setMode('ace/mode/dart')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.pl')) editor.getSession().setMode('ace/mode/perl')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.pm')) editor.getSession().setMode('ace/mode/perl')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.ts')) editor.getSession().setMode('ace/mode/typescript')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.java')) editor.getSession().setMode('ace/mode/java')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.xml')) editor.getSession().setMode('ace/mode/xml')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.go')) editor.getSession().setMode('ace/mode/golang')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.svg')) editor.getSession().setMode('ace/mode/svg')
          if (session.tasks[session.choosedTask].currentFile.endsWith('.kt')) editor.getSession().setMode('ace/mode/kotlin')

          zGET({ url: '/getfile/' + encodeURIComponent(task) + '/' + encodeURIComponent(fname) }).then((value) => {
            session.lastChange = value
            editor.setValue(value)
          })
          console.log('Loading file: ' + fname)
        }

        for (const filename of taskinfo.files) {
          session.files = taskinfo.files
          $$('.files ul').innerHTML = ''
          $$('.files ul').innerHTML += `
            <li oncontextmenu="event.preventDefault(),deleteFile('${filename}')" onclick="session.tasks[session.choosedTask].currentFile='${filename}';openFile(session.choosedTask,'${filename}')" class="${currentFile === filename ? 'active' : ''}">${(() => {
              if (filename.endsWith('.py') || filename.endsWith('.pyw')) {
                return '<i class="fab fa-python"></i>'
              } else if (filename.endsWith('.js')) {
                return '<i class="fab fa-js"></i>'
              } else if (filename.endsWith('.cmd') || filename.endsWith('.bat') || filename.endsWith('.sh')) {
                return '<i class="fas fa-terminal"></i>'
              } else if (filename.endsWith('.txt')) {
                return '<i class="far fa-file-alt"></i>'
              } else if (filename.endsWith('.zip') || filename.endsWith('.tar.gz') || filename.endsWith('.tar.bz') || filename.endsWith('.rar')) {
                return '<i class="far fa-file-archive"></i>'
              } else if (filename.endsWith('.csv')) {
                return '<i class="fas fa-file-csv"></i>'
              } else if (filename.endsWith('.ico') || filename.endsWith('.png') || filename.endsWith('.svg') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
                return '<i class="far fa-file-image"></i>'
              } else if (filename.endsWith('.css')) {
                return '<i class="fab fa-css3"></i>'
              } else if (filename.endsWith('.sass') || filename.endsWith('.scss')) {
                return '<i class="fab fa-sass"></i>'
              } else {
                return '<i class="far fa-file"></i>'
              }
            })()} ${filename}</li>
          `
        }

        const editor = ace.edit('editor')
        editor.setTheme('ace/theme/monokai')

        window.openFile(taskinfo.id, currentFile)

        editor.getSession().setMode('ace/mode/text')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.js')) editor.getSession().setMode('ace/mode/javascript')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.py') || session.tasks[session.choosedTask].currentFile.endsWith('.pyw')) editor.getSession().setMode('ace/mode/python')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.css')) editor.getSession().setMode('ace/mode/css')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.json')) editor.getSession().setMode('ace/mode/json')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.coffee')) editor.getSession().setMode('ace/mode/coffe')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.rb')) editor.getSession().setMode('ace/mode/ruby')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.bat')) editor.getSession().setMode('ace/mode/batchfile')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.cmd')) editor.getSession().setMode('ace/mode/batchfile')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.php')) editor.getSession().setMode('ace/mode/php')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.inc')) editor.getSession().setMode('ace/mode/php')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.cpp')) editor.getSession().setMode('ace/mode/c_cpp')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.ino')) editor.getSession().setMode('ace/mode/c_cpp')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.cs')) editor.getSession().setMode('ace/mode/csharp')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.sass')) editor.getSession().setMode('ace/mode/sass')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.scss')) editor.getSession().setMode('ace/mode/scss')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.less')) editor.getSession().setMode('ace/mode/less')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.text')) editor.getSession().setMode('ace/mode/markdown')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.md')) editor.getSession().setMode('ace/mode/markdown')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.markdown')) editor.getSession().setMode('ace/mode/markdown')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.sql')) editor.getSession().setMode('ace/mode/sql')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.dart')) editor.getSession().setMode('ace/mode/dart')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.pl')) editor.getSession().setMode('ace/mode/perl')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.pm')) editor.getSession().setMode('ace/mode/perl')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.ts')) editor.getSession().setMode('ace/mode/typescript')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.java')) editor.getSession().setMode('ace/mode/java')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.xml')) editor.getSession().setMode('ace/mode/xml')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.go')) editor.getSession().setMode('ace/mode/golang')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.svg')) editor.getSession().setMode('ace/mode/svg')
        if (session.tasks[session.choosedTask].currentFile.endsWith('.kt')) editor.getSession().setMode('ace/mode/kotlin')
        editor.setValue('')

        window.setFile = (task, fname, val) => {
          task = session.choosedTask
          fname = session.tasks[session.choosedTask].currentFile
          console.log('Writing at ' + task + ': ' + fname, val)
          zGET({ url: `/setfile/${encodeURIComponent(task)}/${encodeURIComponent(fname)}/${encodeURIComponent(val)}` })
        }

        session.lastChange = editor.getValue()

        setInterval(() => {
          if (session.choosedTask === taskinfo.id) {
            if (session.lastChange !== editor.getValue()) {
              session.lastChange = editor.getValue()
              window.setFile(taskinfo.id, currentFile, editor.getValue())
            }
          }
        }, 1000)

        editor.focus()

        editor.setOptions({
          fontSize: '12pt',
          showLineNumbers: true,
          showGutter: true,
          vScrollBarAlwaysVisible: true,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true
        })

        editor.setShowPrintMargin(false)
        editor.setBehavioursEnabled(false)
      }, 200)

      window.createFile = (fn, tsk) => {
        if (fn !== null && fn !== '') {
          zGET({ url: '/setfile/' + encodeURIComponent(tsk) + '/' + encodeURIComponent(fn) + '/' }).then(() => {
            zGET({ url: '/tasks/' + encodeURIComponent(tsk) + '.json' }).then((tski) => {
              console.log('Create File ' + fn + ' at ' + tsk)
              session.files = JSON.parse(tski).files
              window.openFile(tsk, fn)
            })
          })
        }
      }

      return `
        <div class="files">
          <ul></ul>
          <button class="createFile" onclick="createFile(prompt('Enter a filename:', ''), session.choosedTask)">+</button>
        </div>
        <div class="code" id="editor"></div>
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
