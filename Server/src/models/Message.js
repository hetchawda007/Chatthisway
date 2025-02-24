import mongoose from "mongoose";
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    message: {
        type: Object,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "sent"
    },
    room: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);