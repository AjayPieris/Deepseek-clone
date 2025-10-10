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

    const { chatId, name } = await req.json() // POST can read body

    await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { name }
    )

    return NextResponse.json({ success: true, message: "Chat Renamed" })
  } 
  catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
