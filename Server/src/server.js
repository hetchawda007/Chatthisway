import express from 'express';
import connectDB from './config/db.js';
import Createuser from "./routes/Createuser.js";
import Usermail from "./routes/Usermail.js";
import auth from "./routes/auth.js";
import Getpass from "./routes/Getpass.js"
import Getemail from "./routes/Getemail.js"
import Updatepass from "./routes/Updatepass.js"
import cors from "cors"
const app = express();

await connectDB();
app.use(cors());
app.use(express.json());
app.use('/api', Createuser);
app.use('/api', auth);
app.use('/api', Usermail);
app.use('/api', Getpass);
app.use('/api', Getemail);
app.use('/api', Updatepass);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(8080, () => {
  console.log('Server is running on port http://localhost:8080');
})