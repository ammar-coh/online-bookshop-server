const Product = require("./bookModel");
//var mongoose = require('mongoose');
const Auth = require("./auth");

// Handle index actions

exports.index = async (req, res) => {
  const list = await Product.find();
  res.json(list);
};
// Handle create new product
exports.new = async function (req, res) {
  let { image, price, rating, stock, title, author,description,category } = req.body;
  var product = new Product();
  var currentList = await Product.find();
  Object.assign(product, {
    image: image,
    price: price,
    title:title, 
    author:author,
    rating: rating,
    stock: stock,
    description:description,
    category:category
  });
  product.save();
  currentList.push(product);

  var updatedList = currentList;
  res.json({
    message: "new product has been added!",
    data: product,
    updatedProductlist: updatedList,
  });
};

// Handle update product info
exports.updating = async function (req, res) {
  const id = req.body.book_id;
  const updates = req.body;
  const options = { new: true };
  const book = await Product.findByIdAndUpdate(id, updates, options);
  res.json(book);
};
// Handle delete product info
exports.delete = async function (req, res) {
  const id = req.body.book_id;
  const options = { new: true };
  const deletedBook = await Product.findByIdAndDelete(id, options);
  console.log(deletedBook);
  res.json(deletedBook);
};
