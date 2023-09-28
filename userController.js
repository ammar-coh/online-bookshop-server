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
        .json({ message: "Please enter a correct email or create account first.", status: false, });
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({
      message: "Please enter a correct password", status: false,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);


    user.is_online = true
    let id = user?._id
    let update = { is_online: true }
    let option = { new: true }
    let user_updated = await User.findByIdAndUpdate(id, update, option)

    res.json({
      message: "Login succesfull",
      token,
      status: true,
      user: {
        id: user._id,
        displayName: user.displayName,
        role: user.role,
        is_online: user.is_online,
        lastName: user.lastName,
        firstName: user.firstName,
        age: user.ageBracket,
        imageURL: user.imageURL,
        country: user.country,
        gender: user.gender,
      },
    });
  } catch (err) { }

};
exports.userList = async (req, res) => {
  try {
    const user = await User.find({});
    const userList = user.map((i) => ({
      id: i._id,
      email:i.email,
      displayName: i.displayName,
      imageURL: i.imageURL,
      is_online: i.is_online
    }));
    res.json({ userList });
  } catch (err) { }
};


exports.updating = async function (req, res) {
  try {
    const id = req.params.userId;
    console.log('id', id)
    const salt = await bcrypt.genSalt();

    const { displayName, firstName, lastName, email, password, country, age, gender } = req.body;
    const updates = {
      displayName,
      firstName,
      lastName,
      email,
      country,
      ageBracket: age,
      gender,
      is_online: true,
      email
    };
    if (password) {
      const passwordHash = await bcrypt.hash(password, salt);
      upadate.password = passwordHash
    }
    if (req.file) {
      const url = req.file ? req.file.path : '';
      updates.imageURL = req.protocol + '://' + req.get('host') + '/' + url.replace(/\\/g, '/'); // Add the filename of the uploaded image to the book data
    }
    const options = { new: true };
    const user = await User.findByIdAndUpdate(id, updates, options);
    const update = {
      imageURL: user.imageURL,
      country: user.country,
      displayName: user.displayName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      is_online: user.is_online,
      role: user.role,
      id: user._id,
      age: user.ageBracket
    }
    if (user) {
      res.status(200).json({
        status: true,
        user: update
      });
    } else {
      res.status(400).json({
        status: false,
        message: "user doesn't exist"
      })
    }
  } catch (error) {
    res.status(500).json({ error: `Couldn't fint what the user in database or something went wrong` });

  }
};

exports.logout = async function (req, res) {
  try {
    const id = req.params.userId;
    const is_onlineStatus = {
      is_online: false,
    };
    const options = { new: true };
    const user = await User.findByIdAndUpdate(id, is_onlineStatus, options);
    const update = {
      is_online: user.is_online,
    }
    if (user) {
      res.status(200).json({
        status: true,
        user: update
      });
    } else {
      res.status(400).json({
        status: false,
        message: "logout failed"
      })
    }
  } catch (error) {
    res.status(500).json({ error: `Couldn't fint what the user in database or something went wrong` });

  }
};