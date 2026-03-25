import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return Response.json({
      authenticated: !!user,
      userId: user?.id,
      email: user?.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      {
        error: msg,
        authenticated: false,
      },
      { status: 500 }
    );
  }
}
