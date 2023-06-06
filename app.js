var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let bodyParser = require("body-parser");
const cors = require("cors");
const Auth = require("./auth");
const { createServer } = require("http");
const { Server } = require("socket.io");
const ChatRoom = require("./chatRoomModel");
const User = require("./userModel");
const Notification = require("./notificationModel");
//import cors from 'cors';

let mongoose = require("mongoose");

require("dotenv").config({ path: "./.env" });
// console.log('secret', process.env.JWT_SECRET)

// Setup server port
var port = process.env.PORT || 8081;

// Send message for default URL
//app.get('/', (req, res) => res.send('Hello World with Express'));

var productRouter = require("./routes/product");
var usersRouter = require("./routes/users");
var cartsRouter = require("./routes/cart");
var chatRoomRouter = require("./routes/chatRoom");
var notificationRouter = require("./routes/notification");

var app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
  },
});
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Connect to Mongoose and set connection variable
mongoose.set("strictQuery", false);
const connection_url = "mongodb://localhost:27017/cartdb";
mongoose.connect(connection_url, { useNewUrlParser: true });
mongoose.connection.once("open", () => {
  console.log("DB connected!!!");
});

// Added check for DB connection

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/products", productRouter);
app.use("/users", usersRouter);
app.use("/cart", cartsRouter);
app.use("/chat", chatRoomRouter);
app.use("/notification", notificationRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// socet.io user
const userSocketMap = new Map();

// Socket.IO
io.on("connection", (socket) => {

  socket.on("setUserId", ({ userId }) => {
    // Store the user ID and socket ID association
    userSocketMap.set(userId, socket.id);
  });
  // Join Private Room
  socket.on("private_room", async ({ room_id, userID, participant }) => {
    socket.join(room_id);
    await ChatRoom.collection.findOne(
      { roomID: room_id },
      async (err, data) => {
        if (err) {
          console.error("Error finding chatroom:", err);
          return;
        }

        if (data) {
          let messagesOfParticipant = await data.messages;
          let user_joining_status = await data.participant_online_status;
          for (let i = 0; i < user_joining_status?.length; i++) {
            if (user_joining_status[i]._id.toString() == userID) {
              user_joining_status[i].status = true;
            }
          }
          for (let i = 0; i < messagesOfParticipant.length; i++) {
            if (messagesOfParticipant[i]?.author_id == participant) {
              messagesOfParticipant[i].isRead = true;
            }
          }
          const messageUpdated = {
            messages: messagesOfParticipant,
            participant_online_status: user_joining_status,
          };
          let options = { new: true };

          const draft = await ChatRoom.findByIdAndUpdate(
            data._id.toString(),
            messageUpdated,
            options
          );

        } else {
          console.log("chat room not found???");
        }
      }
    );
  });
  // leave private room
  socket.on("leave_private_room", async ({ roomID, userID }) => {
    await ChatRoom.collection.findOne({ roomID }, async (err, data) => {
      if (err) {
        console.error("Error finding chatroom:", err);
        return;
      }

      if (data) {
        let user_leaving_status = await data.participant_online_status;
        for (let i = 0; i < user_leaving_status?.length; i++) {
          if (user_leaving_status[i]?._id.toString() == userID) {
            user_leaving_status[i].status = false;
          }
        }

        const statusUpdated = {
          participant_online_status: user_leaving_status,
        };
        let options = { new: true };

        const draft = await ChatRoom.findByIdAndUpdate(
          data._id.toString(),
          statusUpdated,
          options
        );
      } else {
        console.log("chat room not found???");
      }
    });
  });
  // send message
  socket.on("send_message", async (data) => {
    const receipents_status = async ({ room }) => {
      for (let i = 0; i < room.participant_online_status?.length; i++) {
        if (
          room.participant_online_status[i]._id?.toString() == data.recepient_id
        ) {
          data.recepient_status = room.participant_online_status[i].status;

        }
      }

    };

    await ChatRoom.collection.findOne({ roomID: data.roomID }, (err, data) => {
      if (err) {
        console.error("Error finding chatroom:", err);
        return;
      }

      if (data) {
        receipents_status({ room: data });
      } else {
        console.log("error");
      }
    });

    const saveMessageDB = async ({ room }) => {
      let status;
      for (let i = 0; i < room.participant_online_status?.length; i++) {
        if (
          room.participant_online_status[i]._id?.toString() == data.recepient_id
        ) {
          status = room.participant_online_status[i].status;
        }
      }

      const message = {
        author: data.author,
        message: data.message,
        author_id: data.author_id,
        isRead: status,
      };

      await room.messages.push(message);
      const messageUpdated = {
        messages: room.messages,
      };
      let options = { new: true };
      const chatroomMessagesSaved = await ChatRoom.findByIdAndUpdate(
        room._id.toString(),
        messageUpdated,
        options
      );
      let real_time_chat_data = {
        messages: chatroomMessagesSaved.messages,
        roomID: chatroomMessagesSaved.roomID,
        receipent_status: data,
      }
      socket.to(data.roomID).emit("receive_message", real_time_chat_data);
      socket.emit("receive_message", real_time_chat_data)
    };
    await ChatRoom.collection.findOne({ roomID: data.roomID }, (err, data) => {
      if (err) {
        console.error("Error finding chatroom:", err);
        return;
      }

      if (data) {
        saveMessageDB({ room: data });
      } else {
        console.log("chat room not found");
      }
    });
  });
  // notification channel
  socket.on(
    "notification_channel",
    async ({ message, userID, participant }) => {

      let notification = {
        author: message.author,
        author_id: message.author_id,
        message: message.message,
        displayName: message.displayName
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
  );
  //notification delete room
  socket.on("delete_notification_message", async ({ userID, sender_id }) => {
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
  });


  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);

  });
});

httpServer.listen(port, function () {
  console.log("Port is running" + " " + port);
});

module.exports = app;
