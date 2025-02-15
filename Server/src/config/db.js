import mongoose from "mongoose";
const connectDB = async () => {
    try {
        mongoose.connect('mongodb://localhost:27017/chatthisway');
        console.log('MongoDB connected');
    } catch (error) {
        console.log('MongoDB connection failed');
    }
}

export default connectDB;