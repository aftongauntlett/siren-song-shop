const resendApiUrl = "https://api.resend.com/emails";
const suspiciousRedirectPath = "/?contact=error#contact";
const resendTimeoutMs = 8000;
const burstWindowMs = 60 * 1000;
const dailyWindowMs = 24 * 60 * 60 * 1000;
const maxRequestsPerBurstByIp = 2;
const maxRequestsPerDayByIp = 5;
const maxRequestsPerDayByEmail = 3;
const minSubmissionTimeMs = 3000;
const maxSubmissionAgeMs = 2 * 60 * 60 * 1000;
const maxNameLength = 120;
const maxEmailLength = 254;
const maxOrgLength = 160;
const maxExistingSiteLength = 2048;
const maxMessageLength = 5000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type GlobalWithRateLimit = typeof globalThis & {
  __contactRateLimitStore?: Map<string, RateLimitEntry>;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const asString = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value.trim() : "";

const toNumber = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const isLikelyEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isLikelyHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (value: string): Promise<string> => {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(hashBuffer));
};

const redirectTo = (requestUrl: string, path: string): Response => {
  const url = new URL(path, requestUrl);
  return Response.redirect(url, 303);
};

const wantsJsonResponse = (request: Request): boolean => {
  if (request.headers.get("x-contact-ajax") === "1") {
    return true;
  }

  const accept = request.headers.get("accept")?.toLowerCase() ?? "";
  return accept.includes("application/json");
};

const jsonResponse = (body: { ok: boolean }, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const rejectSubmission = (
  request: Request,
  reason: string,
  clientIp: string | null,
  status = 400,
): Response => {
  console.warn("contact_submission_rejected", {
    reason,
    method: request.method,
    hasClientIp: Boolean(clientIp),
  });

  if (wantsJsonResponse(request)) {
    return jsonResponse({ ok: false }, status);
  }

  return redirectTo(request.url, suspiciousRedirectPath);
};

const getRateLimitStore = (): Map<string, RateLimitEntry> => {
  const scope = globalThis as GlobalWithRateLimit;
  scope.__contactRateLimitStore ??= new Map<string, RateLimitEntry>();
  return scope.__contactRateLimitStore;
};

const pruneExpiredRateLimitEntries = (
  store: Map<string, RateLimitEntry>,
  now: number,
): void => {
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
};

const getClientIp = (request: Request): string | null => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    const parsed = firstIp?.trim();
    if (parsed) {
      return parsed;
    }
  }

  const fallbackHeaders = [
    "x-real-ip",
    "cf-connecting-ip",
    "fly-client-ip",
    "x-vercel-forwarded-for",
  ];

  for (const header of fallbackHeaders) {
    const ip = request.headers.get(header)?.trim();
    if (ip) {
      return ip;
    }
  }

  return null;
};

