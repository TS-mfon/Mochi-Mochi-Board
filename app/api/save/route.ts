import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { password, knowledge } = await req.json();

    if (password !== "daveeee") {
      return NextResponse.json({ error: "Invalid Password" }, { status: 401 });
    }

    // This command finds row 1 and updates it, or creates it if missing
    const { error } = await supabase
      .from('mochi_settings')
      .upsert({ id: 1, knowledge, updated_at: new Date() });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
