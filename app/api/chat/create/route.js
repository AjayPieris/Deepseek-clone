import connectDB from '../../../../config/db'
import Chat from '../../../../models/Chat'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const auth = getAuth(req)                  // Get auth info
    const userId = auth.userId

    if (!userId) {                             // Check if user is logged in
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      })
    }

    const chatData = {                         // Prepare chat data
      userId,
      messages: [],                             // Make sure it matches model field name
      name: "New Chat"
    }

    await connectDB()                           // Connect to database
    await Chat.create(chatData)                 // Create new chat

    return NextResponse.json({
      success: true,
      message: "Chat Created"
    })
  } 
  catch (error) {                               // Catch any errors
    return NextResponse.json({
      success: false,
      message: error.message
    })
  }
}
