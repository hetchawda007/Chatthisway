import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import connectDB from './config/db.js';
import cors from "cors"
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import Createuser from "./routes/Createuser.js";
import Usermail from "./routes/Usermail.js";
import auth from "./routes/auth.js";
import Getpass from "./routes/Getpass.js"
import Getemail from "./routes/Getemail.js"
import Updatepass from "./routes/Updatepass.js"
import Verifyrecaptcha from "./routes/Verifyrecaptcha.js"
import Createcookie from "./routes/Createcookie.js"
import Getcryptokeys from "./routes/Getcryptokeys.js"
import Checkcookie from "./routes/Checkcookie.js"
import Deletecookie from "./routes/Deletecookie.js"
import Getusers from "./routes/Getusers.js"
import Userdata from "./routes/Userdata.js"
import Updateprofile from "./routes/Updateprofile.js"
import Setisonline from "./routes/Setisonline.js"
import Savemessage from "./routes/Savemessage.js"
import Getmessages from "./routes/Getmessages.js"
import Setstatus from "./routes/Setstatus.js"

const app = express();
dotenv.config();
await connectDB();

app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api', Createuser);
app.use('/api', auth);
app.use('/api', Usermail);
app.use('/api', Getpass);
app.use('/api', Getemail);
app.use('/api', Updatepass);
app.use('/api', Verifyrecaptcha);
app.use('/api', Createcookie);
app.use('/api', Getcryptokeys);
app.use('/api', Checkcookie);
app.use('/api', Deletecookie);
app.use('/api', Getusers);
app.use('/api', Userdata);
app.use('/api', Updateprofile);
app.use('/api', Setisonline);
app.use('/api', Savemessage);
app.use('/api', Getmessages);
app.use('/api', Setstatus);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on("join_room", (room, username) => {
    socket.join(room);
    console.log(username + " joined room: " + room);
  })
  socket.on("send_message", async ({ message, room }) => {
    console.log(message);
    socket.to(room).emit("receive_message", message);
  })
  socket.on("seen_message", (room, username) => {
    console.log(username + " seen the message in room: " + room);
    socket.to(room).emit("message_status", room, username);
  })
  socket.on("isinchat", (room, username) => {
    console.log(username + " is in chat room: " + room);
    socket.to(room).emit("isin_chat", room, username);
  })
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  })
  socket.on("user_status", (username, status) => {
    console.log(username + " is " + status);
    socket.broadcast.emit("user_status", username, status);
  })
})

server.listen(8080, () => {
  console.log('Server is running on port http://localhost:8080');
}).on('error', (err) => {
  console.error('Server error:', err);
});