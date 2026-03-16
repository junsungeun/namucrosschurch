import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceClient, errorResponse, okResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const { id, card_urls } = await req.json() as { id: string; card_urls: string[] };
    if (!id) return errorResponse("ID 누락", 400);

    const supabase = getServiceClient();

    // 스토리지 이미지 삭제
    if (card_urls?.length) {
      const filenames = card_urls
        .map((url) => { try { return new URL(url).pathname.split("/").pop(); } catch { return null; } })
        .filter(Boolean) as string[];
      if (filenames.length) await supabase.storage.from("cards").remove(filenames);
    }

    const { error } = await supabase.from("cardsets").delete().eq("id", id);
    if (error) return errorResponse(error.message);

    revalidatePath("/archive");
    return okResponse();
  } catch (e) {
    return errorResponse(String(e));
  }
}
