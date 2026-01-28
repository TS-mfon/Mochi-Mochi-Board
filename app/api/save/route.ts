import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  const { password, knowledge } = await req.json();

  if (password !== "daveeee") return NextResponse.json({ error: "Wrong password" }, { status: 401 });

  const { error } = await supabase
    .from('mochi_settings')
    .update({ knowledge, updated_at: new Date() })
    .eq('id', 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
