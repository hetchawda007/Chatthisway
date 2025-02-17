import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/getpass', async (req, res) => {
    try {
        const user = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] })
        console.log(user)
        return res.send({ password: user.password, username: user.username });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;