import jwt from 'jsonwebtoken';
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/createcookie', async (req, res) => {
    console.log("Createcookie.js /createcookie req.body: ", req.body);
    try {
        const user = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] })

        const token = jwt.sign(
            { email: user.email }, process.env.JWT_SECRET || "fallbackSecret", { expiresIn: "7d" }
        );
        res.clearCookie("token");
        res.cookie("token", token, {
            httpOnly: true, // Prevents JavaScript access
            secure: process.env.NODE_ENV === "production", // Only HTTPS in production
            sameSite: "strict", // Prevents CSRF attacks
            maxAge: 60 * 60 * 24 * 7 * 1000 // 7 days
        });

        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;