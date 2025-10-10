import Chat from '../../../../models/Chat'                   
import { getAuth } from '@clerk/nextjs/server'                
import { NextResponse } from 'next/server'                     

export async function POST(req) {                               // Function runs when Post request is received
    try {
        const userId = getAuth(req);                           // Get current user's ID from Clerk

        if (!userId) {                                         // If user not logged in
            return NextResponse.json({
                success: false,
                message: "User Not Authenticated",             // Send error message
            })
        }

        const { chatId, name } = await req.json();             // Get chatId and new name from request body

        await Chat.findOneAndUpdate(                           // Find and update chat in database
            { _id: chatId, userId },                           // Match by chatId and userId
            { name }                                           // Update only the name field
        );

        return NextResponse.json({                             // Send success response
            success: true,
            message: "Chat Renamed"
        })
    } 
    catch (error) {                                            // If any error happens
        return NextResponse.json({
            success: false,
            error: error.message                               // Send error message
        })
    }
}
