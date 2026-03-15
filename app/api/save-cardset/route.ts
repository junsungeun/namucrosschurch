import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { images, meta } = await req.json() as {
      images: string[]; // base64 PNG strings
      meta: {
        date: string; title: string; series?: string; scripture?: string;
        summary?: string; youtube_url?: string | null; format: string;
      };
    };

    const supabase = createServiceClient();
    const cardUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const base64 = images[i].replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const filename = `${Date.now()}_${i + 1}.png`;

      const { data, error } = await supabase.storage
        .from("cards")
        .upload(filename, buffer, { contentType: "image/png" });

      if (error) return NextResponse.json({ error: `스토리지: ${error.message}` }, { status: 500 });

      const { data: urlData } = supabase.storage.from("cards").getPublicUrl(data.path);
      cardUrls.push(urlData.publicUrl);
    }

    const { error: insertError } = await supabase.from("cardsets").insert({
      ...meta,
      template_id: "template-a",
      card_urls: cardUrls,
    });

    if (insertError) return NextResponse.json({ error: `DB: ${insertError.message}` }, { status: 500 });

    return NextResponse.json({ ok: true, cardUrls });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
