import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

// FORCE the SDK to use the stable 'v1' API instead of 'v1beta'
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

    // 2. Initialize Gemini with the standard model string
    // By default, the latest SDK versions will handle this correctly if the Key is valid
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    // 3. Construct the RAG Prompt
    const prompt = `
    You are Mochi, a professional Web3 Technical Assistant.
    Use the KNOWLEDGE BASE below to answer the QUESTION.

    FORMATTING INSTRUCTIONS:
    - Use ### for Section Headers.
    - Use bullet points for lists of features or facts.
    - Use **bold** for important terms.
    - Break up long paragraphs into small, readable chunks.

    KNOWLEDGE BASE:
    ${settings.knowledge}

    QUESTION:
    ${userInput}
`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });

  } catch (error: any) {
    console.error("Mochi Logic Error:", error);
    // If it still fails, we check for specific status codes
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
