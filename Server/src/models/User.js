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
    isonline: {
        type: Boolean,
        default: false
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
        default: 'I love to chat this way'
    },
    passwordversion: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);