import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceClient, errorResponse, okResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json() as {
      id: string; title?: string; series?: string; scripture?: string;
      summary?: string; youtube_url?: string | null; date?: string;
    };
    if (!id) return errorResponse("ID 누락", 400);

    const supabase = getServiceClient();
    const { error } = await supabase.from("cardsets").update(updates).eq("id", id);
    if (error) return errorResponse(error.message);

    revalidatePath("/archive");
    return okResponse();
  } catch (e) {
    return errorResponse(String(e));
  }
}
