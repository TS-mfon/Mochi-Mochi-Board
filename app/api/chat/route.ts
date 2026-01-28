import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    // 1. Fetch data and handle potential DB errors
    const { data: settings, error: dbError } = await supabase
      .from('mochi_settings')
      .select('knowledge')
      .eq('id', 1)
      .single();

    if (dbError || !settings?.knowledge) {
      return NextResponse.json({ text: "I can't access my knowledge base right now. Please check the Admin settings." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 2. Clearer Prompting
    const prompt = `
      You are Mochi, the official crypto assistant. 
      Use the following PROJECT DATA to answer the USER QUESTION.
      
      PROJECT DATA: 
      ${settings.knowledge}
      
      USER QUESTION: 
      ${userInput}
      
      If the answer is not in the data, say you don't have that info yet.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ text: text || "Mochi is speechless. Try re-phrasing your question." });
  } catch (error) {
    console.error("Mochi Logic Error:", error);
    return NextResponse.json({ text: "Mochi had a brain freeze. Check your Vercel logs!" });
  }
}
