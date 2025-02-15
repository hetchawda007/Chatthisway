import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email : {
        type: String,
        required: true
    },
    username : {
        type: String,
        required: true
    },
    cryptopublickey : {
        type: String,
        required: true
    },
    signaturepublickey : {
        type: String,
        required: true
    }
},{timestamps: true});

export default mongoose.model.User || mongoose.model('User', userSchema);