import connectDB from '../../../../config/db'
import Chat from '../../../../models/Chat'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const auth = getAuth(req)
    const userId = auth.userId

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" })
    }

    const chatData = {
      userId,
      messages: [],
      name: "New Chat"
    }

    await connectDB()
    // Create the new chat and store it in a variable
    const newChat = await Chat.create(chatData)

    // Return the newly created chat object
    return NextResponse.json({ success: true, message: "Chat Created", data: newChat })
  } catch (error) {
    console.error("Error in /chat/create:", error)
    return NextResponse.json({ success: false, message: error.message })
  }
}