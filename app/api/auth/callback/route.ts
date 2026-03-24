import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const providerError = searchParams.get('error_description') ?? searchParams.get('error');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const provider = user.app_metadata?.provider ?? null;
        const metadata = user.user_metadata ?? {};
        const fullName =
          typeof metadata.full_name === 'string'
            ? metadata.full_name
            : typeof metadata.name === 'string'
              ? metadata.name
              : null;
        const avatarUrl =
          typeof metadata.avatar_url === 'string'
            ? metadata.avatar_url
            : typeof metadata.picture === 'string'
              ? metadata.picture
              : null;

        await supabase
          .from('profiles')
          .update({
            full_name: fullName ?? undefined,
            avatar_url: avatarUrl ?? undefined,
            auth_provider: provider,
          })
          .eq('id', user.id);
      }

      return NextResponse.redirect(new URL(next, origin));
    }

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  if (providerError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(providerError)}`, origin)
    );
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
}
