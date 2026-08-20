import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "private-assets", "AMARX-SPLIT.pdf");
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        // Prevent caching on network level so SW manages it
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return new NextResponse("Error loading PDF", { status: 500 });
  }
}
