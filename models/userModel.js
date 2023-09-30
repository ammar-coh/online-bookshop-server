const mongoose = require("mongoose");
const users = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userName:{type:String, required:true},
  password: { type: String, required: true, minlength: 6 },
  gender: { type: String,  default: "male" },
  country:{type: String, default: "United States"},
  lastName:String,
  firstName: String,
  ageBracket:String,
  imageURL:String,
  displayName: { type: String },
  is_online: { type: Boolean, default: false },
  role: { type: String, enum: ["admin", "basic"], default: "basic" },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
  },
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "notification",
  },


});
module.exports = mongoose.model("users", users);
