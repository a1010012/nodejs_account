var express = require('express');
const moment = require('moment')
const shortid = require('shortid')
const db = require('../../data/db.json')
const AccountModel = require('../../models/AccountModel')
const checkLoginMiddleware = require('../../middlewares/checkLoginMiddleware')
//创建路由对象
var router = express.Router();

//添加首页的路由规则
router.get('/', (req, res) => {
  res.redirect('/account')
})

//修改后的，mongoose不支持exec的回调语法，推荐使用 async/await 
router.get('/account', checkLoginMiddleware, async (req, res) => { // 关键：添加 async 关键字
  try {
    // 用 await 等待查询结果（新版 Mongoose 方法默认返回 Promise，无需 exec 回调）
    const data = await AccountModel.find().sort({ time: -1 });
    // 成功时渲染页面
    res.render('list', { accounts: data, moment: moment });
  } catch (err) { // 用 try/catch 捕获错误（替代原来的 err 回调）
    res.status(500).send('读取失败~~~');
  }
});

// 添加记录
router.get('/account/create', checkLoginMiddleware, (req, res) => {
  res.render('create');
});

// 新增记录的路由（修正后）
router.post('/account', checkLoginMiddleware, async (req, res) => {
  try {
    // 1. 打印提交的数据，确认原始类型（调试用）
    console.log('原始表单数据：', req.body);
    // 输出示例：{ title: '买彩', time: '2025-10-03', type: '1', account: '5', remarks: '44' }

    // 2. 转换字段类型（关键！）
    const type = Number(req.body.type); // 字符串转Number
    const account = Number(req.body.account); // 字符串转Number
    const time = moment(req.body.time).toDate().format('YYYY-MM-DD'); // 确保时间格式正确
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
    res.render('success', { msg: '添加成功！', url: '/account' });

  } catch (err) {
    console.error('插入失败（详细错误）：', err); // 打印完整错误信息
    res.status(500).render('success', { msg: '添加失败，请检查输入格式' });
  }
});

//删除记录
router.get('/account/:id', checkLoginMiddleware, async (req, res) => { // 关键：添加 async 关键字
  try {
    // 获取 params 中的 id 参数
    const id = req.params.id;
    // 执行删除操作（新版 Mongoose 的 deleteOne 返回 Promise，可直接 await）
    await AccountModel.deleteOne({ _id: id });
    // 删除成功，渲染成功页面
    res.render('success', { msg: '删除成功~~~', url: '/account' });
  } catch (err) { // 用 try/catch 捕获错误
    res.status(500).send('删除失败~');
  }
});
module.exports = router;
