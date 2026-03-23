import { BottomNav } from '@/components/layout/BottomNav';
import { Navbar } from '@/components/layout/Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-3 pt-16 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
