import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/getpass', async (req, res) => {
    try {
        if (!req.body.secretkey || req.body.secretkey !== process.env.COOKIE_SECRET) return res.json({ message: "Unauthorized" });
        const user = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] })
        return res.send({ password: user.password, username: user.username });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;