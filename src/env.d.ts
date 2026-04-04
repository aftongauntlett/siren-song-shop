import "../.astro/types.d.ts";

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly CONTACT_TO_EMAIL: string;
  readonly CONTACT_FROM_EMAIL: string;
  readonly ADMIN_USER: string;
  readonly ADMIN_PASSWORD: string;
  readonly ADMIN_SESSION_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
