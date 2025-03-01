import express from 'express';
import User from "../models/User.js";
const router = express.Router();

router.post('/auth', async (req, res) => {
    try {
        const getuser = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] });
        if (!getuser) {
            return res.send({ result: false });
        }
        return res.send({ result: true });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router