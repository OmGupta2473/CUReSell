import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/verify', '/api/auth/callback'];

function isPublicRoute(path: string) {
  return (
    PUBLIC_ROUTES.includes(path) ||
    path === '/search' ||
    /^\/listing\/[^/]+$/.test(path)
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isPublicAsset =
    path.startsWith('/_next') || path.startsWith('/api/auth') || path === '/favicon.ico';
  if (isPublicAsset) return supabaseResponse;

  // Signed-in users should not hit OTP verification directly.
  if (user && path === '/verify') {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Unauthenticated users going to protected routes -> send to login.
  if (!user && !isPublicRoute(path)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
