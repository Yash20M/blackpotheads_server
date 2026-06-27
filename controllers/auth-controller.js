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

/**
 * Forgot Password - Reset password using email and phone verification
 */
const forgotPassword = async (req, res) => {
    try {
        const { email, phone, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!email || !phone || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid email address" 
            });
        }

        // Validate phone format
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid 10-digit phone number" 
            });
        }

        // Validate password length
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 8 characters long" 
            });
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Passwords do not match" 
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "No account found with this email" 
            });
        }

        // Verify phone number matches
        if (user.phone !== phone) {
            return res.status(403).json({ 
                success: false, 
                message: "Phone number does not match our records" 
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        console.log(`✅ Password reset successful for user: ${email}`);

        res.status(200).json({ 
            success: true, 
            message: "Password reset successful. You can now login with your new password." 
        });

    } catch (err) {
        console.error("Password reset failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to reset password", 
            error: err.message 
        });
    }
};


export { login, register, forgotPassword };
