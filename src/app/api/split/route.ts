import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET() {
  try {
    // File lives OUTSIDE public/ — not directly accessible via URL
    const filePath = path.join(process.cwd(), "private-assets", "AMARX-SPLIT.pdf");
    const [fileBuffer, fileStat] = await Promise.all([
      readFile(filePath),
      stat(filePath),
    ]);

    // ETag based on file size + mtime — used by SW to detect updates
    const etag = crypto
      .createHash("md5")
      .update(`${fileStat.size}-${fileStat.mtimeMs}`)
      .digest("hex");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"AMARX-SPLIT.pdf\"",
        // Private caching only — no shared/proxy caches
        "Cache-Control": "private, no-store, must-revalidate",
        // ETag for update detection in Service Worker
        "ETag": `"${etag}"`,
        "Last-Modified": fileStat.mtime.toUTCString(),
        // Prevent embedding in external iframes
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self'",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
