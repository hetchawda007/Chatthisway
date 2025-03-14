import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if (decoded.email !== user.email) return res.json({ message: "Unauthorized" });
        next();
    } catch (error) {
        res.status(500).send('Error : ' + error.message);
        console.log('Error verifying token');}
};

export default verifyToken;