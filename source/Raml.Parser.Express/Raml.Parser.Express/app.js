var express = require('express');
var path = require('path');
var logger = require('morgan');

var routes = require('./routes/index');

var app = express();

app.use(logger('dev'));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


module.exports = app;
