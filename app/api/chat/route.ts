import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    // 1. Fetch the LATEST knowledge from Supabase (Row ID 1)
    const { data: settings, error: dbError } = await supabase
      .from('mochi_settings')
      .select('knowledge')
      .eq('id', 1)
      .single();

    if (dbError || !settings) {
      console.error("Database Fetch Error:", dbError);
      return NextResponse.json({ text: "I'm having trouble accessing my knowledge bank. Please check Supabase connection." });
    }

    const knowledgeBase = settings.knowledge;

    // 2. Initialize Gemini with the STABLE model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 3. Construct the RAG Prompt
    const prompt = `
      You are Mochi, the AI expert for this project.
      Use the provided PROJECT DATA to answer the USER QUESTION.
      If the answer is not in the data, say you don't know yet.

      PROJECT DATA:
      ${knowledgeBase}

      USER QUESTION:
      ${userInput}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });

  } catch (error: any) {
    console.error("Mochi Logic Error:", error);
    return NextResponse.json({ text: "Mochi had a brain freeze. Check Vercel logs!" }, { status: 500 });
  }
}


export async function GET() {
  const { data: settings, error } = await supabase
    .from('mochi_settings')
    .select('knowledge, updated_at')
    .eq('id', 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(settings);
}
