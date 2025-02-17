import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
router.post('/verifyrecaptcha', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "reCAPTCHA token missing" });
    }
    try {
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`;
        const { data } = await axios.post(googleVerifyUrl);

        if (data.success && data.score > 0.5) {
            res.json({ success: true, message: "User verified as human" });
        } else {
            res.json({ success: false, message: "Verification failed, suspicious activity detected" });
        }
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;