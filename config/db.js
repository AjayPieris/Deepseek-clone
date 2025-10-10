import mongoose from "mongoose";                          // 🧠 Import mongoose to connect and work with MongoDB

let cached = global.mongoose || { conn: null, promise: null }; // Reuse existing DB connection if available, else create empty object

export default async function connectDB() {               // ⚙️ Define an async function to connect to MongoDB
    if (cached.conn) return cached.conn;                  // ✅ If already connected, return existing connection

    if (!cached.promise) {                                // 🔍 If no connection is being made yet
        cached.promise = mongoose                         // 🚀 Start connecting to MongoDB
            .connect(process.env.MONGODB_URI)             // 🌐 Use the MongoDB URL from .env file
            .then((mongoose) => mongoose);                // 📦 After connection, return mongoose instance
    }

    try {
        cached.conn = await cached.promise;               // ⏳ Wait for the connection to finish and store it
    } catch (error) {
        console.error("Error connecting to MongoDB:", error); 
    }

    return cached.conn;                                  
}
