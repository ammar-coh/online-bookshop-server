var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const {socketModule} = require("./sockets/index") 
//import cors from 'cors';
let mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
// Setup server port
var port = process.env.PORT || 8081;
// Send message for default URL
//app.get('/', (req, res) => res.send('Hello World with Express'));
var searchRouter = require("./routes/search")
var bookRouter = require("./routes/book");
var usersRouter = require("./routes/users");
var cartsRouter = require("./routes/cart");
var chatRoomRouter = require("./routes/chatRoom");
var notificationRouter = require("./routes/notification");

var app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:["https://cerulean-sunshine-ebbf87.netlify.app/", "http://localhost:3001"],
  },
});
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Connect to Mongoose and set connection variable
mongoose.set("strictQuery", false);
const connection_url = process.env.MONGODB_URI;
mongoose.connect(connection_url, { useNewUrlParser: true });
mongoose.connection.once("open", () => {
  console.log("MongoDBAtlas connected!!!");
});
// Added check for DB connection

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/search",searchRouter)
app.use("/book", bookRouter);
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

// Socket.IO
socketModule(io)
;
// Create a storage engine for Multer (you can customize this as needed)

httpServer.listen(port, function () {
  console.log("Port is running" + " " + port);
});

module.exports = app;
