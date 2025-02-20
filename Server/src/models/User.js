import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    cryptopublickey: {
        type: String,
        required: true
    },
    cryptoprivatekey: {
        type: Object,
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    signatureprivatekey: {
        type: Object,
        required: true
    },
    signaturepublickey: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    passwordversion: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

export default mongoose.model.User || mongoose.model('User', userSchema);