import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/getcryptokeys', async (req, res) => {
    try {
        const keys = await User.findOne({ $or: [{ username: req.body.usermail }, { email: req.body.usermail }] })
        res.send({ cryptoprivatekey: keys.cryptoprivatekey, signatureprivatekey: keys.signatureprivatekey })
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;