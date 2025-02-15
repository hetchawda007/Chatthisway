import express from 'express';
import connectDB from './config/db.js';
import Createuser from "./routes/Createuser.js";
import auth from "./routes/auth.js";
import cors from "cors"
const app = express();

await connectDB();
app.use(cors());
app.use(express.json());
app.use('/api', Createuser);
app.use('/api', auth);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(8080, () => {
  console.log('Server is running on port http://localhost:8080');
})