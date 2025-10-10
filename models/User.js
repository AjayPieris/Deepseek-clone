import mongoose from "mongoose";                         

const UserSchema = new mongoose.Schema(                   //  Create a new schema (data structure) for users
    {
        _id: { type: String, required: true },            //  User ID (must be given)
        name: { type: String, required: true },            //  User name (required)
        email: { type: String, required: true },           //  User email (required)
        image: { type: String, required: false }           //  User image (optional)
    },
    { timestamps: true }                                   //  Auto add createdAt & updatedAt times
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);  
// 🔁 Reuse existing User model if it exists, or create a new one

export default User;                                      
