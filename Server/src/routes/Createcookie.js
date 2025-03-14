import jwt from 'jsonwebtoken';
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/createcookie', async (req, res) => {
    try {
        if (!req.body.secretkey || req.body.secretkey !== process.env.COOKIE_SECRET) return res.json({ message: "Unauthorized" });
        const user = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] })
        const token = jwt.sign(
            { email: user.email }, process.env.JWT_SECRET || "fallbackSecret", { expiresIn: "7d" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(500).send('Error checking user');
    }
})

export default router;