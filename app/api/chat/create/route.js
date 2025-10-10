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
      messages: [],  // ensure matches Chat schema
      name: "New Chat"
    }

    await connectDB()
    await Chat.create(chatData)

    return NextResponse.json({ success: true, message: "Chat Created" })
  } catch (error) {
    console.error("Error in /chat/create:", error)
    return NextResponse.json({ success: false, message: error.message })
  }
}
