const jwt = require('jsonwebtoken');
//读取配置项
const { secret } = require('../config/config')
//声明中间件
module.exports = (req, res, next) => {
    //获取token
    let token = req.query.token;
    if (!token) {
        return res.json({
            code: '2003',
            msg: 'token缺失',
            datta: null
        })
    };
    jwt.verify(token, `${secret}`, async (err, data) => {
        try {
            //读取用户信息
            req.user = data;
            next();
        } catch (err) {
            return res.json({
                code: '2004',
                msg: '校验失败',
                datta: null
            })
        }
    })
}