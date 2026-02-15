
import Product, { TSHIRT_CATEGORIES } from "../models/Product.js";
import QR from "../models/QR.js";
import { uploadFileToCloudinary } from "../utils/utility.js";

const createProducts = async (req, res) => {
    try {
        let { name, description, price, category, sizes, stock, isFeatured } = req.body;

        // Validate category
        if (!Object.values(TSHIRT_CATEGORIES).includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${Object.values(TSHIRT_CATEGORIES).join(", ")}`
            });
        }

        // Upload all valid image files to Cloudinary
        const cloudinaryUrls = await uploadFileToCloudinary(req.files || []);

        // Handle sizes field
        let processedSizes = ["S", "M", "L", "XL"]; // Default all sizes
        if (sizes) {
            if (Array.isArray(sizes)) {
                processedSizes = sizes.filter(Boolean);
            } else {
                try {
                    const parsed = JSON.parse(sizes);
                    processedSizes = Array.isArray(parsed) ? parsed.filter(Boolean) : [sizes.trim()];
                } catch {
                    processedSizes = [sizes.trim()];
                }
            }
        }

    const product = await Product.create({
            name,
            description,
            price,
            category,
            sizes: processedSizes,
            images: cloudinaryUrls,
            stock: stock || 0,
            isFeatured: isFeatured || false,
        });

        res.status(201).json({
            success: true,
            message: "T-shirt product created successfully",
            product
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        const { category } = req.params;

        // Validate category if provided
        if (category && !Object.values(TSHIRT_CATEGORIES).includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${Object.values(TSHIRT_CATEGORIES).join(", ")}`
            });
        }

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const query = category ? { category } : {};
        const total = await Product.countDocuments(query);

        let products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Map to only return image URLs for each product
        const formattedProducts = products.map(product => ({
            ...product.toObject(),
            images: product.images.map(img => img.url)
        }));

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            products: formattedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get products",
            error: error.message
        });
    }
};

const getFeaturedProducts = async (req, res) => {
    try {
        let { limit = 10 } = req.query;
        limit = Number.isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);

        const featuredProducts = await Product.find({ isFeatured: true })
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedProducts = featuredProducts.map(product => ({
            ...product.toObject(),
            images: product.images.map(img => img.url)
        }));

        res.status(200).json({
            success: true,
            totalProducts: formattedProducts.length,
            products: formattedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get featured products",
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Format product to include only image URLs
        const formattedProduct = {
            ...product.toObject(),
            images: product.images.map(img => img.url)
        };

        res.status(200).json({
            success: true,
            product: formattedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get product",
            error: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments();

        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Map to only return image URLs for each product
        const formattedProducts = products.map(product => ({
            ...product.toObject(),
            images: product.images.map(img => img.url)
        }));

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            products: formattedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get products",
            error: error.message
        });
    }
};

const getQR = async (req, res) => {
    try {
        const qr = await QR.findOne();
        
        if (!qr) {
            return res.status(404).json({
                success: false,
                message: "QR image not found"
            });
        }

        res.status(200).json({
            success: true,
            qrImage: qr.qrImage
        });
    } catch (error) {
        console.error("Error fetching QR image:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch QR image",
            error: error.message
        });
    }
};

export { createProducts, getProducts, getFeaturedProducts, getProductById, getAllProducts, getQR };
