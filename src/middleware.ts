import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "@/libs/rateLimit";

export const runtime = "nodejs"; // Explicitly set the runtime to Node.js

const protectedRoutes = ["/dashboard", "/imageUpload"];

export default async function middleware(req: Request) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || "",
  });

  const isLoggedIn = !!token; // Check if the token exists
  const url = new URL(req.url);
  const isProtectedRoute = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  // Rate Limiting Logic
  if (url.pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 }); // 1 minute window
    
    // Check if the IP has exceeded the limit (20 requests per minute)
    const isAllowed = limiter.check(20, ip); 

    if (!isAllowed) {
       return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url)); // Redirect to homepage if not authenticated
  }

  // Protect Admin Routes
  if (url.pathname.startsWith("/admin")) {
    // Log for debugging
    console.log("🔒 Middleware Admin Check:");
    console.log("   - Path:", url.pathname);
    console.log("   - Is Logged In:", isLoggedIn);
    console.log("   - Token Role:", token?.role);
    
    if (!isLoggedIn) {
      console.log("   ❌ Access Denied: Not logged in");
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // Check for admin role
    if (token?.role !== 'admin') {
      console.log("   ❌ Access Denied: Role is not admin (Role: " + token?.role + ")");
      return NextResponse.redirect(new URL("/", req.url)); // Redirect non-admins
    }
    console.log("   ✅ Access Granted to Admin");
  }

  return NextResponse.next(); // Proceed if authenticated or route is not protected
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
