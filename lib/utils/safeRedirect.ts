const LOCAL_REDIRECT_BASE = 'http://localhost';

export function getSafeRedirectPath(value: string | null | undefined, fallback = '/') {
  if (!value) return fallback;

  const trimmed = value.trim();

  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, LOCAL_REDIRECT_BASE);

    if (parsed.origin !== LOCAL_REDIRECT_BASE) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
