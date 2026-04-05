import type { APIRoute } from "astro";
import { z } from "zod";
import { Resend } from "resend";

// --- Config ---
const burstWindowMs = 60 * 1_000;
const dailyWindowMs = 24 * 60 * 60 * 1_000;
const maxRequestsPerBurstByIp = 2;
const maxRequestsPerDayByIp = 5;
const maxRequestsPerDayByEmail = 3;
const minSubmissionTimeMs = 3_000;
const maxSubmissionAgeMs = 2 * 60 * 60 * 1_000;

const REASON_VALUES = [
  "request_add",
  "suggest_resource",
  "request_remove",
  "general",
] as const;
type Reason = (typeof REASON_VALUES)[number];

const REASON_LABELS: Record<Reason, string> = {
  request_add: "Request shop be added",
  suggest_resource: "Suggest a shop or resource",
  request_remove: "Request a shop be removed / report a shop",
  general: "General question",
};

// --- Schema ---
const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  reason: z.enum(REASON_VALUES),
  message: z.string().trim().min(10).max(5_000),
});

// --- Rate limiting ---
type RateLimitEntry = { count: number; resetAt: number };
type GlobalWithStore = typeof globalThis & {
  __contactRateLimitStore?: Map<string, RateLimitEntry>;
};

const getRateLimitStore = (): Map<string, RateLimitEntry> => {
  const scope = globalThis as GlobalWithStore;
  scope.__contactRateLimitStore ??= new Map();
  return scope.__contactRateLimitStore;
};

const pruneExpired = (
  store: Map<string, RateLimitEntry>,
  now: number,
): void => {
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
};

const isRateLimited = (key: string, windowMs: number, max: number): boolean => {
  const now = Date.now();
  const store = getRateLimitStore();
  pruneExpired(store, now);
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count += 1;
  store.set(key, entry);
  return false;
};

// --- Helpers ---
const getClientIp = (request: Request): string | null => {
  for (const header of [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "fly-client-ip",
  ]) {
    const val = request.headers.get(header)?.split(",")[0]?.trim();
    if (val) return val;
  }
  return null;
};

const isSameOrigin = (request: Request): boolean => {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin && !referer) return false;
  if (origin && origin !== requestOrigin) return false;
  if (referer) {
    try {
      if (new URL(referer).origin !== requestOrigin) return false;
    } catch {
      return false;
    }
  }
  return true;
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (value: string): Promise<string> => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return toHex(new Uint8Array(buf));
};

const escapeHtml = (s: string): string =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const asString = (val: FormDataEntryValue | null): string =>
  typeof val === "string" ? val.trim() : "";

const wantsJson = (request: Request): boolean =>
  request.headers.get("x-contact-ajax") === "1" ||
  (request.headers.get("accept")?.toLowerCase() ?? "").includes(
    "application/json",
  );

const jsonResponse = (ok: boolean, status: number): Response =>
  new Response(JSON.stringify({ ok }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const reject = (
  request: Request,
  reason: string,
  clientIp: string | null,
  status = 400,
): Response => {
  console.warn("contact_rejected", { reason, hasClientIp: Boolean(clientIp) });
  if (wantsJson(request)) return jsonResponse(false, status);
  return Response.redirect(
    new URL("/contact?contact=error#contact-form", request.url),
    303,
  );
};

// --- Handler ---
export const POST: APIRoute = async ({ request }) => {
  if (!isSameOrigin(request)) {
    return reject(request, "origin_invalid", null);
  }

  const clientIp = getClientIp(request);
  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = import.meta
    .env;

  if (!RESEND_API_KEY || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    console.error("contact_email_unconfigured");
    return reject(request, "email_unconfigured", clientIp, 500);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return reject(request, "invalid_body", clientIp);
  }

  // Honeypot
  if (asString(formData.get("project-url"))) {
    return reject(request, "honeypot_triggered", clientIp);
  }

  // Timing check
  const startedAtRaw = asString(formData.get("form-started-at"));
  const startedAt = startedAtRaw ? Number(startedAtRaw) : null;
  if (!startedAt || !Number.isFinite(startedAt)) {
    return reject(request, "missing_started_at", clientIp);
  }
  const elapsed = Date.now() - startedAt;
  if (elapsed < minSubmissionTimeMs || elapsed > maxSubmissionAgeMs) {
    return reject(request, "timing_invalid", clientIp);
  }

  // Validate
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    reason: formData.get("reason"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return reject(request, "validation_failed", clientIp);
  }

  const { name, email, reason, message } = parsed.data;

  // Rate limiting
  if (clientIp) {
    if (
      isRateLimited(
        `ip:${clientIp}:burst`,
        burstWindowMs,
        maxRequestsPerBurstByIp,
      )
    ) {
      return reject(request, "burst_rate_limited", clientIp, 429);
    }
    if (
      isRateLimited(`ip:${clientIp}:day`, dailyWindowMs, maxRequestsPerDayByIp)
    ) {
      return reject(request, "daily_ip_rate_limited", clientIp, 429);
    }
  }

  const emailHash = await sha256Hex(email);
  if (
    isRateLimited(
      `email:${emailHash}:day`,
      dailyWindowMs,
      maxRequestsPerDayByEmail,
    )
  ) {
    return reject(request, "daily_email_rate_limited", clientIp, 429);
  }

  // Send
  const reasonLabel = REASON_LABELS[reason];
  const html = `
    <h2>New message via Siren Song contact form</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Reason:</strong> ${escapeHtml(reasonLabel)}</p>
    <h3>Message</h3>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: [CONTACT_TO_EMAIL],
    replyTo: email,
    subject: `[Siren Song] ${reasonLabel} — ${name}`,
    html,
  });

  if (error) {
    console.error("contact_send_failed", { message: error.message });
    return reject(request, "send_failed", clientIp, 502);
  }

  if (wantsJson(request)) return jsonResponse(true, 200);
  return Response.redirect(
    new URL("/contact?contact=sent#contact-form", request.url),
    303,
  );
};
