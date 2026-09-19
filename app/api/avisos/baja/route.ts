import { deleteLead, validUnsubscribe } from "@/lib/leads-store";

export const runtime = "nodejs";

async function unsubscribe(req: Request) {
  const q = new URL(req.url).searchParams;
  const id = q.get("id") ?? "";
  if (!validUnsubscribe(id, q.get("t") ?? "")) return false;
  await deleteLead(id);
  return true;
}

/** Enlace del email: da de baja y lleva a la página de confirmación. */
export async function GET(req: Request) {
  const ok = await unsubscribe(req).catch(() => false);
  return Response.redirect(new URL(`/avisos/baja${ok ? "" : "?error=1"}`, req.url), 303);
}

/** Baja con un clic desde el gestor de correo (List-Unsubscribe-Post). */
export async function POST(req: Request) {
  const ok = await unsubscribe(req).catch(() => false);
  return new Response(null, { status: ok ? 200 : 400 });
}
