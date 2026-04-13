import "../.astro/types.d.ts";

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly CONTACT_TO_EMAIL: string;
  readonly CONTACT_FROM_EMAIL: string;
  readonly UPSTASH_REDIS_REST_URL?: string;
  readonly UPSTASH_REDIS_REST_TOKEN?: string;
  readonly KV_REST_API_URL?: string;
  readonly KV_REST_API_TOKEN?: string;
  readonly RATE_LIMIT_NAMESPACE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
