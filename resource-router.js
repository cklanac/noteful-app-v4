const express = require('express');
const { jwtAuth } = require('./middleware');

module.exports = (controller) => {
  const router = express.Router();
  router.use(jwtAuth);

  router.route('/')
    .get(controller.findAll)
    .post(controller.insert);

  router.route('/:id')
    .get(controller.findOne)
    .put(controller.modify)
    // .patch(controller.modify)
    .delete(controller.remove);
  return router;
};
