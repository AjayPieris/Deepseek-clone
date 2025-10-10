import connectDB from '../../../../config/db'            // Connect to MongoDB
import Chat from '../../../../models/Chat'                // Chat model
import { getAuth } from '@clerk/nextjs/server'            // Get logged-in user info from Clerk
import { NextResponse } from 'next/server'                // Used to send responses

export async function POST(req) {                         // Runs when a POST request is made
    try {
        const { userId } = getAuth(req)                   // Get the user's ID from the request

        if (!userId) {                                    // If user is not logged in
            return NextResponse.json({                    
                success: false, 
                message: "User not authenticated",         // Return error response
            })
        }

        const chatData = {                                // Data to save in the database
            userId,                                        // User who owns the chat
            message: [],                                   // Empty message list
            name: "New Chat"                               // Default chat name
        }

        await connectDB();                                // Connect to the database
        await Chat.create(chatData);                      // Create new chat in database

        return NextResponse.json({                        // Return success message
            success: true, 
            message: "Chat Created"                        
        })
    } 
    catch (error) {                                       // If any error occurs
        return NextResponse.json({                        
            success: false, 
            message: error.message                         // Return the error message
        })
    }
}
