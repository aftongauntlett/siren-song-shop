import { defineMiddleware } from "astro:middleware";
import {
  ADMIN_SESSION_COOKIE,
  hasAdminConfig,
  verifySessionToken,
} from "./lib/adminAuth";

const isProtectedUiRoute = (pathname: string): boolean =>
  pathname.startsWith("/keystatic");
const isProtectedApiRoute = (pathname: string): boolean =>
  pathname.startsWith("/api/keystatic");

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  if (
    pathname !== "/admin" &&
    !isProtectedUiRoute(pathname) &&
    !isProtectedApiRoute(pathname)
  ) {
    return next();
  }

  if (!hasAdminConfig()) {
    return new Response("Admin credentials are not configured.", {
      status: 500,
    });
  }

  const secret = import.meta.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return new Response("Admin credentials are not configured.", {
      status: 500,
    });
  }

  const session = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = verifySessionToken(session, secret);

  if (pathname === "/admin") {
    if (isAuthenticated) {
      return Response.redirect(new URL("/keystatic", context.url), 302);
    }
    return next();
  }

  if (isAuthenticated) {
    return next();
  }

  if (isProtectedApiRoute(pathname)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const nextPath = `${pathname}${search}`;
  return Response.redirect(
    new URL(`/admin?next=${encodeURIComponent(nextPath)}`, context.url),
    302,
  );
});
