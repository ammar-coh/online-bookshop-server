const express = require('express');
const multer = require('multer');
const azureStorage = require('azure-storage');
const auth = require('../auth');
const bookController = require('../controllers/bookController');

const router = express.Router();

// Configure Azure Blob Storage
const blobService = azureStorage.createBlobService( process.env.AZURE_KEY );
const containerName = 'book'; // Replace with your actual container name

const upload = multer({
  storage: multer.memoryStorage(),
});

router.get('/list', auth, bookController.index);

// Update the route using multer middleware for image uploads to Azure Blob Storage
router.post('/list', auth, upload.single('image'), uploadToAzureBlobStorage, bookController.new);
router.put('/list/:bookId', auth, upload.single('image'), uploadToAzureBlobStorage, bookController.updating);
router.delete('/list/:bookId', auth, bookController.delete);

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
