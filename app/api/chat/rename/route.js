import Chat from '../../../../models/Chat'
import { getAuth } from '@clerk/nextjs/server'
import connectDB from '../../../../config/db'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const auth = getAuth(req)
    const userId = auth.userId

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" })
    }

    const body = await req.json()
    const { chatId, name } = body

    if (!chatId || !name) {
      return NextResponse.json({ success: false, message: "chatId and name are required" })
    }

    await connectDB()

    await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { name }
    )

    return NextResponse.json({ success: true, message: "Chat Renamed" })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
