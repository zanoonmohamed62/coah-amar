import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { bus, ensureSubscriber, type RealtimeEvent } from "@/lib/realtime";
import { countOnline } from "@/lib/presence";

// The admin panel's live wire: new orders, screenshots, confirmations, and the
// visitor count — pushed, not polled.
//
// Server-Sent Events over ordinary HTTP. See src/lib/realtime.ts for why this
// rather than socket.io (it would need replacing `next start` with a custom
// server, on launch day). Only admins hold one of these open, so the connection
// count is in single digits no matter how busy the site is.

export const dynamic = "force-dynamic";
// Node, not Edge: the Redis subscriber and the event bus are Node-only.
export const runtime = "nodejs";

const PRESENCE_EVERY_MS = 10_000;
// Comment frames keep proxies (and mobile networks) from closing an idle
// stream. Nginx's default read timeout is 60s, so stay well inside it.
const HEARTBEAT_MS = 20_000;

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  ensureSubscriber();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          closed = true;
        }
      };

      const sendEvent = (event: RealtimeEvent) => send(`data: ${JSON.stringify(event)}\n\n`);

      // Tell the browser not to reconnect faster than this if the stream drops.
      send("retry: 5000\n\n");

      const onEvent = (event: RealtimeEvent) => sendEvent(event);
      bus().on("event", onEvent);

      const pushPresence = async () => {
        if (closed) return;
        try {
          sendEvent({ type: "presence", online: await countOnline() });
        } catch {
          /* Redis hiccup — the next tick tries again */
        }
      };

      await pushPresence();
      const presenceTimer = setInterval(() => void pushPresence(), PRESENCE_EVERY_MS);
      const heartbeat = setInterval(() => send(": keepalive\n\n"), HEARTBEAT_MS);

      // Fired when the admin closes the tab or navigates away.
      _req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(presenceTimer);
        clearInterval(heartbeat);
        bus().off("event", onEvent);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Nginx buffers proxied responses by default, which holds every event
      // until the buffer fills — the stream arrives in bursts minutes late, or
      // not at all. This header turns that off for this response.
      "X-Accel-Buffering": "no",
    },
  });
}
