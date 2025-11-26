require('dotenv').config();
const mongoose = require('mongoose');

console.log("Checking MONGODB_URI...");
if (process.env.MONGODB_URI) {
    console.log("MONGODB_URI is defined.");
    console.log("Value starts with:", process.env.MONGODB_URI.substring(0, 15) + "...");
} else {
    console.error("MONGODB_URI is NOT defined.");
}
