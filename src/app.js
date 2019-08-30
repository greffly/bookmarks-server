require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const validateTokenBearer = require('./validate-bearer-token');
const bookmarksRouter = require('./bookmarks/bookmarks-router');
const errorHandler = require('./error-handler');

const app = express();

app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test'
  })
);
app.use(cors());
app.use(helmet());
app.use(validateTokenBearer);

app.use('/api/bookmarks', bookmarksRouter);

app.get('/', (req, res) => {
  res.send('This app is gonna be awesomesauce!');
});

app.use(errorHandler);

module.exports = app;
