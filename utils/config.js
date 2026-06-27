import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI ;
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
};

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRETKEY , { expiresIn: "7d" });
};

const createAdminToken = (id) => {
    return jwt.sign({ id }, process.env.ADMIN_SECRET, { expiresIn: "7d" });
};


const createAdmin = async () => {
    try {
        if (await User.findOne({ email: "admin@gmail.com" })) {
            console.log("Admin already exists");
            return;
        }

        const admin = await User.create({
            name: "Admin",
            email: "admin@gmail.com",
            password: "admin123",
            phone: "1234567890",
            address: "1234567890",
            isAdmin: true,
        });
        console.log(admin);
    }
    catch (err) {
        console.log(err);
    }
}
createAdmin();

export { connectDB, createToken,createAdminToken };