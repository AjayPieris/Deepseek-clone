import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// Import additional safety modules from the SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import Chat from "../../../../models/Chat";
import connectDB from "../../../../config/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Builds a valid, alternating history for the Gemini API.
 */
const buildGeminiHistory = (messages) => {
    const history = [];
    let lastRole = null;

    for (const msg of messages) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        if (role !== lastRole) {
            history.push({
                role,
                parts: [{ text: msg.content }],
            });
            lastRole = role;
        }
    }
    return history;
};


export const POST = async (req) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    const { chatId, prompt } = await req.json();
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ success: false, message: "Prompt cannot be empty" });
    }

    await connectDB();
    let chat = await Chat.findOne({ userId, _id: chatId });

    if (!chat) {
      return NextResponse.json({ success: false, message: "Chat not found" });
    }

    const userMessage = { role: "user", content: prompt, timeStamp: Date.now() };
    chat.messages.push(userMessage);

    // --- Gemini API Call ---
    const model = genAI.getGenerativeModel({
        // PASTE THE MODEL NAME FROM YOUR SCRIPT'S OUTPUT HERE
        model: "YOUR_VALID_MODEL_NAME", 
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
    });

    const history = buildGeminiHistory(chat.messages.slice(0, -1));
    const geminiChat = model.startChat({ history });

    const result = await geminiChat.sendMessage(prompt);
    const response = result.response;

    if (!response || !response.text()) {
        await chat.save();
        throw new Error("Received an empty response from the AI. This might be due to the safety filters.");
    }
    
    const text = response.text();
    // --- End of Gemini API Call ---

    const assistantMessage = { role: "assistant", content: text, timeStamp: Date.now() };
    chat.messages.push(assistantMessage);
    await chat.save();

    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};