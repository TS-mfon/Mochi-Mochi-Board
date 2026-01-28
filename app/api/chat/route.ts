import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    // 1. Fetch the LATEST knowledge from Supabase
    const { data: settings } = await supabase.from('mochi_settings').select('knowledge').single();
    const knowledgeBase = settings?.knowledge || "No info provided yet.";

    // 2. Talk to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Context: ${knowledgeBase}\nUser Question: ${userInput}`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
