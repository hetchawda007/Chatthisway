import express from 'express';

const router = express.Router();

router.post('/deletecookie', async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
    }
})

export default router;