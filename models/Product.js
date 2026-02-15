import mongoose, { Schema } from "mongoose";

// T-shirt categories - STRICT enum
const TSHIRT_CATEGORIES = {
    SHIVA: "Shiva",
    SHROOMS: "Shrooms",
    LSD: "LSD",
    CHAKRAS: "Chakras",
    DARK: "Dark",
    RICK_N_MORTY: "Rick n Morty"
};

// T-shirt sizes
const TSHIRT_SIZES = ["S", "M", "L", "XL"];

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: Object.values(TSHIRT_CATEGORIES)
    },
    sizes: {
        type: [String],
        enum: TSHIRT_SIZES,
        default: TSHIRT_SIZES
    },
    images: {
        type: Array,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export { TSHIRT_CATEGORIES, TSHIRT_SIZES };
export default Product;