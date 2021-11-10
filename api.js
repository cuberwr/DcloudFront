const appKey = 'fPfWjzELZMwGtxCQTtcINYQmOo4fkVWW'
'非必须值保持空字符串'
reg = {
    //注册接口
    in: {
        //name,phone,mail三选一
        name: 'string|用户输入|非必须',
        phone: 'string|用户输入|非必须',
        mail: 'string|用户输入|非必须',
        pwds: 'string|密码+appKey取md5|必须'
    },
    out: [{
            success: false,
            msg: 'haveusr',
            chk: {} //用户已存在
        },
        {
            success: true,
            msg:'mailok'//邮件已发送
        }
    ]
}
login = {
    //登录接口
    in: {
        //name,phone,mail三选一
        name: 'string|用户输入|非必须',
        phone: 'string|用户输入|非必须',
        mail: 'string|用户输入|非必须',
        pwds: 'string|密码+appKey取md5|必须'
    },
    out: [{
            success: false,
            msg: 'nousr' //未找到用户
        },
        {
            success: false,
            msg: 'passerror' //密码错误
        },
        {
            success: false,
            msg: 'noid' //登录信息用户名手机邮箱信息全部缺失
        },
        {
            success: false,
            msg: 'nopwd' //登录信息密码缺失
        },
        {
            success: true,
            token: token, //更新token
            root: userInfo.data[0].root, //文件系统树
            u_id: userInfo.data[0]._id //用户id
        }
    ]
}
fs = {
    //获取文件系统树接口
    in: {
        u_id: '610d6f8c2e5faa000101f889',
        token: 'd17b32db-00cb-c825-ffcd-406dd52caa67'
    },
    out: [{
            success: false,
            msg: 'tokenerror'
        },
        {
            success: false,
            msg: 'nouid'
        },
        {
            success: true,
            root: userInfo.data[0].root //文件系统树
        }
    ]
}
del = {
    //删除文件，文件夹接口
    in: {
        path: 'test/test1', //字符串，头尾无"/"
        file: {
            //可选
            name: 'test.jpg',
            _id: '' //文件在资源池中id
        },
        u_id: '610d6f8c2e5faa000101f889',
        token: 'd17b32db-00cb-c825-ffcd-406dd52caa67'
    },
    out: [{
            success: false,
            msg: 'tokenerror'
        },
        {
            success: false,
            msg: 'nouid'
        },
        {
            success: true
        }
    ]
}
creat = {
    //创建文件，文件夹接口
    in: {
        path: 'test/test1', //字符串，头尾无"/"
        file: {
            //可选
            size: '',
            name: 'test.jpg',
            _id: '' //文件在资源池中id
        },
        u_id: '610d6f8c2e5faa000101f889',
        token: 'd17b32db-00cb-c825-ffcd-406dd52caa67'
    },
    out: [{
            success: false,
            msg: 'tokenerror'
        },
        {
            success: false,
            msg: 'nouid'
        },
        {
            success: true
        }
    ]
}
addFile = {
    //在文件资源池中添加文件
    in: {
        u_id: '',
        token: '',
        parts: [], //文件分块真实id，阿里云存储id
        md5: [] //文件分块md5
    },
    out: [{
            success: false,
            msg: 'tokenerror'
        },
        {
            success: false,
            msg: 'nouid'
        },
        {
            success: true,
            id: res.id //文件在资源池中id
        }
    ]
}

mail = {
    //在验证数据库中添加验证类型和数据后发送邮件
    in: {
        cloudKey:'',
        type: '', //addusr|login|changepwd
        data: {}, //对应接口所需数据
        mail: ''
    },
    out: [{
            success: true,
            msg: '' //成功信息
        },
        {
            success: false,
            msg: '' //错误信息
        },
        {success:false,msg:'ckerror'}//没有cloudKey或者cloudKey错误
    ]
}

addusr={
    in:{
        cloudKey:'',

    }
}
userInfo = {
    "name": "",
    "token": "97d063a4-c2cd-9855-327b-e82c9459b43a",
    "tokenDate": 1628314126386,
    "passwordSec": "75e2ee776d3cf123a7958fb26e216d1a",
    "mail": "a@a.cc",
    "phone": "",
    "root": {
        "test": {
            "&~path": [
                "test"
            ],
            "&~type": "floder",
            "test1": {
                "&~path": [
                    "test",
                    "test1"
                ],
                "&~type": "floder"
            }
        }
    }
}