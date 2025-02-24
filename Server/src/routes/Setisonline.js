import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/isonline', async (req, res) => {
    try { 
        await User.findOneAndUpdate({ username: req.body.username }, { isonline: req.body.isonline });
        res.json();
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;