import { SITE } from "@/lib/site";

/** ads.txt: declara a Google como vendedor autorizado del inventario de MeDa. */
export function GET() {
  const body = SITE.adsenseClient
    ? `google.com, ${SITE.adsenseClient.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`
    : "";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
