import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { products } from "./data.js";

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting database seeding...");
        
        // Connect to database
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in .env file");
        }
        
        console.log(`📡 Connecting to MongoDB...`);
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        // Clear existing products
        console.log("�️  Clearing existing products...");
        const deleteResult = await Product.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} existing products`);

        // Insert new products
        console.log("📦 Inserting new products...");
        const insertedProducts = await Product.insertMany(products);
        console.log(`✅ Successfully inserted ${insertedProducts.length} products`);

        // Display summary by category
        console.log("\n📊 Products by Category:");
        const categories = ["Shiva", "Shrooms", "LSD", "Chakras", "Dark", "Rick n Morty"];
        
        for (const category of categories) {
            const count = await Product.countDocuments({ category });
            const featured = await Product.countDocuments({ category, isFeatured: true });
            console.log(`   ${category}: ${count} products (${featured} featured)`);
        }

        // Display total
        const totalProducts = await Product.countDocuments();
        const totalFeatured = await Product.countDocuments({ isFeatured: true });
        console.log(`\n✨ Total: ${totalProducts} products (${totalFeatured} featured)`);

        console.log("\n🎉 Database seeding completed successfully!");
        
        // Close connection
        await mongoose.connection.close();
        console.log("👋 Database connection closed");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:");
        console.error(error.message);
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    }
};

// Run the seed function
console.log("🚀 Initializing seed script...");
seedDatabase();
