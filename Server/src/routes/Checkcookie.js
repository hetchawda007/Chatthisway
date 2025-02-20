import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = express.Router();

router.get('/checkcookie', async (req, res) => {    
    const token = req.cookies.token;
    if (!token) return res.json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if(decoded.passwordversion !== user.passwordversion) return res.json({ message: "Unauthorized" });
        res.json({ message: "Protected content", username: user.username });
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;