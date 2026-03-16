import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { id, card_urls } = await req.json() as { id: string; card_urls: string[] };
    const supabase = createServiceClient();

    // 스토리지에서 이미지 삭제
    if (card_urls?.length) {
      const filenames = card_urls.map((url) => url.split("/").pop()!).filter(Boolean);
      if (filenames.length) {
        await supabase.storage.from("cards").remove(filenames);
      }
    }

    // DB에서 삭제
    const { error } = await supabase.from("cardsets").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath("/archive");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
