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

    const body = await req.json()          // get the body object
    const { chatId } = body                // extract chatId properly

    if (!chatId) {
      return NextResponse.json({ success: false, message: "chatId is required" })
    }

    await connectDB()
    await Chat.deleteOne({ _id: chatId, userId })  // now _id is a string

    return NextResponse.json({ success: true, message: "Chat Deleted" })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
