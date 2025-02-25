import express from 'express';
import Message from '../models/Message.js';
const router = express.Router();

router.post('/setstatus', async (req, res) => {
    try {
        if (!req.body.receiver) {
            await Message.updateMany({ room: req.body.room }, { status: req.body.status });
        } else {
            await Message.updateMany({ receiver: req.body.receiver, status: 'sent' }, { status: req.body.status });
        }
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;