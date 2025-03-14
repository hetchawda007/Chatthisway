import express from 'express';
import User from "../models/User.js";

const router = express.Router();

router.post('/createuser', async (req, res) => {
    try {
        if (!req.body.secretkey || req.body.secretkey !== process.env.COOKIE_SECRET) return res.json({ message: "Unauthorized" });
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            cryptopublickey: req.body.publiccryptokey,
            signaturepublickey: req.body.publicsigninkey,
            password: req.body.password,
            fname: req.body.fname,
            cryptoprivatekey: req.body.privatecryptokey,
            signatureprivatekey: req.body.privatesigninkey,
        });
        await user.save();
        res.send('User created');
    } catch (error) {
        res.status(500).send('Error creating user: ' + error.message);
    }
})

export default router;