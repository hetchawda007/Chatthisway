import exress from 'express';
import User from '../models/User.js';

const router = exress.Router();

router.post('/getemail', async (req, res) => {
    try {
        const username = await User.findOne({ username: req.body.usermail })
        const usermail = await User.findOne({ email: req.body.usermail })
        if (username) {
            res.send({ usermail: username.email })
        }
        else if (usermail) {
            res.send({ usermail: usermail.email })
        }
        else {
            res.send({ usermail: "Usermail not found" })
        }
    } catch (error) {
        res.status(500).send('Error getting usermail: ' + error.message);
    }
})

export default router;