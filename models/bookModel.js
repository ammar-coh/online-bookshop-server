//import mongoose from 'mongoose';
var mongoose = require("mongoose");
const book = mongoose.Schema({
  title:String,
  author:String,
  image: String,
  price: Number,
  rating: Number,
  stock: Number,
  description:String,
  category:String
});
// book.index({ title: 1, author: 1 });
book.index({ 'title': 'text', 'author': 'text'});
var Book = (module.exports = mongoose.model("books", book));

module.exports = Book;
