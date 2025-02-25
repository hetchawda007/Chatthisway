import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.put('/updatepass', async (req, res) => {
    try {
        await User.findOneAndUpdate({ email: req.body.usermail }, { password: req.body.password, $inc: { passwordversion: 1 } });
        res.send({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;