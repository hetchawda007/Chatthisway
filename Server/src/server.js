import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import connectDB from './config/db.js';
import cors from "cors"
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import verifyToken from './middleware/authMiddleware.js';
import Createuser from "./routes/Createuser.js";
import Usermail from "./routes/Usermail.js";
import auth from "./routes/Auth.js";
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
import limiter from './middleware/ratelimiterMiddleware.js';

const app = express();
dotenv.config();
await connectDB();

app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"]
}));
app.use(express.json({ limit: '30kb' }));

// Rate limiter middleware

app.use('/api/v1', limiter);

// Public routes that don't need authentication
app.use('/api/v1', auth);
app.use('/api/v1', Verifyrecaptcha);
app.use('/api/v1', Checkcookie);
app.use('/api/v1', Deletecookie);
app.use('/api/v1', Createuser);
app.use('/api/v1', Createcookie);
app.use('/api/v1', Getpass);

// Protected routes that need authentication
app.use('/api/v1', verifyToken, Usermail);
app.use('/api/v1', verifyToken, Getemail);
app.use('/api/v1', verifyToken, Updatepass);
app.use('/api/v1', verifyToken, Getcryptokeys);
app.use('/api/v1', verifyToken, Getusers);
app.use('/api/v1', verifyToken, Userdata);
app.use('/api/v1', verifyToken, Updateprofile);
app.use('/api/v1', verifyToken, Setisonline);
app.use('/api/v1', verifyToken, Savemessage);
app.use('/api/v1', verifyToken, Getmessages);
app.use('/api/v1', verifyToken, Setstatus);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    methods: ["GET", "POST"],
    credentials: true
  }
})

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on("join_room", (room, username) => {
    socket.join(room);
  })
  socket.on("send_message", async ({ message, room }) => {
    socket.to(room).emit("receive_message", message);
  })
  socket.on("seen_message", (room, username) => {
    socket.to(room).emit("message_status", room, username);
  })
  socket.on("isinchat", (room, receiver) => {
    socket.to(room).emit("isin_chat", room, receiver);
  })
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  })
  socket.on("user_status", (username, status) => {
    socket.broadcast.emit("user_status", username, status);
  })
  socket.on("new_chat", (room, receiver) => {
    socket.broadcast.emit("new_chat", room, receiver);
  })

})

app.get('/', (req, res) => {
  res.send('Server is running');
})

server.listen(8080, () => {
  console.log(`Server is running on port http://localhost:8080`);
}).on('error', (err) => {
  console.error('Server error:', err);
});
