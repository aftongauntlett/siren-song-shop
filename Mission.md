# Siren Song Product Requirements Document

## Product Vision
Siren Song is a curated recommendation platform where trust is the product. The owner personally vouches for every recommendation across artists, makers, independent shops, tea, books, spirits, and gifting resources. The experience should feel like receiving a handwritten gift guide from a discerning friend, not browsing a marketplace.

## Problem Statement
Current recommendation ecosystems are saturated with dropshipped, low-trust listings and generic gifting bundles. Discovery quality has eroded. Users need a high-integrity destination where each recommendation has personal accountability behind it.

## Product Principles
- Curation over catalog scale
- Human trust over algorithmic ranking
- Editorial storytelling over transactional merchandising
- Timeless visual design over trend-driven clutter
- Accessibility and performance as baseline quality requirements

## Goals
- Publish a high-quality recommendation platform with clear editorial voice
- Enable non-technical content updates through a Git-based CMS
- Capture inbound recommendations and newsletter/contact interest via reliable email delivery
- Maintain technical quality with strict typing, linting, test coverage, and fast static delivery

## Non-Goals
- No shopping cart, checkout, inventory, or order management
- No marketplace onboarding for vendors
- No ad-based recommendation slots
- No algorithmic personalization in v1

## Target Audience
- Thoughtful gift buyers seeking meaningful, non-generic options
- People fatigued by mass-market and dropship marketplaces
- Readers who value provenance, craft, and independent creators

## Core Experience
1. Visitor lands on a visually rich, fast homepage with curated recommendations.
2. Visitor explores categories and reads personal rationale for each recommendation.
3. Visitor optionally submits a recommendation/contact request.
4. Site owner adds/edits recommendations through Keystatic.

## Functional Requirements
- Home page featuring curated recommendation cards
- Gift guide/editorial section backed by Astro Content Collections
- Keystatic admin interface for editor-managed recommendations
- Contact API endpoint with input validation and Resend email delivery
- Theme token system in `src/styles/theme.css`
- Reusable Astro component architecture in `src/components/`

## Quality Requirements
- WCAG 2.2 AA accessibility compliance targets
- Lighthouse-oriented performance posture (static-first + minimal JS)
- Strict TypeScript with no `any`
- ESLint zero-error standard
- Vitest coverage for library utilities and growth path for integration tests

## Success Metrics
- Editorial publishing workflow usable without code changes
- Submissions reliably delivered through Resend
- Build, lint, and tests pass in CI
- Users can discover recommendations quickly and trust the voice behind them

## Future Iterations
- Rich recommendation taxonomy and filtering
- Newsletter workflow and automated onboarding emails
- Structured trust signals (why this made the list, sourcing notes, update history)
- Rich media support and recommendation detail pages
