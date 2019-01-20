const express = require('express');
const { jwtAuth } = require('../middleware');
const controller = require('./tag.controller');

const router = express.Router();

router.use(jwtAuth);

router.route('/')
  .get(controller.findAll)
  .post(controller.insert);

router.route('/:id')
  .get(controller.findOne)
  .put(controller.modify)
  .delete(controller.remove);

module.exports = router;
