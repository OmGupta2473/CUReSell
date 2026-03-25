import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { createClient } from '@/lib/supabase/server';
import { getLandingData } from '@/lib/utils/landingData';

export const revalidate = 60;

export default async function RootPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const code = searchParams?.code;
  const error = searchParams?.error;
  const errorDescription = searchParams?.error_description;

  if (
    typeof code === 'string' ||
    typeof error === 'string' ||
    typeof errorDescription === 'string'
  ) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (typeof value === 'string') params.set(key, value);
    }

    redirect(`/api/auth/callback?${params.toString()}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { trending, studentCount } = await getLandingData();

  return (
    <LandingPage
      trending={trending}
      studentCount={studentCount}
      isAuthenticated={Boolean(user)}
    />
  );
}
