import express from 'express';
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

const app = express();

await connectDB();

dotenv.config()
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

app.listen(8080, () => {
  console.log('Server is running on port http://localhost:8080');
})