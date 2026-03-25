import { Navbar } from '@/components/layout/Navbar';

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
      .select('full_name, auth_provider')
      .eq('id', user.id)
      .single();

    const name = profile?.full_name ?? '';
    const isGoogleUser = profile?.auth_provider === 'google';

    const nameIsEmailPrefix = name && !name.includes(' ') && /^[0-9]/.test(name);
    needsProfileSetup = !name || (!isGoogleUser && nameIsEmailPrefix);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {needsProfileSetup && user ? (
        <ProfileSetupModal userId={user.id} email={user.email ?? ''} />
      ) : (
        <>
          <Navbar />
          <main className="max-w-5xl mx-auto px-3 pt-16 pb-20 md:pb-6">
            {children}
          </main>
          {/* <BottomNav /> */}
        </>
      )}
    </div>
  );
}
