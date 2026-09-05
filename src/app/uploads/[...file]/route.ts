import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ file: string[] }> }
) {
  try {
    const { file } = await context.params;
    if (!file || !Array.isArray(file) || file.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Protect against directory traversal
    for (const segment of file) {
      if (segment.includes("..") || segment.includes("/") || segment.includes("\\")) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const filePath = path.join(process.cwd(), "public", "uploads", ...file);

    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        return new NextResponse("Not Found", { status: 404 });
      }
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = file[file.length - 1].split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error serving uploaded asset:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
