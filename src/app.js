var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contentsRouter = require('./routes/contents');
var platformsRouter = require('./routes/platforms');
var filterwordsRouter = require('./routes/filterwords');
var subscriptionsRouter = require('./routes/subscriptions');
var bookmarksRouter = require('./routes/bookmarks');
var requestRouter = require('./routes/requests');
var noticeRouter = require('./routes/notices');
var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

print("진행중");
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/contents', contentsRouter);
app.use('/platforms', platformsRouter);
app.use('/subscriptions',subscriptionsRouter);
app.use('/filterwords', filterwordsRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/requests', requestRouter);
app.use('/notices', noticeRouter);

module.exports = app;
