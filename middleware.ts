import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSafeRedirectPath } from '@/lib/utils/safeRedirect';

const PUBLIC_ROUTES = new Set(['/', '/login', '/verify']);
const AUTH_ROUTES = new Set(['/login', '/verify']);
const PUBLIC_API_PREFIXES = ['/api/auth'];

function isPublicRoute(path: string) {
  return (
    PUBLIC_ROUTES.has(path) ||
    path === '/search' ||
    /^\/listing\/[^/]+$/.test(path)
  );
}

function isPublicAsset(path: string) {
  return (
    path.startsWith('/_next') ||
    path === '/favicon.ico' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml' ||
    /\.[a-zA-Z0-9]+$/.test(path)
  );
}

function isPublicApiRoute(path: string) {
  return PUBLIC_API_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  if (isPublicAsset(path)) {
    return supabaseResponse;
  }

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

  if (isPublicApiRoute(path)) {
    return supabaseResponse;
  }

  if (path.startsWith('/api/') && !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user && AUTH_ROUTES.has(path)) {
    const next = getSafeRedirectPath(request.nextUrl.searchParams.get('next'), '/feed');
    return NextResponse.redirect(new URL(next === '/' ? '/feed' : next, request.url));
  }

  if (!user && !isPublicRoute(path)) {
    const loginUrl = new URL('/login', request.url);
    const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    if (next !== '/') {
      loginUrl.searchParams.set('next', next);
    }

    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
