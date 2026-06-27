import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Made optional for guest checkout
    
    // Guest user information (required if user is not provided)
    guestInfo: {
        name: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    
    isGuestOrder: { type: Boolean, default: false },
    
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        category: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    address: {
        line1: String,
        city: String,
        state: String,
        pincode: String,
        country: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'COD'
    },
    createdAt: { type: Date, default: Date.now }
});

// Validation: Either user OR guestInfo must be provided
orderSchema.pre('validate', function(next) {
    if (!this.user && !this.isGuestOrder) {
        return next(new Error('Either user or guest information must be provided'));
    }
    
    if (this.isGuestOrder) {
        if (!this.guestInfo || !this.guestInfo.email || !this.guestInfo.phone) {
            return next(new Error('Guest orders must include email and phone number'));
        }
    }
    
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
