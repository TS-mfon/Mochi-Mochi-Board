import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    // 1. Fetch knowledge from Supabase
    const { data: settings, error: dbError } = await supabase
      .from('mochi_settings')
      .select('knowledge')
      .eq('id', 1)
      .single();

    if (dbError || !settings) {
      return NextResponse.json({ text: "Mochi couldn't find the knowledge base in the database." });
    }

    // 2. Initialize Gemini with the FULL resource path
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    // 3. Construct the RAG (Retrieval-Augmented Generation) Prompt
    const prompt = `
      CONTEXT FROM KNOWLEDGE BASE:
      ${settings.knowledge}

      USER QUESTION:
      ${userInput}

      INSTRUCTION: Answer the question using ONLY the context provided above.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });

  } catch (error) {
    console.error("Mochi Logic Error:", error);
    return NextResponse.json({ text: "AI Request Failed. Verify your API Key in Vercel." }, { status: 500 });
  }
}

export async function GET() {
  const { data: settings } = await supabase
    .from('mochi_settings')
    .select('knowledge, updated_at')
    .eq('id', 1)
    .single();
  return NextResponse.json(settings);
}
