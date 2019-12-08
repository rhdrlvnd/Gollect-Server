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

require('./routes/nonVideoCrowler/overwatchInven');
require('./routes/nonVideoCrowler/joongangNews');
require('./routes/nonVideoCrowler/hasDecConsulting');
require('./routes/nonVideoCrowler/dcInsideInbangGall');
require('./routes/nonVideoCrowler/ajouNotice');

require('./routes/videoCrowler/kakaotvLeedongwook');
require('./routes/videoCrowler/kakaotvNewCategory');
require('./routes/videoCrowler/navertvM2');
require('./routes/videoCrowler/youtubeAlganzi');
require('./routes/videoCrowler/youtubeBokyemtv');
require('./routes/videoCrowler/youtubeBongjoon');
require('./routes/videoCrowler/youtubeJJoNak');
require('./routes/videoCrowler/youtubeJungyoonjong');
require('./routes/videoCrowler/youtubeKimduckbaeStory');
require('./routes/videoCrowler/youtubeKimyoonhwan');
require('./routes/videoCrowler/youtubeMinhotau');
require('./routes/videoCrowler/youtubeOmeKim');
require('./routes/videoCrowler/youtubePeangsu');
require('./routes/videoCrowler/youtubeRealKim');
require('./routes/videoCrowler/youtuberyujehong');
require('./routes/videoCrowler/youtubeTaekshin');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
