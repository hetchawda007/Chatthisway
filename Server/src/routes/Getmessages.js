import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

router.post('/getmessages', async (req, res) => {
    try {
        const messages = await Message.find({ room: req.body.room })
        res.json(messages);
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;