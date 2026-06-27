import mongoose from "mongoose";

const collabSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    instagram: {
        type: String,
        required: true,
        trim: true
    },
    vision: {
        type: String,
        required: true,
        maxlength: 100
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
