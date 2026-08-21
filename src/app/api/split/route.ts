import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), "private-assets", "AMARX-SPLIT.pdf");
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        // private-cache: browser may cache but won't share, no download prompt
        "Cache-Control": "private, max-age=3600",
        // Explicitly inline so no "save file" dialog
        "Content-Disposition": "inline",
        // Block framing from outside origin
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch {
    return new NextResponse("Error loading PDF", { status: 500 });
  }
}
