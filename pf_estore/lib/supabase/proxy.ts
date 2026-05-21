// proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const isAdmin = user?.app_metadata?.role === "admin";
  const { pathname } = request.nextUrl;

  // Redirect logged-out users away from account pages
  if (!user && pathname.startsWith("/account")) {
    console.log("Redirecting to login from", pathname);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect non-admins away from admin pages
  if (pathname.startsWith("/admin")) {
    if (!user || !isAdmin) {
      console.log("Redirecting to home from admin page", pathname);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === "/auth/login" || pathname === "/auth/sign-up")) {
    console.log("Redirecting to home from auth page", pathname);
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/sign-up",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};