var express = require('express');
var router = express.Router();
const auth = require("../auth");

/* GET home page. */
// Product routes
var bookController = require('../bookController');
router.get('/list',auth,  bookController.index)
router.post('/list', bookController.new);
router.put('/list/:bookId', auth, bookController.updating)
router.delete('/list/:bookId',auth,  bookController.delete);





module.exports = router;
