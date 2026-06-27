import mongoose, { Schema } from "mongoose";

const qrSchema = new Schema({
    qrImage: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });

const QR = mongoose.model("QR", qrSchema);

export default QR;

