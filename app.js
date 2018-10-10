var express = require('express');
var path = require('path');
var cors = require('cors');
var logger = require('morgan');
var bodyParser = require('body-parser');

const authMiddleware = require('./middlewares/authMiddleware');

const authController = require('./controllers/authController');
const accountController = require('./controllers/accountController');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/api/auth', authController);

// verify token and otp
app.use(authMiddleware.verifyToken);
app.use(authMiddleware.verifyOTP);

// Authorized API
app.use('/api/account', accountController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({"error": err.message})
});

module.exports = app;
