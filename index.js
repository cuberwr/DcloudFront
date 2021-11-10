const electron = require('electron')
const path = require('path')
const fs = require('fs')

const app = electron.app
const bWindow = electron.BrowserWindow
const net = electron.net

var autoLogin = null
var main = null
userInfo = JSON.parse(fs.readFileSync('./temp/userInfo.json'))

app.on('ready', () => {
    autoLogin = new bWindow({
        width: 550,
        height: 320,
        frame: false,
    })
    autoLogin.loadFile('./static/html/autoLogin.html')
    postData = {
        u_id: userInfo.u_id,
        token: userInfo.token
    }
    postData = JSON.stringify(postData)
    const request = net.request({
        method: 'POST',
        url: 'https://462e1313-11b7-49af-8b37-5474a33ed785.bspapp.com/autoLogin',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        //console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
        let body = ''
        response.on('data', (chunk) => {
            body += chunk.toString()
        })
        response.on('end', async () => {
            console.log(body)
            body = JSON.parse(body)
            main = new bWindow({
                width: 1080,
                height: 900,
                frame: false,
                webPreferences: {
                    preload: path.join(__dirname, './static/js/preload.js'),
                    enableRemoteModule: true
                }
            })
            autoLogin.close()
            autoLogin = null
            main.webContents.openDevTools({
                mode: 'detach'
            })
            if (!body.success) {
                main.loadFile('./static/html/login.html')
            } else {
                main.loadFile('./static/html/main.html')
            }
        })
    });
    request.write(postData);
    request.end();
})