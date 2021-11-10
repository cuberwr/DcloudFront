let popup
async function sliceFile(file, size) {
    return new Promise(resolve => {
        let partSize = 1024 * 1024 * size
        let fileInfo = []
        let partNum = Math.ceil(file.size / partSize)
        for (let i = 0; i < partNum; i++) {
            let blob = file.slice(i * partSize, (i + 1) * partSize)
            fileInfo[i] = {
                blobUrl: URL.createObjectURL(blob),
                md5: ''
            }
            let fileReader = new FileReader()
            fileReader.readAsBinaryString(blob);
            fileReader.onload = e => {
                let md5 = SparkMD5.hashBinary(e.target.result)
                fileInfo[i].md5 = md5
            }
        }
        resolve(fileInfo)
    })
}

let mapLimit = (list, limit, asyncHandle) => {
    let recursion = (arr) => {
        return asyncHandle(arr.shift())
            .then(() => {
                if (arr.length !== 0) return recursion(arr) // 数组还未迭代完，递归继续进行迭代
                else return 'finish';
            })
    };

    let listCopy = [].concat(list);
    let asyncList = []; // 正在进行的所有并发异步操作
    while (limit--) {
        asyncList.push(recursion(listCopy));
    }
    return Promise.all(asyncList); // 所有并发异步操作都完成后，本次并发控制迭代完成
}

async function upload(fileInfo, file, path, vm) {
    let uploadedSize = -1564
    mapLimit(fileInfo, 16, e => {
        let total = 0
        let change = 0
        console.log(e)
        wr.uploadFile({
            filePath: e.blobUrl,
            cloudPath: e.blobUrl.split('///')[1],
            onUploadProgress: function (progressEvent) {
                console.log(progressEvent)
                change = progressEvent.loaded - total
                total = progressEvent.loaded
                uploadedSize += change
                vm.transformProgress[file.name].uploaded=uploadedSize
                //console.log(vm.transformProgress[file.name])
            },
            success(res) {
                console.log('success.res', res)
                console.log('success.e:', e)
                e.id = res.fileID
                URL.revokeObjectURL(e.blobUrl)
                delete e.blobUrl
                let data = {
                    parts: [],
                    md5: [],
                    u_id: window.api.userInfo.u_id,
                    token: window.api.userInfo.token
                }
                for (let i = 0; i < fileInfo.length; i++) {
                    data.parts[i] = fileInfo[i].id
                    data.md5[i] = fileInfo[i].md5
                }
                console.log(uploadedSize,file.size)
                
                if (file.size== uploadedSize) {
                    console.log('size ok')
                    
                    wr.callFunction({
                        name: 'addFile',
                        data: data
                    }).then(res => {
                        console.log(res)
                        
                        if (!res.success) throw new Error(res)
                        if (!res.result.success) throw new Error(res.result.msg)
                        else {
                            wr.callFunction({
                                name: 'creat',
                                data: {
                                    path: path,
                                    file: {
                                        size: file.size,
                                        name: file.name,
                                        _id: res.result.id
                                    },
                                    u_id: window.api.userInfo.u_id,
                                    token: window.api.userInfo.token
                                }
                            }).then(res => {
                                console.log(res)
                                vm.reload()
                                vm.transformProgress[file.name].status = 'done'
                            })
                        }
                    })
                }
            },
            fail(res) {
                console.error(`分片${e.md5}上传失败：`, res)
            }
        });
    }).then(res=>{
        console.log('all done')
        
    })

}

const drag = {
    data() {
        return {
            top: false,
            max: true
        }
    },
    methods: {
        op() {
            this.top = !this.top
            window.api.top()
        },
        maxx() {
            this.max = window.api.max()
            window.api.maxx()
        },
        hide() {
            window.api.hide()
        },
        off() {
            window.api.off()
        }
    }
}

const file = {
    data() {
        return {
            root: {},
            current: null,
            node: {},
            rmenu: false,
            r: {
                file: false,
                floder: false
            },
            transformProgress: {
                aaa: {
                    type:'upload',
                    status: 'slicing',
                    size: 666,
                    uploaded: 333
                }
            },
            alert: {
                active: false,
                msg: ''
            }
        }
    },
    async mounted() {
        let data = {
            u_id: window.api.userInfo.u_id,
            token: window.api.userInfo.token
        }
        let res = await wr.callFunction({
            name: 'fs',
            data: data
        })
        console.log(res)
        this.root = res.result.root
        this.node = this.root
        window.api.setLocalInfo(JSON.stringify({
            root: this.root
        }))
    },
    methods: {
        async reload(){
            let data = {
                u_id: window.api.userInfo.u_id,
                token: window.api.userInfo.token
            }
            let res = await wr.callFunction({
                name: 'fs',
                data: data
            })
            console.log(res)
            this.root = res.result.root
            let node=this.root
            for(let i=1;i<this.node['&~path'].length;i++){
                node=node[node['&~path'][i]]
            }
            this.node = node
            window.api.setLocalInfo(JSON.stringify({
                root: this.root
            }))
        },
        upload() {
            let that = this
            this.hide()
            console.log(this.current)
            uni.chooseFile({
                async success(e) {
                    that.transformProgress[e.tempFiles[0].name] = {
                        type:'upload',
                        status: 'slicing',
                        size: e.tempFiles[0].size,
                        uploaded: 0
                    }
                    let fileInfo = await sliceFile(e.tempFiles[0], 32)
                    that.transformProgress[e.tempFiles[0].name].status = 'uploading'
                    console.log('分片信息：', fileInfo)
                    upload(fileInfo, e.tempFiles[0], that.current['&~path'].slice(1).join(''), that)
                }
            })
        },
        download() {
            this.hide()
            console.log(this.current)
        },
        rclick(e, item) {
            this.current = item
            if (item['&~type'] == 'floder') {
                this.r.file = false
                this.r.floder = true
            } else {
                this.r.file = true
                this.r.floder = false
            }
            this.$refs.menu.style.top = `${e.y-58}px`
            this.$refs.menu.style.left = `${e.x-58}px`
            this.rmenu = true
            console.log(e)
        },
        svg(e) {
            if (e['&~type'] == 'floder') return window.api.logo[e['&~type']]
            else return window.api.logo[e['name'].split('.')[e['name'].split('.').length - 1]]
        },
        nav(e) {
            console.log(e)
            let node = this.root
            let path = this.node['&~path']
            for (let i = 1; i < e; i++) {
                node = node[path[i]]
            }
            this.node = node
        },
        back() {
            console.log('back')
            let node = this.root
            let path = this.node['&~path']
            for (let i = 1; i < path.length - 1; i++) {
                node = node[path[i]]
            }
            this.node = node
        },
        alertPopup(msg, t) {
            if (popup) clearTimeout(popup)
            this.alert.active = true
            this.alert.msg = msg
            popup = setTimeout(() => {
                this.alert.active = false
                this.alert.msg = ''
            }, 1000 * t)
        },
        open(e) {
            console.log(e)
            if(e['&~type']=='floder') this.node = e
            else{
                this.alertPopup('不支持的预览格式',3)
            }
        },
        hide() {
            console.log('hide')

            this.rmenu = false
        }
    },
}


Vue.createApp(drag).mount('#drag')
Vue.createApp(file).mount('#file')

//Vue.createApp(rout).mount('#rout')