const express = require('express');
const logger = require('../src/logger');
const uuid = require('uuid/v4');
const store = require('./store');
const { isWebUri } = require('valid-url');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(store.bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title) {
      logger.error(`title is required`);
      return res.status(400).send('Tite is required.');
    }
    //import valid-url to check url validity
    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400).send('URL must be valid URL');
    }
    if (!description) {
      logger.error(`description is required`);
      return res.status(400).send('Description is required');
    }
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`invalid rating '${rating}' supplied.`);
      return res.status(400).send('Rating must be a number between 0 and 5');
    }
    //combine const id = uuid() with const bookmark to set defaults
    const bookmark = { id: uuid(), title, url, description, rating };

    store.bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${bookmark.id} created`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(b => b.id == id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found`);
      return res.status(400).send('Bookmark not found');
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = store.bookmarks.findIndex(b => b.id === b);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found`);
      return res.status(404).send('Not found.');
    }

    store.bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;
