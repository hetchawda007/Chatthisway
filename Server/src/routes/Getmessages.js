import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

router.post('/getmessages', async (req, res) => {
    try {
        console.log(req.body);
        if (req.body.room) {
            const messages = await Message.find({ room: req.body.room });
            res.json(messages);
        }
        else {
            const message = []
            const messages = await Message.find({ $or: [{ sender: req.body.username }, { receiver: req.body.username }] }).distinct('room');
            const username = messages.filter((msg) => {
                
            })
            res.json(filteredMessages);
            // res.json(messages);
        }
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;