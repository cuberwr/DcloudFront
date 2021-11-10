const {
    contextBridge,
    remote
} = require('electron')
const fs = require('fs')
const async = require('async')
const http = require('https')
const path = require('path')
let userInfo=JSON.parse(fs.readFileSync('./temp/userInfo.json'))
let logo=JSON.parse(fs.readFileSync('./temp/logo.json'))
main = remote.getCurrentWindow()
//console.log(userInfo)


function streamMerge(sourceFiles, targetFile) {
    const fileWriteStream = fs.createWriteStream(path.resolve(__dirname, targetFile)); 
    streamMergeRecursive(sourceFiles, fileWriteStream);
}


function streamMergeRecursive(scripts = [], fileWriteStream) {
    if (!scripts.length) {
        return fileWriteStream.end(); 
    }
    const currentFile = scripts.shift().localPath
    console.log('当前合并中文件', scripts)
    const currentReadStream = fs.createReadStream(currentFile); 
    currentReadStream.pipe(fileWriteStream, {
        end: false
    });
    currentReadStream.on('end', function () {
        streamMergeRecursive(scripts, fileWriteStream);
        fs.unlinkSync(currentFile);
    });
    currentReadStream.on('error', function (error) { 
        console.error(error);
        fileWriteStream.close();
    });
}

async function downloadFile(file) {
    file = JSON.parse(file)
    async.mapLimit(file.part, 16, (part, callback) => {
        download(part.id, './temp/' + part.name, callback, part)
    }, (err, res) => {
        if (err) console.log('发生错误：', err)
        else {
            console.log('下载分片完成，合并中')
            console.log(file)

            streamMerge(file.part, './temp/' + file.name)
        }
    })

}

function download(url, dest, cb, part) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            part.localPath = dest
            console.log(dest, 'download compelete')
            file.close(cb(null, dest));
        });
    }).on('error', function (err) {
        fs.unlink(dest);
        if (err) console.log(err)
        cb(err, 'err')
    });
}










function refresh() {
    main.loadFile('index.html')
}

function reg(userInfo) {
    
}

function regCheck(userInfo){

}

function maxx() {
    if (main.isMaximized()) {
        main.unmaximize()
    } else {
        main.maximize()
    }
}

function top() {
    if(main.isAlwaysOnTop()){
        main.setAlwaysOnTop(false)
    }else{
        main.setAlwaysOnTop(true)
    }
}

function off() {
    main.destroy()
}

function setLocalInfo(info) {
    info=JSON.parse(info)
    console.log(info)
    for(let key in info){
        userInfo[key]=info[key]
    }
    fs.writeFileSync('./temp/userInfo.json',JSON.stringify(userInfo))
}

function hide() {
    console.log(window)
    console.log(document)
    console.log(globalThis)
    
    main.minimize()
}

function loginSuccess() {
    main.loadFile('./static/html/main.html')
}
contextBridge.exposeInMainWorld('api', {
    downloadFile: downloadFile,
    refresh: refresh,
    userInfo:userInfo,
    reg:reg,
    regCheck:regCheck,
    hide:hide,
    maxx:maxx,
    off:off,
    max:main.isMaximized,
    top:top,
    setLocalInfo:setLocalInfo,
    loginSuccess:loginSuccess,
    logo:logo
})