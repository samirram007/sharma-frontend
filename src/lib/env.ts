/**
 * Resolved API base URL for API calls (always ends with `/api`).
 *
 * Falls back to the same-origin `/api` path when `VITE_API_BASE_URL` is unset —
 * that is what CI builds use (`VITE_API_BASE_URL=/api`), and it works in dev via
 * the Vite proxy (see `vite.config.js`). Keep the single source of truth here so
 * axios, token refresh, and the Echo channel-auth endpoint all agree.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
