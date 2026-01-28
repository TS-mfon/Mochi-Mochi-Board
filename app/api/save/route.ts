import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { password, knowledge } = await req.json();

    if (password !== "daveeee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use .upsert with a specific ID to overwrite row 1
    const { error } = await supabase
      .from('mochi_settings')
      .upsert({ 
        id: 1, 
        knowledge: knowledge, 
        updated_at: new Date().toISOString() 
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
