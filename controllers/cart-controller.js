import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { calculateTotalAmount } from "../utils/utility.js";

const addToCart = async (req, res) => {
    try {
        const { productId, quantity, size } = req.body;
        const userId = req?.user?._id;

        // Fetch product to get category and price
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            const newCart = new Cart({ 
                user: userId, 
                items: [{ 
                    product: productId, 
                    category: product.category,
                    quantity, 
                    size: size || "M",
                    priceSnapshot: product.price
                }] 
            });
            await newCart.save();
            return res.status(201).json({ success: true, message: "Product added to cart", cart: newCart });
        }

        const existingItem = cart.items.find(item => 
            item.product.toString() === productId && item.size === (size || "M")
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ 
                product: productId, 
                category: product.category,
                quantity, 
                size: size || "M",
                priceSnapshot: product.price
            });
        }
        
        await cart.save();
        res.status(201).json({ success: true, message: "Product added to cart", cart: cart });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }


        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (!existingItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        await cart.save();
        res.status(200).json({ success: true, message: "Product removed from cart", cart: cart });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product").exec();

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const items = cart.items.map(item => {
            const productObj = item?.product?.toObject();

            return {
                product: {
                    ...productObj,
                    images: productObj?.images?.map(img => img.url)
                },
                category: item.category,
                quantity: item.quantity,
                size: item.size,
                priceSnapshot: item.priceSnapshot
            };
        });

        const totalAmount = calculateTotalAmount(items);

        res.status(200).json({ success: true, cart: items, totalAmount });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        res.status(200).json({ success: true, message: "Cart cleared" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

const updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req?.user?._id;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (!existingItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        existingItem.quantity = quantity;

        await cart.save();
        res.status(200).json({ success: true, message: "Cart updated", cart: cart });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

export { addToCart, removeFromCart, getCart, clearCart, updateCart };