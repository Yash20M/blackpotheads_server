import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: "Featured Video"
    },
    description: {
        type: String,
        default: ""
    },
    videoUrl: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Video = mongoose.model("Video", videoSchema);

export default Video;