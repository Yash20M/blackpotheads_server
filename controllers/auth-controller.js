import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Order from "../models/order.js";
import { createToken } from "../utils/config.js";


const register = async (req, res) => {
    const { name, email, password, phone } = req.body;


    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }


    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }


    if (phone && !/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Please enter a valid phone number" });
    }


    if (password && password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }


    // check if user already exists
    const existingUser = await User.findOne({ email });


    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({ name, email, password, phone });

    // Link guest orders to new user account
    // Find all guest orders with matching email or phone
    const guestOrders = await Order.find({
        isGuestOrder: true,
        $or: [
            { 'guestInfo.email': email.toLowerCase() },
            { 'guestInfo.phone': phone }
        ]
    });

    // Update guest orders to link with new user
    if (guestOrders.length > 0) {
        await Order.updateMany(
            {
                isGuestOrder: true,
                $or: [
                    { 'guestInfo.email': email.toLowerCase() },
                    { 'guestInfo.phone': phone }
                ]
            },
            {
                $set: {
                    user: newUser._id,
                    isGuestOrder: false
                }
            }
        );

        console.log(`✅ Linked ${guestOrders.length} guest order(s) to new user: ${email}`);
    }

    res.status(201).json({ 
        success: true, 
        message: "User created successfully",
        linkedOrders: guestOrders.length
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    const response = {
        success: true,
        message: "Login Successfull",
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
        }
    }
    res.status(200).json(response);
};




export { login, register };
