var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/web/index');
const authRouter = require('./routes/web/auth.js');
const authApiRouter = require('../nodejs_account/routes/api/auth.js')
//导入account接口的路由文件
const accountRouter = require('./routes/api/account')
//导入express-session
const session = require('express-session');
const MongoStore = require('connect-mongo')
//导入配置项
const { DBHOST, DBPORT, DBNAME } = require('./config/config.js')
var app = express();
//设置session的中间件
app.use(session({
  name: 'sid',//设置cookie的name，默认是connect.sid
  secret: 'atguigu',//参与加密的字符串（又称签名
  saveUninitialized: false,//是否为每次请求都设置一个cookie才存储session的id
  resave: true,//是否每次在请求时都重新保存session
  store: MongoStore.create({
    mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`//数据库的连接配置
  }),
  cookie: {
    httpOnly: true,//开启后前端无法通过JS操作
    maxAge: 1000 * 60 * 60 * 24 * 7//控制sessionID的过期时间的
  }
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', accountRouter)
app.use('/', authRouter)
app.use('/api', authApiRouter)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  //响应404
  res.render('404');
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
