const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel")
const Cart = require("../models/cartModel");


exports.register = async (req, res) => {
  try {
    let { email, password, displayName, userName, } = req.body;
    const userNameAvailable = await User.findOne({ userName: userName });

    if (userNameAvailable) return res.status(400).json({ status: false, message: "user name already taken" })
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
    user.userName = userName
    user.password = passwordHash;
    user.displayName = displayName;
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
      return res.status(400).json({ message: "Please enter a correct email or create account first.", status: false, });
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

    if (user_updated) {
      res.status(200).json({
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
          email: user.email,
          userName: user.userName
        },
      });
    }
    else {
      res.status(400).json({
        status: false,
        message: "user doesn't exist"
      })
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ err: `Couldn't fint what the user in database or something went wrong` });

  }

};
exports.userList = async (req, res) => {
  try {
    const user = await User.find({});
    const userList = user.map((i) => ({
      id: i._id,
      email: i.email,
      displayName: i.displayName,
      imageURL: i.imageURL,
      is_online: i.is_online,
      userName: i.userName
    }));
    res.json({ userList });
  } catch (err) { }
};

exports.updating = async function (req, res) {
  try {
    const id = req.params.userId;
    const { userName, firstName, lastName, email, password, country, age, gender } = req.body;
    const updates = {
      firstName,
      lastName,
      email,
      country,
      ageBracket: age,
      gender,
      is_online: true,
      email,
      displayName: userName
    };

    if (req.file) {
      const imageUrl = req.imageUrl; // Get the image URL from req object
      updates.imageURL = imageUrl; // Set the image URL in the updates object
    }

    const options = { new: true };
    const user = await User.findByIdAndUpdate(id, updates, options);
    if (user) {
      res.status(200).json({
        status: true,
        user: user
      });
    } else {
      res.status(400).json({
        status: false,
        message: "User doesn't exist"
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the user." });
  }
};


// exports.updating = async function (req, res) {
//   console.log("????", req.file)
//   try {
//     const id = req.params.userId;
//     const { userName, firstName, lastName, email, password, country, age, gender } = req.body;
//     const updates = {
//       firstName,
//       lastName,
//       email,
//       country,
//       ageBracket: age,
//       gender,
//       is_online: true,
//       email,
//       displayName: userName
//     };
//     // if (req.file) {
//     //   // Handle the in-memory file differently
//     //   const buffer = req.file.buffer;
//     //   // Assuming you want to save the image as a Base64 encoded string
//     //   const base64Image = buffer.toString('base64');
//     //   updates.imageURL = `data:${req.file.mimetype};base64,${base64Image}`;
//     // }
//     if (req.file) {
//         const newUrl = req.file ? req.file.path : '';
//         updates.imageURL= req.protocol + '://' + req.get('host') + '/' + newUrl.replace(/\\/g, '/'); 
//         console.log("imge", updates)
//       }
//     const options = { new: true };
//     const user = await User.findByIdAndUpdate(id, updates, options);
//     const update = {
//       imageURL: user.imageURL,
//       country: user.country,
//       displayName: user.displayName,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       gender: user.gender,
//       is_online: user.is_online,
//       role: user.role,
//       id: user._id,
//       age: user.ageBracket,
//       userName: user.userName
//     }
//     if (user) {
//       res.status(200).json({
//         status: true,
//         user: update
//       });
//     } else {
//       res.status(400).json({
//         status: false,
//         message: "user doesn't exist"
//       })
//     }
//   } catch (error) {
//     res.status(500).json({ error: `Couldn't fint what the user in database or something went wrong` });

//   }
// };


exports.updatePassword = async function (req, res) {
  try {
    const id = req.params.userId;
    const { previousPassword, newPassword } = req.body;
    let user = await User.findById({
      _id: id,
    });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User doesn't exist"
      });
    }
    const currentPassword = user.password
    const passwordMatch = await bcrypt.compare(previousPassword, currentPassword)
    if (!passwordMatch) {
      return res.status(400).json({
        status: false,
        message: "Current password is incorrect!"
      });
    }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    // Update the password in the database
    user.password = passwordHash;
    await user.save();
    res.status(200).json({
      status: true,
      message: "Password changed"
    });
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
      id: user._id,
      userName: user.userName
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