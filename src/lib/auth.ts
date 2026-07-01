// src/lib/auth.ts

import { redirect } from '@tanstack/react-router'
import type { MyRouterContext } from '@/core/contexts/MyRouterContext'

/**
 * Creates a reusable TanStack Router `beforeLoad` guard that checks if the
 * authenticated user has the given permission.
 *
 * @param permission - The permission code to check (e.g. 'USER_MENU_VIEW')
 * @param fallback - Optional redirect path when permission is missing (default: '/')
 *
 * @example
 * // In a route file:
 * beforeLoad: requirePermission('USER_MENU_VIEW')
 */
export function requirePermission(permission: string, fallback: string = '/403') {
  return async ({ context }: { context: MyRouterContext }) => {
    if (!context.auth?.permissions?.includes(permission)) {
      throw redirect({ to: fallback })
    }
  }
}

// import { betterAuth, } from "better-auth";
// import { cookiesPlugin } from "better-auth/plugins/cookies";

// export const auth = betterAuth({
//     // We don't need a database — we just read your Laravel JWT cookie
//     database: null,

//     session: {
//         expiresIn: "30d",
//         updateAge: "1d",
//     },

//     plugins: [
//         cookiesPlugin({
//             cookieName: "token",                    // ← matches your Laravel cookie
//             cookieOptions: {
//                 httpOnly: true,
//                 secure: true,                          // true in production, false in http localhost
//                 sameSite: "none",                      // required for cross-site (aipt.local ↔ aipt-api.local)
//                 path: "/",
//                 domain: import.meta.env.PROD ? ".aipt-api.local" : undefined,
//             },
//         }),
//     ],
// });