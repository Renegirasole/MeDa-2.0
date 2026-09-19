import { allLeads, leadsConfigured, unsubscribeToken } from "@/lib/leads-store";
import { emailConfigured, monthlyEmail, sendEmail } from "@/lib/email";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Envío mensual (cron de Vercel, ver vercel.json). Vercel manda CRON_SECRET en la cabecera.
 * Sin Resend configurado no envía nada y lo dice.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("No autorizado", { status: 401 });
  if (!leadsConfigured() || !emailConfigured()) return Response.json({ ok: true, sent: 0, skipped: "email_not_configured" });
  let sent = 0;
  let failed = 0;
  for (const lead of await allLeads()) {
    const unsubscribe = `${SITE.url}/api/avisos/baja?id=${lead.id}&t=${unsubscribeToken(lead.id)}`;
    const mail = monthlyEmail(lead, unsubscribe);
    const ok = await sendEmail(lead.email, mail.subject, mail.html, mail.text, unsubscribe).catch(() => false);
    if (ok) sent++;
    else failed++;
  }
  return Response.json({ ok: true, sent, failed });
}
