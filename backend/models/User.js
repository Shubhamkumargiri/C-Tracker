import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        profileImage: {
            type: String,
            default: ""
        },

        resetPasswordToken: {
            type: String
        },

        resetPasswordExpiresAt: {
            type: Date
        },

        resetPasswordOtp: {
            type: String
        },

        resetPasswordOtpExpiresAt: {
            type: Date
        },

        resetPasswordVerifiedToken: {
            type: String
        },

        resetPasswordVerifiedTokenExpiresAt: {
            type: Date
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
