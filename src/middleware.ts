import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Use the v5 auth helper
import { rateLimit } from "@/libs/rateLimit";

export const runtime = "nodejs"; // Keep Node.js runtime for Mongoose compatibility

const protectedRoutes = ["/dashboard", "/imageUpload"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const url = new URL(req.url); // req.url is a string in v5 wrapper? No, NextRequest.
  // Actually in v5 auth wrapper, req is (NextRequest & { auth: Session | null })

  // Log for debugging (Edge/Node logs)
  if (url.pathname.startsWith("/admin")) {
      console.log("🔒 Middleware v5 Check:");
      console.log("   - Path:", url.pathname);
      console.log("   - Auth Object:", !!req.auth);
      console.log("   - Role:", user?.role);
  }

  // Rate Limiting Logic
  if (url.pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });
    const isAllowed = limiter.check(20, ip); 
    if (!isAllowed) {
       return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect Admin Routes
  if (url.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      console.log("   ❌ Access Denied: Not logged in");
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    if (user?.role !== 'admin') {
      console.log("   ❌ Access Denied: User is not admin");
      return NextResponse.redirect(new URL("/", req.url));
    }
    console.log("   ✅ Access Granted");
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
