import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { formatEUR } from "@/lib/format";
import type { Lead } from "@/lib/leads";
import { SITE } from "@/lib/site";

/**
 * Envío de emails con Resend (https://resend.com), solo si hay RESEND_API_KEY.
 * Remitente: EMAIL_FROM (p. ej. «MeDa <avisos@medaono.com>», con el dominio verificado en Resend).
 */
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail(to: string, subject: string, html: string, text: string, unsubscribeUrl: string) {
  if (!emailConfigured()) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      reply_to: SITE.owner.email,
      subject,
      html,
      text,
      // Baja con un clic desde el propio gestor de correo (Gmail, Outlook).
      headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  return res.ok;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Qué quería la persona, en una frase: «un coche de 16.000 €», «un alquiler de 850 € al mes». */
export function goalText(lead: Pick<Lead, "category" | "amount">) {
  const c = CATEGORY_BY_SLUG[lead.category];
  const what = c.slug === "otro" ? "tu objetivo" : c.name.toLowerCase();
  return `${what} de ${formatEUR(lead.amount)}${c.kind === "recurring" ? " al mes" : ""}`;
}

/** El email del mes: corto, con un solo botón y la baja a la vista. */
export function monthlyEmail(lead: Pick<Lead, "category" | "amount">, unsubscribeUrl: string, welcome = false) {
  const goal = goalText(lead);
  const url = `${SITE.url}/calculadoras/${lead.category}?utm_source=email&utm_medium=aviso&utm_campaign=${welcome ? "alta" : "mensual"}`;
  const subject = welcome ? "Listo: te avisamos una vez al mes" : `¿Ya te da para ${goal}?`;
  const intro = welcome
    ? `Te escribiremos una vez al mes para que vuelvas a mirar si te da para ${goal}. No guardamos tus números: los pones tú cada vez, así la nota siempre es la de ese momento.`
    : `Hace un tiempo mirabas si te daba para ${goal}. En un mes cambian muchas cosas: lo que has ahorrado, un aumento, un gasto menos. Mira tu nota de hoy en dos minutos.`;
  const text = `${intro}\n\nMirar mi nota: ${url}\n\nNo quiero más emails: ${unsubscribeUrl}\n\nMeDa · ${SITE.url}`;
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f5f6f3;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0d1712">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e1e4df;border-radius:20px">
<tr><td style="padding:32px">
<p style="margin:0 0 20px;font-size:18px;font-weight:600;letter-spacing:-0.3px">MeDa</p>
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;letter-spacing:-0.5px">${esc(subject)}</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#36413b">${esc(intro)}</p>
<a href="${esc(url)}" style="display:inline-block;background:#0e7a4e;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 22px;border-radius:999px">Mirar mi nota</a>
<p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#5f6a63">Recibes este email porque te apuntaste en MeDa. <a href="${esc(unsubscribeUrl)}" style="color:#5f6a63">Darme de baja</a>.</p>
</td></tr></table>
</td></tr></table></body></html>`;
  return { subject, html, text };
}
