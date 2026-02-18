import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

export const POST = async (req) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({
        success: false,
        message: "No file provided",
      });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a temporary file path
    const fs = require("fs");
    const path = require("path");
    const os = require("os");

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);

    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, buffer);

    // Upload to Gemini File API
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    // Delete temporary file
    fs.unlinkSync(tempFilePath);

    // Return file metadata
    return NextResponse.json({
      success: true,
      data: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
        name: uploadResult.file.name,
        displayName: uploadResult.file.displayName,
        sizeBytes: uploadResult.file.sizeBytes,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to upload file",
    });
  }
};
