import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Allow all requests through - middleware is for auth context, not route protection
  // The /api/auth route handler will process auth requests
  return;
}, {
  apiRoute: "/api/auth",
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
