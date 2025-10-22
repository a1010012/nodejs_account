var express = require('express');
var router = express.Router();
const UserModel = require('../../models/UserModel.js')
const md5 = require('md5')//数据加密
//注册
router.get('/reg', (req, res) => {
    //响应HTML内容
    res.render('reg')
})

//注册用户
router.post('/reg', async (req, res) => {
    try {
        //表单验证
        //获取请求体数据
        const { username, password } = req.body;
        console.log('表单数据：', username, md5(password));
        const data = await UserModel.create({
            username: username,
            password: md5(password)
        })
        console.log(req.body)
        res.render('success', { msg: '注册成功', url: '/login' })
        //响应HTML内容
    } catch (err) {
        console.error('注册失败，具体错误：', err);
        res.status(500).send('注册失败');
    }
})

//登录
router.get('/login', (req, res) => {
    //响应HTML内容
    res.render('login')
})

//登录操作
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('表单数据：', username, md5(password));
        const data = await UserModel.findOne({ username: username, password: md5(password) })
        console.log(data);
        if (!data) {
            res.send('账号或密码错误---')
        }
        //写入session
        req.session.username = data.username;
        req.session._id = data._id;
        res.render('success', { msg: '登录成功', url: '/account' })
    } catch (err) {
        console.error('登录失败，具体错误：', err);
        res.status(500).send('注册失败');
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
