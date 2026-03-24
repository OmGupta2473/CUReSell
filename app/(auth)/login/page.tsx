import LoginPageClient from './LoginPageClient';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  return (
    <LoginPageClient
      initialError={searchParams?.error}
      nextPath={searchParams?.next}
    />
  );
}
