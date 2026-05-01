import type { Condition } from '@/lib/types';

export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100000) return `Rs. ${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `Rs. ${(rupees / 1000).toFixed(1)}k`;
  return `Rs. ${rupees.toLocaleString('en-IN')}`;
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function conditionColor(condition: Condition | string): string {
  const map: Record<string, string> = {
    like_new: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    good: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    fair: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  };
  return map[condition] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
}

export function formatFullPrice(paise: number): string {
  return `Rs. ${(paise / 100).toLocaleString('en-IN')}`;
}
