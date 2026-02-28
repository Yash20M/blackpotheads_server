import Wishlist from "../models/wishlist.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
       
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let wishlist = await Wishlist.findOne({ userId });
        
        if (!wishlist) {
            // Create a new wishlist with product and category
            const newWishlist = new Wishlist({
                userId,
                products: [{ product: product._id, category: product.category }],
            });

            await newWishlist.save();
            return res.status(201).json({ success: true, message: "Product added to wishlist" });
        }

        // Check if product already exists in wishlist
        const existingProduct = wishlist.products.find(
            (p) => p.product.toString() === product._id.toString()
        );

        if (existingProduct) {
            // Remove from wishlist
            wishlist.products = wishlist.products.filter(p => p.product.toString() !== product._id.toString());
            await wishlist.save();
            return res.status(200).json({ success: true, message: "Product removed from wishlist" });
        } else {
            // Add to wishlist
            wishlist.products.push({ product: product._id, category: product.category });
            await wishlist.save();
            return res.status(200).json({ success: true, message: "Product added to wishlist" });
        }

    } catch (error) {
        console.error("Error in addToWishlist:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { category } = req.query;

        // Find wishlist or create if not exists
        const wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId, products: [] } },
            { new: true, upsert: true }
        ).populate("products.product");

        // Filter by category if provided
        let filteredProducts = wishlist.products;

        if (category) {
            filteredProducts = wishlist.products.filter(
                item => item.category === category
            );
        }

        // Get total cart item count
        const userCart = await Cart.find({ user: userId });
        const totalCartCount = userCart.reduce(
            (sum, cart) => sum + cart.items.length,
            0
        );

        // Format products
        const formattedProducts = filteredProducts.map(item => ({
            ...item.product?.toObject(),
            category: item.category,
            images: item.product?.images?.map(img => img.url) || []
        }));

        // Final response
        const formattedWishlist = {
            _id: wishlist._id,
            userId: wishlist.userId,
            products: formattedProducts,
            cartCount: totalCartCount,
        };

        res.status(200).json(formattedWishlist);

    } catch (error) {
        console.error("Error in getWishlist:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Remove product directly using $pull
        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { $pull: { products: { product: productId } } },
            { new: true, upsert: true }  // create empty wishlist if not exists
        );

        return res.status(200).json({
            message: "Product removed from wishlist",
            wishlistId: updatedWishlist._id
        });

    } catch (error) {
        console.error("Error in removeFromWishlist:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export { addToWishlist, getWishlist, removeFromWishlist };
