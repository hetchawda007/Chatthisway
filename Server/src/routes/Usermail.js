import express from 'express'
import User from '../models/User.js'

const router = express.Router()

router.post('/usermail', async (req, res) => {
    try {
        const username = await User.findOne({ username: req.body.username })
        const usermail = await User.findOne({ email: req.body.email })
        if (!usermail && !username) {
            return res.send({ result: true });
        }
        return res.send({ result: false })
    } catch (error) {
        res.status(500).send('Error checking user: ' + error.message);
    }
})

export default router;