// src/lib/auth.ts
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