const ChatRoom = require("../models/chatRoomModel");
const message = require("./message")
const notification = require("./notification")
const User = require("../models/userModel")
const userSocketMap = new Map();

exports.socketModule = (io) => {
  io.on("connection", (socket) => {
    socket.on("setUserId", ({ userId }) => {
      // Store the user ID and socket ID association
      userSocketMap.set(userId, socket.id);
    });
    socket.on("join_login_room_refresh", async (data) => {
      socket.join("login_users")
      const online_users_refresh = await User.find({ is_online: true }).select('_id userName')
        .exec().then((onlineUsers) => {
          const formattedUsers = onlineUsers.map(user => ({
            userName: user.userName,
            id: user._id.toString(),
          }))
          return formattedUsers
        });
      socket.emit("userOnline", online_users_refresh);
    });
    socket.on("join_login_room", async (data) => {
      socket.join("login_users")
      const online_users = await User.find({ is_online: true }).select('_id userName')
        .exec().then((onlineUsers) => {
          const formattedUsers = onlineUsers.map(user => ({
            userName: user.userName,
            id: user._id.toString(),
          }))
          return formattedUsers
        });
      io.emit("userOnline", online_users);
    });
    socket.on("leave_login_room", async (data) => {
      socket.leave("login_users")
      const offline_users = await User.find({ is_online: true }).select('_id userName')
      .exec().then((onlineUsers) => {
        // Convert ObjectId to string for each user
        const formattedUsers = onlineUsers.map(user => ({
          userName: user.userName,
          _id: user._id.toString(),
        }))
        return formattedUsers
      });
    io.emit("userOnline", offline_users);
    });
    // Join Private Room
    socket.on("private_room", async ({ room_id, userID, participant }) => {
      socket.join(room_id);
      message.privateRoom({ room_id, userID, participant })
    });
    // leave private room
    socket.on("leave_private_room", async ({ roomID, userID }) => {
      message.leaveRoom({ roomID, userID })
    });
    // send message
    socket.on("send_message", async (data) => {
      message.sendMessage(data, socket)
    });
    // notification channel
    socket.on("notification_channel", async ({ message, userID, participant }) => {
      notification.messageNotification({ message, userID, participant, socket, userSocketMap })
    }
    );
    //notification delete room
    socket.on("delete_notification_message", async ({ userID, sender_id }) => {
      notification.deleteMessagenotification({ userID, sender_id, socket })
    }
    );
    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);

    });
  });
}


