const path = require('path');
const express = require('express');

const app = express();

app.use('/', express.static(path.join(__dirname, 'dist')));

app.use(function (req, res, next) {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

//dev errors
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.resnder('error', {
    message: err.message,
    error: {},
  });
});

const server = app.listen(3000, () => {
  console.log('Listening on port 3000');
});

module.exports = app;
