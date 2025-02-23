import express from 'express';
import User from '../models/User.js';
const router = express.Router();

router.post('/updateprofile', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ email: req.body.email }, { fname: req.body.fname, description: req.body.description, gender: req.body.gender }, { new: true });
        await user.save();
        res.json({ message: 'Profile Updated Successfully' });
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;