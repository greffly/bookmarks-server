const express = require('express');
const logger = require('../logger');
const xss = require('xss');
const { isWebUri } = require('valid-url');
const bookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating)
});

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    bookmarksService
      .getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`);
        return res
          .status(400)
          .send({ error: { message: `${field} is required.` } });
      }
    }
    const { title, url, description, rating } = req.body;
    //import valid-url to check url validity
    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res
        .status(400)
        .send({ error: { message: `'url' must be valid URL` } });
    }
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`invalid rating '${rating}' supplied.`);
      return res.status(400).send({
        error: { message: `'rating' must be a number between 0 and 5` }
      });
    }
    const bookmark = { title, url, description, rating };

    bookmarksService
      .insertBookmark(req.app.get('db'), bookmark)
      .then(bookmark => {
        logger.info(`Bookmark with id ${bookmark.id} created`);
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .all((req, res, next) => {
    const { bookmark_id } = req.params;

    bookmarksService
      .getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmark_id} not found`);
          return res
            .status(400)
            .json({ error: { message: `Bookmark not found` } });
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeBookmark(res.bookmark));
  })
  .delete((req, res, next) => {
    const { bookmark_id } = req.params;
    bookmarksService
      .deleteBookmark(req.app.get('db'), bookmark_id)
      .then(numRowsAffected => {
        logger.info(`Bookmark with id ${id} deleted`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarksRouter;
