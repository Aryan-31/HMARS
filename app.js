var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('express-flash');
const mongoose = require('mongoose');
const session = require('express-session');

require('dotenv').config();

const DB = process.env.DB

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var patientRouter = require('./routes/patient');
var doctorRouter = require('./routes/doctor');

var app = express();

mongoose.connect(DB)
    .then(() => console.log('MongoDB Database Connected'))
    .catch(err => console.log(err))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/patient',patientRouter);
app.use('/doctor',doctorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(cookieParser('keyboard cat'));
app.use(session({ 
    secret: 'keyboard cat',
    resave:false,
    rolling:true,
    saveUninitialized: false,
    cookie: { maxAge:7200000,     
              SameSite: 'lax',
              secure: false }
}));
app.use(flash());


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
