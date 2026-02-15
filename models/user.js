import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address",
        ],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters long"],
        select: false,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^[0-9]{10}$/,
            "Please enter a valid phone number",
        ],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


const User = model("User", userSchema);

export default User;