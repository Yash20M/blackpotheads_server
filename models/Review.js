import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,   // optional — guests can review without login
        default: null
    },
    guestName: {
        type: String,
        trim: true,
        default: null      // used when user is null (guest review)
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Compound index — unique only for logged-in users (exclude null/guest users)
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
