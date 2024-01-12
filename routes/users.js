const express = require('express');
const multer = require('multer');
const azureStorage = require('azure-storage');
const userController = require('../controllers/userController');
const auth = require('../auth');

const router = express.Router();

// Configure Azure Blob Storage
const blobService = azureStorage.createBlobService( process.env.AZURE_KEY);
const containerName = 'user'; // Replace with your actual container name

const upload = multer({
  storage: multer.memoryStorage(),
});
router.route('/register').post(userController.register);
router.route('/login').post(userController.login);
router.route('/userList').get(userController.userList);

// Update the route using multer middleware for image uploads to Azure Blob Storage
router.put('/update/:userId', auth, upload.single('imageFile'), uploadToAzureBlobStorage, userController.updating);
router.put('/logout/:userId', userController.logout);
router.put('/change_password/:userId', auth, userController.updatePassword);

function uploadToAzureBlobStorage(req, res, next) {
  if (!req.file) {
    return next();
  }

  const blobName = `${req.file.fieldname}-${Date.now()}-${req.file.originalname}`;
  const stream = require('stream');
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  blobService.createBlockBlobFromStream(containerName, blobName, bufferStream, req.file.size, (error, result, response) => {
    if (error) {
      return next(error);
    }

    // Set the image URL in the req object, so you can save it to your database if needed
    req.imageUrl = result.name;
    next();
  });
}

module.exports = router;
