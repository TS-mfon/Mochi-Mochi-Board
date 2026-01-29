import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    // 1. Fetch data from Supabase Row 1
    const { data: settings, error: dbError } = await supabase
      .from('mochi_settings')
      .select('knowledge')
      .eq('id', 1)
      .single();

    if (dbError || !settings) {
      return NextResponse.json({ text: "Database fetch failed. Check your Supabase table!" });
    }

    // 2. Initialize the AI with the CORRECT model string
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. The RAG Prompt
    const prompt = `
      Context: ${settings.knowledge}
      Question: ${userInput}
      Instruction: Answer only using the context above.
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });

  } catch (error) {
    console.error("Mochi Logic Error:", error);
    return NextResponse.json({ text: "AI connection error. Check Vercel logs!" }, { status: 500 });
  }
}

// Keep the GET method for your "Last Updated" feature
export async function GET() {
  const { data: settings } = await supabase
    .from('mochi_settings')
    .select('knowledge, updated_at')
    .eq('id', 1)
    .single();
  return NextResponse.json(settings);
}
