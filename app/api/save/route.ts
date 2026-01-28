import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { password, knowledge } = await req.json();

    // 1. Password Check
    if (password !== "daveeee") {
      return NextResponse.json({ error: "Unauthorized: Incorrect Password" }, { status: 401 });
    }

    // 2. The "Upsert" Logic
    // This tells Supabase: "If ID 1 exists, update it. If not, create it."
    const { error } = await supabase
      .from('mochi_settings')
      .upsert({ 
        id: 1, 
        knowledge: knowledge, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Save Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
