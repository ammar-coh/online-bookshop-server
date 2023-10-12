var express = require('express');
var router = express.Router();
const auth = require("../auth");


var searchController = require('../controllers/searchController');
router.get('/book',auth,searchController.index)

module.exports = router;
