import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceClient, errorResponse, okResponse } from "@/lib/api-utils";
import { generateSlug } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { images, meta } = await req.json() as {
      images: string[];
      meta: {
        date: string; title: string; series?: string; scripture?: string;
        summary?: string; cards_data?: { subtitle?: string; content: string }[];
        youtube_url?: string | null; format: string;
      };
    };

    if (!images?.length || !meta?.title) return errorResponse("필수 데이터 누락", 400);

    const supabase = getServiceClient();
    const cardUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const base64 = images[i].replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const filename = `${Date.now()}_${i + 1}.png`;

      const { data, error } = await supabase.storage
        .from("cards")
        .upload(filename, buffer, { contentType: "image/png" });

      if (error) return errorResponse(`스토리지: ${error.message}`);

      const { data: urlData } = supabase.storage.from("cards").getPublicUrl(data.path);
      cardUrls.push(urlData.publicUrl);
    }

    const slug = generateSlug();
    const { error: insertError } = await supabase.from("cardsets").insert({
      ...meta,
      slug,
      template_id: "template-a",
      card_urls: cardUrls,
    });

    if (insertError) return errorResponse(`DB: ${insertError.message}`);

    revalidatePath("/archive");
    return okResponse({ cardUrls });
  } catch (e) {
    return errorResponse(String(e));
  }
}
