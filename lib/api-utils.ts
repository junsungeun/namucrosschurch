import { NextResponse } from "next/server";
import { createServiceClient } from "./supabase";

export function errorResponse(msg: string, status = 500) {
  return NextResponse.json({ error: msg }, { status });
}

export function okResponse(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data });
}

export function getServiceClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!url || !key) throw new Error("환경변수 미설정");
  return createServiceClient();
}
