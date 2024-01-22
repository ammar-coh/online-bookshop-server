const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

exports.messageNotification = async({ message, userID, participant,socket,userSocketMap })=>{
    let notification = {
        authorUsername: message.authorUserName,
        author_id: message.author_id,
        message: message.message,
        displayName: message.displayName,
        imageURL: message.authorImage,
        roomID: message.roomID
      };
      let finalNotificationObject;

      let recepient = await User.findById({
        _id: participant,
      });

      let recepient_new_notification_id =
        await recepient.notification._id.toString();
      let recepient_notifications = await Notification.findById({
        _id: recepient_new_notification_id,
      });
      for (let i = 0; i < recepient_notifications?.messages?.length; i++) {
        if (recepient_notifications.messages[i].author_id == userID) {
          recepient_notifications.messages.splice(i, 1);
          i--;
        }
      }
      recepient_notifications.messages.push(notification);
      let updatedMessagesArray = recepient_notifications.messages;
      let messageUpdated = {
        messages: updatedMessagesArray,
        total: updatedMessagesArray.length
      };
      let options = { new: true };
      let notificationsMessagesSaved = await Notification.findByIdAndUpdate(
        recepient_new_notification_id,
        messageUpdated,
        options
      );
      finalNotificationObject = await notificationsMessagesSaved;
      let participant_socket_id = userSocketMap.get(participant);
      socket.to(participant_socket_id).emit("notification_message", { recipient_id: participant, data: finalNotificationObject });
}

exports.deleteMessagenotification=async ({userID, sender_id,socket})=>{
    let findUser = await User.findById({
        _id: userID
      })
  
  
      let my_notifications = await Notification.findById({
        _id: findUser.notification._id.toString(),
      });
  
      for (let i = 0; i < my_notifications?.messages?.length; i++) {
        if (my_notifications.messages[i].author_id == sender_id) {
          my_notifications.messages.splice(i, 1);
          i--;
        }
      }
      let updated_notification_messages = my_notifications.messages
  
      let delete_notifications_messages_updated = await Notification.findByIdAndUpdate(
        findUser.notification._id.toString(),
        { messages: updated_notification_messages, total: updated_notification_messages.length },
        { new: true }
      );
      socket.emit("notification_delete", { recipient_id: userID, data: delete_notifications_messages_updated });
    }

 