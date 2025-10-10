import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        messages: [
            {
                role: { type: String, required: true },
                content: { type: String, required: true },   // fixed capitalization
                timestamp: { type: Number, required: true } // ✅ Use Number, not number
            }
        ]
    },
    { timestamps: true } // automatically adds createdAt and updatedAt
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema); 
// Reuse existing model if exists, otherwise create new one

export default Chat;
