var express = require('express');
var router = express.Router();
var userController = require('../userController');
const multer = require('multer');
const auth = require("../auth");
/* GET users listing. */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/user'); // The directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + file.originalname);
    },
  });
  
  const upload = multer({ storage });


router.route('/register').post(userController.register);
router.route('/login').post(userController.login);
router.route('/userList').get(userController.userList);
router.put('/update/:userId', auth, upload.single('imageFile'), userController.updating)
router.put('/logout/:userId', userController.logout)
router.put('/change_password/:userId', auth, userController.updatePassword)



module.exports = router;
