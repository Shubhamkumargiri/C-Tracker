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
        
        // Persisted Integrations Data
        integrations: {
            github: { type: Boolean, default: false },
            leetcode: { type: Boolean, default: false },
            linkedin: { type: Boolean, default: false }
        },
        githubUsername: { type: String, default: "" },
        githubName: { type: String, default: "" },
        leetcodeUsername: { type: String, default: "" },
        leetcodeName: { type: String, default: "" },
        linkedinMetrics: {
            connections: { type: Number, default: 0 },
            profileViewers: { type: Number, default: 0 },
            postImpressions: { type: Number, default: 0 }
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
