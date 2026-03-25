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
        className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-orange-200"
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
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <SendHorizonal size={16} />
      </button>
    </form>
  );
}
