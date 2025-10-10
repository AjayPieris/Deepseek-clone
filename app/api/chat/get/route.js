import connectDB from "../../../../config/db"            // Import database connection function
import Chat from "../../../../models/Chat"                // Import Chat model (MongoDB collection)
import { getAuth } from "@clerk/nextjs/server"            // Import Clerk function to get user info
import { NextResponse } from "next/server"                // Used to send back API responses

export async function GET(req) {                          // Function runs when a GET request is made
    try {
        const userId = getAuth(req);                      // Get the user’s ID from the request

        if (!userId) {                                    // If user is not logged in
            return NextResponse.json({                    
                success: false,                           
                message: "User not authenticated"          // Return error message
            })
        }

        await connectDB();                                // Connect to MongoDB
        const data = await Chat.find({ userId });          // Find all chats that belong to this user
        return NextResponse.json({                        
            success: true,                                
            data                                           
        })
    } 
    catch (error) {                                      
        return NextResponse.json({                        
            success: false,                               
            error: error.message                          
        })
    }
}
