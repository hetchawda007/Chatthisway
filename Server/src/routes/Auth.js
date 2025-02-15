import express from 'express';
import User from "../models/User.js";
const router = express.Router();

router.post('/auth', async (req, res) => {
    try {
        const getuser = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] });
        console.log(req.body.usermail, getuser);
        if (!getuser) {
            return res.status(404).send({ result: false });
        }
        console.log("respond sent")
        return res.send({ result: true });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;