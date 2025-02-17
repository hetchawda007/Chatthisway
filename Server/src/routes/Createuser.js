import express from 'express';
import User from "../models/User.js";

const router = express.Router();

router.post('/createuser', async (req, res) => {
    try {
        const user = await new User({
            username: req.body.username,
            email: req.body.email,
            cryptopublickey: req.body.cryptokey,
            signaturepublickey: req.body.signinkey,
            password: req.body.password,
            fname: req.body.fname,
        });
        await user.save();
        res.send('User created');
    } catch (error) {
        res.status(500).send('Error creating user: ' + error.message);
    }
})

export default router;