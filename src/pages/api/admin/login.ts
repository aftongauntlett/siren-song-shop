import type { APIRoute } from "astro";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createSessionToken,
  hasAdminConfig,
  validateAdminCredentials,
} from "../../../lib/adminAuth";

const resolveNextPath = (nextPathRaw: FormDataEntryValue | null): string => {
  if (typeof nextPathRaw !== "string") {
    return "/keystatic";
  }

  if (!nextPathRaw.startsWith("/") || nextPathRaw.startsWith("//")) {
    return "/keystatic";
  }

  return nextPathRaw;
};

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!hasAdminConfig()) {
    return new Response("Admin credentials are not configured.", {
      status: 500,
    });
  }

  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const nextPath = resolveNextPath(form.get("next"));

  if (typeof username !== "string" || typeof password !== "string") {
    return redirect("/admin?error=invalid", 302);
  }

  if (!validateAdminCredentials(username, password)) {
    return redirect(
      `/admin?error=invalid&next=${encodeURIComponent(nextPath)}`,
      302,
    );
  }

  const secret = import.meta.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return new Response("Admin credentials are not configured.", {
      status: 500,
    });
  }

  cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(username, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return redirect(nextPath, 302);
};
