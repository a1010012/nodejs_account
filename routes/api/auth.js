var express = require('express');
var router = express.Router();
//导入jwt
const jwt = require('jsonwebtoken');
//导入用户的模型
const UserModel = require('../../models/UserModel.js')
const md5 = require('md5')//数据加密
//读取配置项
const { secret } = require('../../config/config.js')

//登录操作
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) { // 检查用户名或密码是否为空
            return res.json({ // return终止，避免后续代码
                code: '2003',
                msg: '用户名或密码不能为空',
                data: null
            });
        }
        const md5Pwd = md5(password);
        console.log('表单数据：', username, md5Pwd);
        const data = await UserModel.findOne({ username: username, password: md5Pwd })
        console.log(data);
        if (!data) {
            return res.json({ // return终止
                code: '2002',
                msg: '用户名或密码错误',
                data: null
            });
        }
        // 创建token
        let token = jwt.sign({
            username: data.username,
            _id: data._id
        }, `${secret}`, {
            expiresIn: 60 * 60 * 24 * 7//生命周期为一周
        });
        //响应token
        return res.json({
            code: '0000',
            msg: '登录成功',
            data: token
        })
    } catch (err) {
        console.error('登录失败，具体错误：', err);
        return res.json({
            code: '2001',
            msg: '数据库读取失败',
            data: null
        })
    }

})

//退出登录
router.post('/logout', (req, res) => {
    //核心原理：销毁session
    req.session.destroy(() => {
        res.render('success', { msg: '退出成功', url: '/login' })
    })
})
module.exports = router;
