import mongoose from "mongoose";

// Generate BP-AUG26-XXXX format order number
async function generateOrderNumber() {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase(); // AUG
    const year = String(now.getFullYear()).slice(-2);                             // 26
    const prefix = `BP-${month}${year}`;

    // Find the highest sequence number for this month-year
    const regex = new RegExp(`^${prefix}-`);
    const lastOrder = await mongoose.model('Order').findOne(
        { orderNumber: { $regex: regex } },
        { orderNumber: 1 },
        { sort: { orderNumber: -1 } }
    );

    let seq = 1;
    if (lastOrder && lastOrder.orderNumber) {
        const parts = lastOrder.orderNumber.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}-${String(seq).padStart(4, '0')}`;
}

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        sparse: true, // allows null for old orders
    },

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

// Auto-generate orderNumber before saving
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        this.orderNumber = await generateOrderNumber();
    }
    next();
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
