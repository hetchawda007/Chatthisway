import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/getmessages', async (req, res) => {
    try {
        if (req.body.room) {
            const messages = await Message.find({ room: req.body.room });
            res.json(messages);
        }
        else {
            const messages = []
            const roomnames = await Message.find({ $or: [{ sender: req.body.username }, { receiver: req.body.username }] }).distinct('room');
            if (roomnames.length < 1) { return res.json({ message: 'no roomnames found' }) }
            const fetchmessages = async () => {
                for (const name of roomnames) {
                    const messagecount = await Message.find({ room: name, receiver: req.body.username, $or: [{ status: 'sent' }, { status: 'delivered' }] }).countDocuments();
                    const username = name.replace(new RegExp(`^${req.body.username}_?|_?${req.body.username}$`, 'g'), '');
                    const signaturepublickey = await User.findOne({ username: username }).select('signaturepublickey');
                    const cryptopublickey = await User.findOne({ username: username }).select('cryptopublickey');
                    const latestMessage = await Message.findOne({ room: name }).sort({ createdAt: -1 })
                    const date = new Date(latestMessage.createdAt)
                    const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
                    const messagedate = date.toLocaleDateString("en-GB", options).split('/').join('/'); 
                    messages.push({ username: username, messagecount: messagecount, lastmessage: latestMessage.message, date: messagedate, signaturepublickey: signaturepublickey.signaturepublickey, cryptopublickey: cryptopublickey.cryptopublickey });
                }
            }
            await fetchmessages();
            res.json(messages)
        }
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;