import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';

import { createClient } from '@/lib/supabase/server';
import { ProfileSetupModal } from '@/components/auth/ProfileSetupModal';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let needsProfileSetup = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, auth_provider, is_cu_verified')
      .eq('id', user.id)
      .single();

    // Check if user is from Google provider (either from auth or app_metadata)
    const provider = user.app_metadata?.provider || profile?.auth_provider;
    const isGoogleUser = provider === 'google';
    const isCUVerified = profile?.is_cu_verified ?? false;

    // Skip ProfileSetupModal if:
    // 1. User is a Google user (full_name auto-set by Google OAuth)
    // 2. User is CU verified (already completed verification)
    // 3. User has a full_name already
    needsProfileSetup = !isGoogleUser && !isCUVerified && !profile?.full_name;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      {needsProfileSetup && user ? (
        <ProfileSetupModal userId={user.id} email={user.email ?? ''} />
      ) : (
        <>
          <Navbar />
          <main className="app-container page-reveal relative z-10 pt-24 pb-28 md:pb-12">
            {children}
          </main>
          <BottomNav initialSignedIn={Boolean(user)} />
        </>
      )}
    </div>
  );
}
