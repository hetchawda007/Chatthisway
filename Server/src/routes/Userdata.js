import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/userdata', async (req, res) => {
    try {
        let user = await User.findOne({ username: req.body.username });
        if (user) {
            user = Object.keys(user.toObject())
                .filter(key => !['cryptoprivatekey', 'signatureprivatekey', '_id', '__v'].includes(key))
                .reduce((obj, key) => {
                    obj[key] = user[key];
                    return obj;
                }, {});
        }
        res.send(user);
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;