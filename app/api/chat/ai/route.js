export const maxDuration = 60;
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import Chat from "../../../../models/Chat";
import connectDB from "../../../../config/db";

// Initialize OpenAI client with your OpenRouter API key
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // <- put your free API key here
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    await connectDB();

    // Find the chat document
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return NextResponse.json({
        success: false,
        message: "Chat not found",
      });
    }

    // Add user's message to chat
    const userMessage = {
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
    };
    chat.messages.push(userMessage);
    await chat.save();

    // Send prompt to OpenAI / OpenRouter
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o", // You can change model if needed
      messages: [
        ...chat.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: prompt },
      ],
    });

    const assistantMessage = {
      role: "assistant",
      content: completion.choices[0].message.content,
      timeStamp: Date.now(),
    };

    chat.messages.push(assistantMessage);
    await chat.save();

    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });
  } catch (error) {
    console.error("Chat AI error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
