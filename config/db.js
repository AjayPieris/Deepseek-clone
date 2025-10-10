import mongoose from "mongoose";

if (!global.mongoose) global.mongoose = { conn: null, promise: null }
let cached = global.mongoose

export default async function connectDB() {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI)
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
        throw error
    }

    return cached.conn
}
