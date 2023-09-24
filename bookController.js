const Book = require("./bookModel");
//var mongoose = require('mongoose');
const Auth = require("./auth");

// Handle index actions

exports.index = async (req, res) => {
  const list = await Book.find();
  res.json(list);
};
// Handle create new product
exports.new = async function (req, res) {
  let { image, price, rating, stock, title, author, description, category } = req.body;
  var book = new Book();
  var currentList = await Book.find();
  Object.assign(book, {
    image: image,
    price: price,
    title: title,
    author: author,
    rating: rating,
    stock: stock,
    description: description,
    category: category
  });
  book.save();
  currentList.push(book);

  var updatedList = currentList;
  res.json({
    message: "new product has been added!",
    data: book,
    updatedBooklist: updatedList,
  });
};

// Handle update product info
exports.updating = async function (req, res) {
  try {
    const id = req.params.bookId;
    const updates = req.body;
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
