import express from 'express';
import User from '../models/User.js';
const router = express.Router();

router.get('/getusers', async (req, res) => {
    try {
        const users = await User.find();
        const filteredUsers = users.map(user => ({
            username: user.username,
            fname: user.fname
        }));
        res.json(filteredUsers);
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;