import express from 'express';
import Message from "../models/Message.js";
const router = express.Router();

router.post('/savemessage', async (req, res) => {
    try {
        const savemessage = await new Message({
            message: req.body.message,
            sender: req.body.sender,
            receiver: req.body.receiver,
            status: req.body.status,
            room : req.body.room
        })
        await savemessage.save()
        res.json({ message: 'Message saved' });
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;