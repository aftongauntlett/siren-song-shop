import type { APIRoute } from "astro";
import { ADMIN_SESSION_COOKIE } from "../../../lib/adminAuth";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(ADMIN_SESSION_COOKIE, { path: "/" });
  return redirect("/admin", 302);
};
