import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import Chat from "../../../../models/Chat";
import connectDB from "../../../../config/db";

// Initialize OpenAI client with DeepSeek API key and base URL
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const POST = async (req) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { chatId, prompt } = await req.json();
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({
        success: false,
        message: "Prompt cannot be empty",
      });
    }

    // Connect to MongoDB
    await connectDB();

    // Find chat by userId and chatId
    let chat = await Chat.findOne({ userId, _id: chatId });

    // If chat doesn't exist, create a new chat
    if (!chat) {
      chat = new Chat({
        userId,
        name: "New Chat",
        messages: [],
      });
    }

    // Add user message
    const userMessage = {
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
    };
    chat.messages.push(userMessage);

    // Call DeepSeek API with full conversation
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      store: true,
    });

    const assistantMessage = completion.choices[0].message;
    assistantMessage.timeStamp = Date.now();

    // Save assistant message
    chat.messages.push(assistantMessage);
    await chat.save();

    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};
