import mongoose from "mongoose";                         

const ChatSchema = new mongoose.Schema(                   //  Create a new schema (data structure) for users
    {
        name: {type: String, required: true},
        messages:[
            {
                role:{type: String, required: true},
                Content: {type: String, required: true},
                timestamp: {type: number , required: true}
            }
        ]
    },
    { timestamps: true }                                   //  Auto add createdAt & updatedAt times
);

const Chat = mongoose.models.User || mongoose.model("Chat", ChatSchema);  
// 🔁 Reuse existing User model if it exists, or create a new one

export default Chat;                                      
