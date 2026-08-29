import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth-guard";
import { getSetting } from "@/lib/settings";

export async function GET() {
  const { error } = await requireCustomer();
  if (error) return error;

  const version = (await getSetting("active_split_media_id")) || "legacy";
  return NextResponse.json({ version });
}
