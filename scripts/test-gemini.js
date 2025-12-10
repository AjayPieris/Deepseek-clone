require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not set in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // For listing models, we don't need a specific model instance,
    // but the SDK doesn't expose listModels directly on genAI instance in all versions.
    // Actually, it does via the ModelManager or similar, but let's check the docs pattern.
    // In 0.24.1, it might be different.
    // Let's try to just use a known model to check connectivity first.

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Attempting to generate content with gemini-2.5-flash...");
    const result = await model.generateContent("Hello");
    console.log("Success! Response:", result.response.text());
  } catch (error) {
    console.error("Error with gemini-2.5-flash:", error.message);

    // If that fails, let's try gemini-2.0-flash-lite
    try {
      console.log(
        "Attempting to generate content with gemini-2.0-flash-lite..."
      );
      const modelPro = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });
      const resultPro = await modelPro.generateContent("Hello");
      console.log(
        "Success with gemini-2.0-flash! Response:",
        resultPro.response.text()
      );
    } catch (errorPro) {
      console.error("Error with gemini-1.5-flash:", errorPro.message);
    }

    // List models via raw fetch
    console.log("\nListing available models via raw API...");
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const data = await response.json();
      if (data.models) {
        console.log("Available models:");
        data.models.forEach((m) => {
          if (
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent")
          ) {
            console.log(`- ${m.name} (supports generateContent)`);
          } else {
            console.log(`- ${m.name}`);
          }
        });
      } else {
        console.log("No models found or error:", data);
      }
    } catch (e) {
      console.error("Error listing models:", e);
    }
  }
}
listModels();
