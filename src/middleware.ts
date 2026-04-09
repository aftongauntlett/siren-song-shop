import { defineMiddleware } from "astro:middleware";
export const onRequest = defineMiddleware(async ({ request }, next) => {
  // Defense-in-depth for GHSA-mr6q-rp88-fx84 on older @astrojs/vercel.
  if (
    request.headers.has("x-astro-path") ||
    request.headers.has("x_astro_path")
  ) {
    return new Response("Bad Request", { status: 400 });
  }

  return next();
});