const isAllowedBrowserSubmission = (request: Request): boolean => {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) {
    return false;
  }

  if (origin && origin !== requestOrigin) {
    return false;
  }

  if (referer) {
    try {
      if (new URL(referer).origin !== requestOrigin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
};

const isRateLimited = (
  key: string,
  windowMs: number,
  maxRequests: number,
): boolean => {
  const now = Date.now();
  const store = getRateLimitStore();
  pruneExpiredRateLimitEntries(store, now);
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count += 1;
  store.set(key, entry);
  return false;
};

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        Allow: "POST",
      },
    });
  }

  if (!isAllowedBrowserSubmission(request)) {
    return rejectSubmission(request, "origin_or_referer_invalid", null);
  }

  const clientIp = getClientIp(request);

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    return rejectSubmission(request, "email_provider_unconfigured", clientIp);
  }

  const formData = await request.formData();
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email"));
  const org = asString(formData.get("org"));
  const message = asString(formData.get("message"));
  const existingSite = asString(formData.get("existing-site"));
  const hpField = asString(formData.get("project-url"));
  const startedAtRaw = asString(formData.get("form-started-at"));
  const normalizedEmail = normalizeEmail(email);

  if (hpField) {
    return rejectSubmission(request, "honeypot_triggered", clientIp);
  }

  if (!name || !normalizedEmail || !message) {
    return rejectSubmission(request, "missing_required_fields", clientIp);
  }

  if (
    name.length > maxNameLength ||
    normalizedEmail.length > maxEmailLength ||
    org.length > maxOrgLength ||
    existingSite.length > maxExistingSiteLength ||
    message.length > maxMessageLength
  ) {
    return rejectSubmission(request, "field_length_limit_exceeded", clientIp);
  }

  if (!isLikelyEmail(normalizedEmail)) {
    return rejectSubmission(request, "invalid_email", clientIp);
  }

  if (existingSite && !isLikelyHttpUrl(existingSite)) {
    return rejectSubmission(request, "invalid_existing_site_url", clientIp);
  }

  const startedAt = toNumber(startedAtRaw);
  const now = Date.now();
  if (!startedAt) {
    return rejectSubmission(request, "missing_or_invalid_started_at", clientIp);
  }

  const elapsedMs = now - startedAt;
  if (elapsedMs < minSubmissionTimeMs || elapsedMs > maxSubmissionAgeMs) {
    return rejectSubmission(request, "submission_timing_invalid", clientIp);
  }

  if (clientIp) {
    const hitBurstLimit = isRateLimited(
      `ip:${clientIp}:burst`,
      burstWindowMs,
      maxRequestsPerBurstByIp,
    );
    if (hitBurstLimit) {
      return rejectSubmission(request, "ip_burst_rate_limited", clientIp, 429);
    }

    const hitDailyIpLimit = isRateLimited(
      `ip:${clientIp}:day`,
      dailyWindowMs,
      maxRequestsPerDayByIp,
    );
    if (hitDailyIpLimit) {
      return rejectSubmission(request, "ip_daily_rate_limited", clientIp, 429);
    }
  }

  const emailHash = await sha256Hex(normalizedEmail);
  const hitDailyEmailLimit = isRateLimited(
    `email:${emailHash}:day`,
    dailyWindowMs,
    maxRequestsPerDayByEmail,
  );
  if (hitDailyEmailLimit) {
    return rejectSubmission(request, "email_daily_rate_limited", clientIp, 429);
  }

  const html = `
    <h2>New project inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(normalizedEmail)}</p>
    <p><strong>Organization or project:</strong> ${escapeHtml(org || "Not provided")}</p>
    <p><strong>Existing website:</strong> ${escapeHtml(existingSite || "Not provided")}</p>
    <h3>Message</h3>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  let sendResponse: Response;

  try {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort("resend-timeout");
    }, resendTimeoutMs);

    try {
      sendResponse = await fetch(resendApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: normalizedEmail,
          subject: `New project inquiry from ${name}`,
          html,
        }),
        signal: timeoutController.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    const isTimeout =
      error instanceof DOMException && error.name === "AbortError";
    console.error("contact_email_send_failed", {
      reason: isTimeout ? "timeout" : "request_exception",
      timeoutMs: resendTimeoutMs,
      method: request.method,
      endpoint: resendApiUrl,
      hasClientIp: Boolean(clientIp),
    });
    if (wantsJsonResponse(request)) {
      return jsonResponse({ ok: false }, 502);
    }

    return redirectTo(request.url, suspiciousRedirectPath);
  }

  if (!sendResponse.ok) {
    let providerBody = "";
    try {
      providerBody = await sendResponse.text();
    } catch {
      providerBody = "";
    }

    console.error("contact_email_send_failed", {
      reason: "provider_non_ok",
      timeoutMs: resendTimeoutMs,
      method: request.method,
      endpoint: resendApiUrl,
      status: sendResponse.status,
      statusText: sendResponse.statusText,
      providerBody: providerBody.slice(0, 500),
      hasClientIp: Boolean(clientIp),
    });
    if (wantsJsonResponse(request)) {
      return jsonResponse({ ok: false }, 502);
    }

    return redirectTo(request.url, suspiciousRedirectPath);
  }

  if (wantsJsonResponse(request)) {
    return jsonResponse({ ok: true }, 200);
  }

  return redirectTo(request.url, "/?contact=sent#contact");
}
