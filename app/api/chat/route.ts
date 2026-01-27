import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// This variable is strictly server-side. 
// It will NOT be sent to the user's browser.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userInput, knowledge } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key not configured on server." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      ROLE: You are the Mochi AI, the official knowledge assistant for this crypto project.
      CONTEXT: ${knowledge}
      INSTRUCTION: Answer the user's question using ONLY the provided context. 
      If the information is missing, tell the user you're still syncing that data from the blockchain.
      
      USER QUESTION: ${userInput}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: "Mochi is having a server hiccup." }, { status: 500 });
  }
}
