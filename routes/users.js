

require('dotenv').config()
var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const auth = require("../auth");

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
console.log("cv",credentials)
const storage = new Storage({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },// Path to your Google Cloud Platform credentials JSON file
});

const bucketName = 'userprofile-image';
const bucket = storage.bucket(bucketName);

const multerStorage = multer.memoryStorage();

const multerUpload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

router.route('/register').post(userController.register);
router.route('/login').post(userController.login);
router.route('/userList').get(userController.userList);
router.put('/update/:userId', auth, multerUpload.single('imageFile'), (req, res) => {
  userController.updating(req, res, bucket,bucketName); // Pass the bucket to the userController.updating function
});
router.put('/logout/:userId', userController.logout);
router.put('/change_password/:userId', auth, userController.updatePassword);

module.exports = router;

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

// const express = require('express');
// const multer = require('multer');
// const azureStorage = require('azure-storage');
// const userController = require('../controllers/userController');
// const auth = require('../auth');

// const router = express.Router();

// // Configure Azure Blob Storage
// const blobService = azureStorage.createBlobService(process.env.AZURE_KEY);
// const containerName = 'user'; // Replace with your actual container name

// const upload = multer({
//   storage: multer.memoryStorage(),
// });
// router.route('/register').post(userController.register);
// router.route('/login').post(userController.login);
// router.route('/userList').get(userController.userList);

// // Update the route using multer middleware for image uploads to Azure Blob Storage
// router.put('/update/:userId', auth, upload.single('imageFile'), uploadToAzureBlobStorage, userController.updating);
// router.put('/logout/:userId', userController.logout);
// router.put('/change_password/:userId', auth, userController.updatePassword);

// function uploadToAzureBlobStorage(req, res, next) {
//   if (!req.file) {
//     return next();
//   }

//   const blobName = `${req.file.fieldname}-${Date.now()}-${req.file.originalname}`;
//   const stream = require('stream');
//   const bufferStream = new stream.PassThrough();
//   bufferStream.end(req.file.buffer);

//   blobService.createBlockBlobFromStream(containerName, blobName, bufferStream, req.file.size, (error, result, response) => {
//     if (error) {
//       return next(error);
//     }

//     // Set the image URL in the req object, so you can save it to your database if needed
//     req.imageUrl = result.name;
//     next();
//   });
// }


// module.exports = router;
