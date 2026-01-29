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
      return NextResponse.json({ text: "Database Error: Please ensure row 1 exists in Supabase." });
    }

    // 2. Initialize Gemini with a version-locked string
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    // 3. Construct the RAG Prompt
    const prompt = `
      KNOWLEDGE BASE:
      ${settings.knowledge}

      QUESTION:
      ${userInput}

      INSTRUCTION: Answer strictly using the KNOWLEDGE BASE provided above.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });

  } catch (error: any) {
    console.error("Mochi Logic Error:", error);
    return NextResponse.json({ text: `Mochi Error: ${error.message}` }, { status: 500 });
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
