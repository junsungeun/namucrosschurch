import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceClient, errorResponse, okResponse } from "@/lib/api-utils";
import { generateSlug } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      title: string; date: string; series?: string; scripture: string;
      body?: string; god_father?: string; god_son?: string; god_spirit?: string;
      youtube_url?: string;
    };

    if (!body.title?.trim() || !body.date?.trim() || !body.scripture?.trim()) {
      return errorResponse("필수 데이터 누락 (제목, 날짜, 성경본문)", 400);
    }

    const supabase = getServiceClient();
    const slug = generateSlug();

    const { data, error } = await supabase.from("articles").insert({
      slug,
      title: body.title.trim(),
      date: body.date.trim(),
      series: body.series?.trim() || null,
      scripture: body.scripture.trim(),
      body: body.body || null,
      god_father: body.god_father || null,
      god_son: body.god_son || null,
      god_spirit: body.god_spirit || null,
      youtube_url: body.youtube_url?.trim() || null,
    }).select("id, slug").single();

    if (error) return errorResponse(`DB: ${error.message}`);

    revalidatePath("/archive");
    return okResponse({ id: data.id, slug: data.slug });
  } catch (e) {
    return errorResponse(String(e));
  }
}
