const Notification = require("./notificationModel");
const { ObjectId } = require("mongodb");
const Auth = require("./auth");
const bodyParser = require("body-parser");
const User = require("./userModel");
// Handle index actions

exports.index = async (req, res) => {
  var user_id = await req.query?.id;
  let find_user = await User.findById({ _id: user_id });
  let notification_id = await find_user.notification._id.toString()
  let user_notification = await Notification.findById({ _id: notification_id })

  if (user_notification) {
    res.json({
      message: "your notifications ",
      status: true,
      data: { notification: user_notification, recipient_id: user_id }
    });
  } else {
    res.json({
      message: "there were some issues at the server side",
      status: false,
    });
  }
}
// Handle create new product
exports.new = async function (req, res) {
  console.log("req.body", req.body);
  var userId = req.body.id;
  const user = await User.findById({ _id: userId });
  var convertUserCollectionToObj = user.toObject();
  console.log(convertUserCollectionToObj.hasOwnProperty("notification"))
  if (!convertUserCollectionToObj.hasOwnProperty("notification")) {
    let notification = new Notification();
    notification.save();
    console.log("user", user);
    user.notification = notification;
    user.save();
    var user_notification_id = user.notification._id.toString();
    const notification_messages = await Notification.findById({
      _id: user_notification_id,
    });
    console.log("user notification", notification_messages)
  }
  else {
    console.log("user document has a notifications property in database")
  }

};
