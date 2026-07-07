// Served as a real route (not a /public static file — see the note in
// components/layout/Logo.tsx about static assets not serving reliably on
// this deploy target). No fetch handler: this app talks to a live database
// constantly, so caching responses would risk showing stale stock/invoice
// data. Its only job is to exist, which is enough for browsers to treat the
// app as installable.
export async function GET() {
  const body = `
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
    },
  });
}
