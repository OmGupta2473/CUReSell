import LoginPageClient from './LoginPageClient';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return <LoginPageClient initialError={searchParams?.error} />;
}
