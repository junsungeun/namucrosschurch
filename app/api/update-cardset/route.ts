import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json() as {
      id: string;
      title?: string;
      series?: string;
      scripture?: string;
      summary?: string;
      youtube_url?: string | null;
      date?: string;
    };
    const supabase = createServiceClient();

    const { error } = await supabase.from("cardsets").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath("/archive");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
