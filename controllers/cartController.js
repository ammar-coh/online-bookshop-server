const Product = require("../models/bookModel");
var mongoose = require("mongoose");
const Auth = require("../auth");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");

// Handle show user cart
exports.index = async (req, res) => {
  let id = await req.query.id;
  let getUser = await User.findById({
    _id: id,
  });

  let cartId = await getUser?.cart?._id.toString();
  let userCart = await Cart.findById({
    _id: cartId,
  });
 
  res.json(userCart);
};

// Handle add new product to cart
exports.new = async function (req, res) {

  var userId = req.body.id;
  var product_id = req.body.product_id;
  let user = await User.findById(userId);
  let cart_id = user?.cart?._id.toString();
  let user_cart = await Cart.findById({ _id: cart_id })
  let product = await Product.findById({ _id: product_id })
  let item = {
    _id: product?._id,
    image: product?.image,
    price: product?.price,
    qty: 1
  }

  const product_status = user_cart?.products.find((c) => c._id == product_id);
  if (product_status != undefined) {
    for (let i = 0; i < user_cart.products?.length; i++) {
      if (user_cart.products[i]?._id?.toString() == product_id) {
        user_cart.products[i].qty++

      }
    }
  }
  else {
    user_cart.products.push(item)
  }
  let updatedProductsArray = user_cart.products
  var totalQty = [];
  var sum = 0;
  user_cart?.products.map((i) => {
    totalQty.push(i.qty);
    sum += i.qty;
  });
  let id = cart_id;
  let updates = { products: updatedProductsArray, totalItems: sum};
  let options = { new: true };
  let my_cart = await Cart.findByIdAndUpdate(id, updates, options);

  res.json({
    message: "Product added",
    data: my_cart,
  });


  
};

// Handle delete product from cart
exports.delete = async function (req, res) {
  try {
    let id = req.body.id;
    let product_id = req.body.product_id;

    if (!id || !product_id) {
      return res.status(400).json({ error: "User ID and product ID are required" });
    }

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let cart_id = user?.cart?._id?.toString();
    if (!cart_id) {
      return res.status(404).json({ error: "Cart not found for user" });
    }

    let user_cart = await Cart.findById(cart_id);
    let product_array = user_cart.products;
    const getProduct = product_array?.find((i) => i._id == product_id);
    
    if (!getProduct) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    const index = product_array.findIndex((i) => i == getProduct);
    product_array.splice(index, 1);
    var total = user_cart.totalItems - getProduct.qty;
  
    let updates = { products: product_array, totalItems: total};
    let options = { new: true };
    let my_cart = await Cart.findByIdAndUpdate(cart_id, updates, options);
    res.json(my_cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
