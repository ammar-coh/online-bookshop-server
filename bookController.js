const Book = require("./bookModel");
//var mongoose = require('mongoose');
const Auth = require("./auth");

// Handle index actions

exports.index = async (req, res) => {
  const list = await Book.find();
  res.status(200).json(list);
};
// Handle create new product
exports.new = async function (req, res) {
  let { price, rating, stock, title, author, description, category } = req.body;
  var book = new Book();
  var currentList = await Book.find();
  Object.assign(book, {
    price: price,
    title: title,
    author: author,
    rating: rating,
    stock: stock,
    description: description,
    category: category
  });
  if (req.file) {
    const newUrl = req.file ? req.file.path : '';
    book.image = req.protocol + '://' + req.get('host') + '/' + newUrl.replace(/\\/g, '/'); 
  }
  book.save();
  currentList.push(book);
  res.status(200).json({
    status:true,
    message: "new book has been added!",
    data: book,
  });
};

// Handle update product info
exports.updating = async function (req, res) {
  try {
    const id = req.params.bookId;
    const { title, author, price, rating, stock, description, category } = req.body;
    const updates = {
      title,
      author,
      price,
      rating,
      stock,
      description,
      category,
    };
    if (req.file) {
      const url = req.file ? req.file.path : '';
      updates.image = req.protocol + '://' + req.get('host') + '/' + url.replace(/\\/g, '/'); // Add the filename of the uploaded image to the book data
    }
    const options = { new: true };
    const book = await Book.findByIdAndUpdate(id, updates, options);
    if (book) {
      res.status(200).json({
        status: true,
        book: book
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Book doesn't exist"
      })
    }
  } catch (error) {
    res.status(500).json({ error: `Couldn't fint what the book in database or something went wrong` });

  }
};
// Handle delete product info
exports.delete = async function (req, res) {
  const id = await req.params.bookId;
  try {
    const options = { new: true };
    await Book.findByIdAndDelete(id, options);
    const checkBookDeleted = await Book.findById({
      _id: id,
    });
    var updatedBookList = await Book.find();

    if (!checkBookDeleted) {
      res.status(200).json({
        status: true,
        updatedBookList: updatedBookList
      })
    }
    else {
      res.status(400).json({
        status: false,
        updatedBookList: updatedBookList
      })
    }
  }
  catch (error) {
    res.status(500).json({ error: 'An error occurred while removing the book.' });

  }
};
