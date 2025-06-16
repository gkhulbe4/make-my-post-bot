import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const gemini_api_key = process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  geminiConfig,
});

const generate = async (prompt) => {
  try {
    const result = await geminiModel.generateContent(prompt);
    // console.log(result.response.usageMetadata.promptTokenCount);
    // console.log(result.response.usageMetadata.candidatesTokenCount);
    // console.log(result.response.usageMetadata.totalTokenCount);
    const response = result.response.text();
    const cleanText = response.replace(/\*/g, "").trim();
    return cleanText;
  } catch (error) {
    console.log("response error", error);
  }
};

export default generate;
