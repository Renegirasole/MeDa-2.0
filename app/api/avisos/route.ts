import { parseLead } from "@/lib/leads";
import { leadsConfigured, saveLead, unsubscribeToken } from "@/lib/leads-store";
import { emailConfigured, monthlyEmail, sendEmail } from "@/lib/email";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";

/** Alta en «Avísame cuando me dé». Responde siempre con JSON y sin detalles internos. */
export async function POST(req: Request) {
  if (!leadsConfigured()) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  const body = await req.json().catch(() => null);
  const parsed = parseLead(body);
  // A los bots les decimos que sí para que no insistan.
  if (!parsed.ok) return parsed.error === "bot" ? Response.json({ ok: true }) : Response.json({ ok: false, error: parsed.error }, { status: 400 });
  try {
    const { id, created } = await saveLead(parsed.lead);
    if (created && emailConfigured()) {
      const unsubscribe = `${SITE.url}/api/avisos/baja?id=${id}&t=${unsubscribeToken(id)}`;
      const mail = monthlyEmail(parsed.lead, unsubscribe, true);
      await sendEmail(parsed.lead.email, mail.subject, mail.html, mail.text, unsubscribe).catch(() => false);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }
}
