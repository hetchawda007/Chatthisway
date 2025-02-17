import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/createcookie', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        const token = jwt.sign(
            { email: "hetchawda44@gmail.com" },
            process.env.JWT_SECRET || "fallbackSecret", // Provide a default
            { expiresIn: "1h" }
        );
        app.use(express.json(), token);
        res.cookie("token", token, {
            httpOnly: true, // Prevents JavaScript access
            secure: process.env.NODE_ENV === "production", // Only HTTPS in production
            sameSite: "strict", // Prevents CSRF attacks
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;