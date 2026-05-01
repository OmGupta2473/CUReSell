export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <main className="page-reveal mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>;
}
