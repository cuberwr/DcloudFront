let popup
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
function newToken() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
const login = {
    data() {
        return {
            user: {
                name: '',
                phone: '',
                mail: '',
                passwd: ''
            },
            page: 'login',
            repasswd: '',
            authName: '',
            pageName: '登录',
            alert: {
                active: false,
                msg: ''
            },
            pageTo: ''
        }
    },
    methods: {
        test(e) {
            let phone = /^1[3-9]\d{9}$/
            let mail = /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/
            return phone.test(e) ? 'phone' : mail.test(e) ? 'mail' : 'name'
        },
        async login() {
            if (!(this.user.passwd || this.authName)) this.alertPopup('你看看是不是少填了什么', 3)
            else {
                let data = {
                    pwds: md5(this.passwd + 'fPfWjzELZMwGtxCQTtcINYQmOo4fkVWW')
                }
                data[this.test(this.authName)] = this.authName
                this.user[this.test(this.authName)] = this.authName
                console.log(data)
                let res = await wr.callFunction({
                    name: 'login',
                    data: data
                })
                if (!res.result.success) {
                    switch (res.result.msg) {
                        case 'nousr': {
                            this.alertPopup('没有这个用户', 3)
                            break
                        }
                        case 'passerror': {
                            this.alertPopup('密码不对', 3)
                            break
                        }
                        case 'noid': {
                            this.alertPopup('服务端没收到用户信息', 3)
                            break
                        }
                        case 'nopwd': {
                            this.alertPopup('服务端没收到密码', 3)
                            break
                        }
                    }
                } else {
                    let data = res.result
                    delete data.success
                    data = JSON.stringify(data)
                    window.api.setLocalInfo(data)
                    window.api.loginSuccess()
                }
            }
        },
        async reg() {
            if (!this.user.name) this.alertPopup('没有填写用户名', 3)
            else if (this.user.name.length < 3) this.alertPopup('用户名太短，至少要有3个字符', 3)
            else if (!(this.user.mail || this.user.phone)) this.alertPopup('手机号和邮箱至少要填写一个', 3)
            else if (this.user.mail && (this.test(this.user.mail) != 'mail')) this.alertPopup('邮箱格式不对', 3)
            else if (this.user.phone && (this.test(this.user.phone) != 'phone')) this.alertPopup('手机号格式不对', 3)
            else if (!this.user.passwd) this.alertPopup('没有输入密码', 3)
            else if (this.user.passwd.length < 8) this.alertPopup('密码太短', 3)
            else if (this.user.passwd.length > 32) this.alertPopup('密码太长', 3)
            else if (this.user.passwd != this.repasswd) this.alertPopup('两次密码不一样', 3)
            else {
                this.alertPopup('激活邮件发送中', 3)
                let regRes = await wr.callFunction({
                    name: 'reg',
                    data: {
                        phone: this.user.phone,
                        name: this.user.name,
                        mail: this.user.mail,
                        pwds: md5(this.passwd + 'fPfWjzELZMwGtxCQTtcINYQmOo4fkVWW')
                    }
                })
                if (regRes.result.success) {
                    this.alertPopup('激活邮件已发送', 3)
                    let check = setInterval(async () => {
                        let loginRes = await wr.callFunction({
                            name: 'login',
                            data: {
                                phone: this.user.phone,
                                name: this.user.name,
                                mail: this.user.mail,
                                pwds: md5(this.passwd + 'fPfWjzELZMwGtxCQTtcINYQmOo4fkVWW')
                            }
                        })
                        if (!loginRes.result.success||loginRes.result.msg=='nousr') this.alertPopup('激活邮件已发送\n等待验证', 10)
                        else {
                            clearInterval(check)
                            this.alertPopup('验证成功', 3)
                            let data = loginRes.result
                            delete data.success
                            data = JSON.stringify(data)
                            window.api.setLocalInfo(data)
                            window.api.loginSuccess()
                        }
                    }, 3000);
                } else if (regRes.result.msg == 'haveusr') {
                    let msg = ''
                    if (regRes.result.chk.name) msg += '用户名已存在\n'
                    if (regRes.result.chk.phone) msg += '手机号已注册\n'
                    if (regRes.result.chk.mail) msg += '邮箱已注册\n'
                    this.alertPopup(msg, 3)
                }
            }
        },
        async changepwd() {
            //if (!this.user.name) this.alertPopup('没有填写用户名', 3)
            //else if (this.user.name.length < 3) this.alertPopup('用户名太短，至少要有3个字符', 3)
            //else if (!(this.user.mail || this.user.phone)) this.alertPopup('手机号和邮箱至少要填写一个', 3)
            if (!(this.user.mail||this.user.name)) this.alertPopup('用户名和邮箱至少要填写一个', 3)
            else if (this.user.mail && (this.test(this.user.mail) != 'mail')) this.alertPopup('邮箱格式不对', 3)
            //else if (this.user.phone && (this.test(this.user.phone) != 'phone')) this.alertPopup('手机号格式不对', 3)
            else if (!this.user.passwd) this.alertPopup('没有输入密码', 3)
            else if (this.user.passwd.length < 8) this.alertPopup('密码太短', 3)
            else if (this.user.passwd.length > 32) this.alertPopup('密码太长', 3)
            else if (this.user.passwd != this.repasswd) this.alertPopup('两次密码不一样', 3)
            else {
                this.alertPopup('验证邮件发送中', 3)
                let changepwdRes = await wr.callFunction({
                    name: 'changepwd',
                    data: {
                        phone: this.user.phone,
                        name: this.user.name,
                        mail: this.user.mail,
                        pwds: md5(this.passwd + 'fPfWjzELZMwGtxCQTtcINYQmOo4fkVWW')
                    }
                })
                console.log(changepwdRes)
                if (changepwdRes.result.success) {
                    this.alertPopup('验证邮件已发送', 3)
                    let check = setInterval(async () => {
                        let loginRes = await wr.callFunction({
                            name: 'login',
                            data: {
                                phone: this.user.phone,
                                name: this.user.name,
                                mail: this.user.mail,
                                pwds: md5(this.passwd + 'fPfWjzELZMwGtxCQTtcINYQmOo4fkVWW')
                            }
                        })
                        
                        if (!loginRes.result.success||loginRes.result.msg=='passerror') this.alertPopup('验证邮件已发送\n等待验证', 10)
                        else {
                            clearInterval(check)
                            this.alertPopup('验证成功', 3)
                            let data = loginRes.result
                            delete data.success
                            data = JSON.stringify(data)
                            window.api.setLocalInfo(data)
                            window.api.loginSuccess()
                        }
                    }, 3000);
                } 
            }
        },
        async checkLogin() {
            if(!this.authName){
                this.alertPopup('你看看是不是有什么没填',3)
            }else if(this.test(this.authName)!='mail'){
                this.alertPopup('不支持这个邮箱格式',3)
            }else{
                this.alertPopup('验证邮件发送中', 3)
                let localToken=newToken()
                this.mail=this.authName
                let res=await wr.callFunction({
                    name:'checkLogin',
                    data:{
                        name:this.name,
                        phone:this.phone,
                        mail:this.mail,
                        token:localToken
                    }
                })
                if(res.result.success){
                    this.alertPopup('验证邮件已发送', 3)
                    let check = setInterval(async () => {
                        let fs = await wr.callFunction({
                            name: 'fs',
                            data: {
                                u_id:res.result.u_id,
                                token:localToken
                            }
                        })
                        if (!fs.result.success) this.alertPopup('验证邮件已发送\n等待验证', 10)
                        else {
                            clearInterval(check)
                            this.alertPopup('验证成功', 3)
                            let data={
                                u_id:fs.result.u_id,
                                token:localToken
                            }
                            data = JSON.stringify(data)
                            window.api.setLocalInfo(data)
                            window.api.loginSuccess()
                        }
                    }, 3000);
                }

            }
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
        toReg() {
            this.pageTo = 'reg'
            this.page = ''
            this.pageName = '注册'
        },
        toLogin() {
            this.pageTo = 'login'
            this.page = ''
            this.pageName = '登录'
        },
        toCheckLogin() {
            this.pageTo = 'checkLogin'
            this.page = ''
            this.pageName = '验证登录'
        },
        toChangepwd() {
            this.pageTo = 'changepwd'
            this.page = ''
            this.pageName = '修改密码'
        },
        afterLeave() {
            this.page = this.pageTo
        }
    }
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

Vue.createApp(login).mount('#login')
Vue.createApp(drag).mount('#drag')