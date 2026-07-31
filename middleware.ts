import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public: the landing page, the Clerk auth pages, the concept library, and the
// course viewer (so anyone can browse + open a library course without an
// account). The dashboard and the generate/cloud API routes still require
// sign-in — those are gated in their own handlers.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/learn",
  "/course(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
