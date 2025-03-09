import jwt from 'jsonwebtoken';
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/createcookie', async (req, res) => {
    console.log("Createcookie.js /createcookie req.body: ", req.body);
    try {
        const user = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] })
        console.log(req.body.usermail, user);
        const token = jwt.sign(
            { email: user.email }, process.env.JWT_SECRET || "fallbackSecret", { expiresIn: "7d" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, 
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000, 
        });
        console.log(token);
        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;