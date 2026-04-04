# Siren Song

Siren Song is a curated recommendation platform built with Astro.

## Stack

- Astro 5
- Keystatic CMS
- TypeScript (strict)
- Vitest + ESLint

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:4321` for the site.
Open `http://localhost:4321/admin` for the editor.

## Scripts

```bash
npm run dev       # start local dev server
npm run build     # type-check + production build
npm run preview   # preview production build
npm run lint      # run ESLint
npm run test      # run unit tests once
npm run test:watch
```

## Notes

- Keystatic requires a React renderer in Astro. This project includes `@astrojs/react`, `react`, and `react-dom`.
- Admin UI is intentionally hidden from navigation and protected by middleware session auth.
- Set `ADMIN_USER`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in `.env` to access `/admin`.
- Content collections live in `src/content/` and reusable UI components live in `src/components/`.
