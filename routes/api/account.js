const express = require('express');
let checkTokenMiddleWare = require('../../middlewares/checkTokenMiddleware')
// const jwt = require('jsonwebtoken');
const router = express.Router();
const moment = require('moment')
const shortid = require('shortid')
const AccountModel = require('../../models/AccountModel')
//const db = require('../../data/db.json')

/* 记账本列表 */
//修改后的，mongoose不支持exec的回调语法，推荐使用 async/await 
router.get('/account', checkTokenMiddleWare, async function (req, res, next) { // 关键：添加 async 关键字
    try {
        console.log(req.user)
        // 用 await 等待查询结果（新版 Mongoose 方法默认返回 Promise，无需 exec 回调）
        const data = await AccountModel.find().sort({ time: -1 });
        return res.json({
            //响应编号npm
            code: '0000',
            //响应的信息
            msg: '读取成功',
            //响应的数据
            data: data
        })
    } catch (err) { // 用 try/catch 捕获错误（替代原来的 err 回调）
        res.json({
            code: '1001',
            mas: '读取失败',
            data: null
        })
        return;
    }
})

// 新增记录的路由（修正后）
router.post('/account', checkTokenMiddleWare, async (req, res) => {
    try {
        // 1. 打印提交的数据，确认原始类型（调试用）
        console.log('原始表单数据：', req.body);
        // 输出示例：{ title: '买彩', time: '2025-10-03', type: '1', account: '5', remarks: '44' }

        // 2. 转换字段类型（关键！）
        const type = Number(req.body.type); // 字符串转Number
        const account = Number(req.body.account); // 字符串转Number
        const time = moment(req.body.time); // 确保时间格式正确
        let id = shortid.generate();
        // 3. 验证转换结果（调试用）
        console.log('转换后的数据：', { type, account, time });

        // 4. 插入 MongoDB（使用转换后的值）
        const data = await AccountModel.create({
            title: req.body.title,
            time: time,
            type: type, // 使用转换后的Number
            account: account, // 使用转换后的Number
            remarks: req.body.remarks || ''
        });
        // db.get('accounts').unshift({ id: id, ...req.body }).write();
        console.log('MongoDB 插入成功：', data); // 确认插入成功

        // 5. 跳转成功页面
        // res.render('success', { msg: '添加成功！', url: '/account' });
        res.json({
            //响应编号npm
            code: '0000',
            //响应的信息
            msg: '添加成功',
            //响应的数据
            data: data
        })

    } catch (err) {
        console.error('插入失败（详细错误）：', err); // 打印完整错误信息
        res.json({
            code: '1002',
            mas: '添加失败',
            data: null
        })
    }
});

//删除记录
router.delete('/account/:id', checkTokenMiddleWare, async (req, res) => { // 关键：添加 async 关键字
    try {
        // 获取 params 中的 id 参数
        const id = req.params.id;
        // 执行删除操作（新版 Mongoose 的 deleteOne 返回 Promise，可直接 await）
        const data = await AccountModel.deleteOne({ _id: id });
        // 删除成功，渲染成功页面
        res.json({
            //响应编号npm
            code: '0000',
            //响应的信息
            msg: '删除成功',
            //响应的数据
            data: data
        })
    } catch (err) { // 用 try/catch 捕获错误
        res.json({
            code: '1003',
            mas: '删除失败',
            data: null
        })
    }
});

//获取单个账单信息
router.get('/account/:id', checkTokenMiddleWare, async (req, res) => {
    try {
        // 获取id参数
        let { id } = req.params;
        //查询数据库
        const data = await AccountModel.findById({ _id: id });
        res.json({
            //响应编号npm
            code: '0000',
            //响应的信息
            msg: '查询单个账单成功',
            //响应的数据
            data: data
        })
    } catch (err) {
        return res.json({
            code: '1004',
            mas: '查询单个账单失败',
            data: null
        })
    }
})

//更新单个账单信息
router.patch('/account/:id', checkTokenMiddleWare, async (req, res) => {
    try {
        let { id } = req.params;
        const updateData = req.body;
        const updateResult = await AccountModel.updateOne(
            { _id: id },
            updateData
        );
        // 3. 判断更新是否有效（是否找到记录 + 是否实际修改）
        if (updateResult.matchedCount === 0) {
            return res.json({
                code: '1006',
                msg: '更新失败：未找到该账单',
                data: null
            });
        }
        if (updateResult.modifiedCount === 0) {
            return res.json({
                code: '1007',
                msg: '未修改任何内容（数据与原记录一致）',
                data: null
            });
        }
        // 4. 如需返回更新后的完整数据，用 async/await 调用 findById（避免回调）
        const updatedData = await AccountModel.findById(id); // 正确语法：直接传 id

        // 5. 只发送一次响应（关键：确保整个接口只调用一次 res.json）
        res.json({
            code: '0000',
            msg: '更新单个账单成功',
            data: updatedData // 返回更新后的完整数据
        });
    } catch (err) {
        return res.json({
            code: '1005',
            msg: '更新单个账单失败',
            data: null
        })
    }

})
module.exports = router;
