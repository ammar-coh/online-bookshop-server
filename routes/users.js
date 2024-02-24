
require('dotenv').config();
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const auth = require('../auth');

// Configure Google Cloud Storage
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const storage = new Storage({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  }
});
const bucketName = 'userprofile-image'; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

// Multer middleware configuration
const multerStorage = multer.memoryStorage();
const multerUpload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/userList', userController.userList);

// Update user profile route with multer middleware for image uploads to Google Cloud Storage
router.put('/update/:userId', auth, multerUpload.single('imageFile'), uploadToGoogleCloudStorage, (req, res) => {
  userController.updating(req, res, bucket, bucketName);
});

router.put('/logout/:userId', userController.logout);
router.put('/change_password/:userId', auth, userController.updatePassword);

// Function to upload to Google Cloud Storage
function uploadToGoogleCloudStorage(req, res, next) {
  if (!req.file) {
    return next();
  }

  const blobName = `${req.file.fieldname}-${Date.now()}-${req.file.originalname}`;
  const blob = bucket.file(blobName);

  const blobStream = blob.createWriteStream({
    resumable: false,
    gzip: true,
  });

  blobStream.on('error', (err) => {
    next(err);
  });

  blobStream.on('finish', () => {
    // Set the image URL in the req object, so you can save it to your database if needed
    req.imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
}

module.exports = router;


// require('dotenv').config()
// var express = require('express');
// var router = express.Router();
// var userController = require('../controllers/userController');
// const multer = require('multer');
// const { Storage } = require('@google-cloud/storage');
// const auth = require("../auth");

// const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
// const storage = new Storage({
//   projectId: credentials.project_id,
//   credentials: {
//     client_email: credentials.client_email,
//     private_key: credentials.private_key,
//   },// Path to your Google Cloud Platform credentials JSON file
// });

// const bucketName = 'userprofile-image';
// const bucket = storage.bucket(bucketName);

// const multerStorage = multer.memoryStorage();

// const multerUpload = multer({
//   storage: multerStorage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB file size limit
//   }
// });

// router.route('/register').post(userController.register);
// router.route('/login').post(userController.login);
// router.route('/userList').get(userController.userList);
// router.put('/update/:userId', auth, multerUpload.single('imageFile'), (req, res) => {
//   userController.updating(req, res, bucket,bucketName); // Pass the bucket to the userController.updating function
// });
// router.put('/logout/:userId', userController.logout);
// router.put('/change_password/:userId', auth, userController.updatePassword);

// module.exports = router;

// var express = require('express');
// var router = express.Router();
// var userController = require('../controllers/userController');
// const multer = require('multer');
// const auth = require("../auth");
// /* GET users listing. */

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/user'); // The directory where uploaded files will be stored
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now() + file.originalname);
//     },
//   });
  
//   const upload = multer({ storage });


// router.route('/register').post(userController.register);
// router.route('/login').post(userController.login);
// router.route('/userList').get(userController.userList);
// router.put('/update/:userId', auth, upload.single('imageFile'), userController.updating)
// router.put('/logout/:userId', userController.logout)
// router.put('/change_password/:userId', auth, userController.updatePassword)



// module.exports = router;

