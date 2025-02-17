var mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    path: { type: String, required: true, unique: true }
  });
  
  categorySchema.index({ name: 1 });
  categorySchema.index({ path: 1 });
  
  const Category = mongoose.model("categories", categorySchema);
  module.exports = Category;
  