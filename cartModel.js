var mongoose = require("mongoose");

const cart = mongoose.Schema({
  products: [
    {
      items: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      qty: { type: Number, default: 0 },
      image: String,
      price: Number,
    },
  ],

  totalItems: { type: Number, default: 0 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});
var Cart = (module.exports = mongoose.model("carts", cart));

module.exports = Cart;
