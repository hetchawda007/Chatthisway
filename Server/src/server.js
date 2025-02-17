import express from 'express';
import connectDB from './config/db.js';
import cors from "cors"
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Createuser from "./routes/Createuser.js";
import Usermail from "./routes/Usermail.js";
import auth from "./routes/auth.js";
import Getpass from "./routes/Getpass.js"
import Getemail from "./routes/Getemail.js"
import Updatepass from "./routes/Updatepass.js"
import Verifyrecaptcha from "./routes/Verifyrecaptcha.js"
import Createcookie from "./routes/Createcookie.js"

const app = express();

await connectDB();

dotenv.config()
app.use(cookieParser())
app.use(cors({
  origin: process.env.CORS_ORIGIN_WHITELIST,
  credentials: true
}));

app.use('/api', Createuser);
app.use('/api', auth);
app.use('/api', Usermail);
app.use('/api', Getpass);
app.use('/api', Getemail);
app.use('/api', Updatepass);
app.use('/api', Verifyrecaptcha);
app.use('/api', Createcookie);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(8080, () => {
  console.log('Server is running on port http://localhost:8080');
})