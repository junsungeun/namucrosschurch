import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceClient, errorResponse, okResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json() as { id: string };
    if (!id) return errorResponse("id 필수", 400);

    const supabase = getServiceClient();
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return errorResponse(`DB: ${error.message}`);

    revalidatePath("/");
    revalidatePath("/archive");
    return okResponse();
  } catch (e) {
    return errorResponse(String(e));
  }
}
