var express = require('express');
var router = express.Router();
const auth = require("../auth");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads'); // The directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname);
  },
});

const upload = multer({ storage });


var bookController = require('../controllers/bookController');
router.get('/list',auth,  bookController.index)
router.post('/list',auth, upload.single('image'), bookController.new);
router.put('/list/:bookId', auth, upload.single('image'), bookController.updating)
router.delete('/list/:bookId',auth, bookController.delete);





module.exports = router;
