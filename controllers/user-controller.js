import User from "../models/user.js";

const getProfile = async (req, res) => {
    const user = req.user;
    res.status(200).json({ success: true, message: "Profile fetched successfully", user });
};

const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const { name, phone } = req.body;

        // Create an object with only the fields that are provided
        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields provided to update." });
        }

        // Update user document
        const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export { getProfile, updateProfile };