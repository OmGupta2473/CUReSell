'use client';

import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';

interface ChatInputProps {
  onSend: (value: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  async function submitCurrentValue() {
    const trimmed = value.trim();
    if (!trimmed || disabled || sending) return;

    setSending(true);
    setValue('');
    try {
      await onSend(trimmed);
    } catch {
      setValue(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitCurrentValue();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={1}
        placeholder="Message seller..."
        className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition focus:border-[rgb(var(--focus))]/60 focus:ring-4 focus:ring-[rgb(var(--focus))]/10"
        disabled={disabled || sending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void submitCurrentValue();
          }
        }}
      />
      <button
        type="submit"
        disabled={disabled || sending || !value.trim()}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] text-slate-950 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SendHorizonal size={16} />
      </button>
    </form>
  );
}
