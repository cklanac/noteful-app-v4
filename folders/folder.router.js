const controller = require('./folder.controller');
module.exports = require('../resource-router')(controller);

// const express = require('express');
// const { jwtAuth } = require('../middleware');
// const controller = require('./folder.controller');

// const router = express.Router();

// router.use(jwtAuth);

// router.route('/')
//   .get(controller.findAll)
//   .post(controller.insert);

// router.route('/:id')
//   .get(controller.findOne)
//   .put(controller.modify)
//   .delete(controller.remove);

// module.exports = router;
