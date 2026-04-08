import mongoose from "mongoose";

const collabSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'contacted', 'rejected'],
        default: 'pending'
    }
}, { 
    timestamps: true 
});

const Collab = mongoose.model('Collab', collabSchema);

export default Collab;
