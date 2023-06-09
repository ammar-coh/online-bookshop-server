const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./userModel");
const Notification = require("./notificationModel")
const Cart = require("./cartModel");


exports.register = async (req, res) => {
  try {
    let { email, password, user_name, } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    let notification = new Notification()      
    notification.save()

    let cart = new Cart()             
    cart.save()

    const user = new User();
    user.notification = notification
    user.cart = cart
    user.email = email;
    user.password = passwordHash;
    user.displayName = user_name;
    user.role = "admin";
    user.save();

    res.json({ user, confirm: "registered" });
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered." });
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  

    user.is_online = true
    let id = user?._id
    let update = { is_online: true }
    let option = { new: true }
    let user_updated = await User.findByIdAndUpdate(id, update, option)

    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        role: user.role,
        socketID: user.socketID,
        is_online: user.is_online,
      },
    });
    res.json("welcome");
  } catch (err) { }

};
exports.userList = async (req, res) => {
  try {
    const user = await User.find({});
    const userList = user.map((i) => ({
      id: i._id,
      displayName: i.displayName,
    }));
    res.json({ userList });
 } catch (err) { }
};

exports.loginData = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    res.json("welcome");
  } catch (err) { }

  //   res.json()
};
