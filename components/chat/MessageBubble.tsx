'use client';

import type { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const sentAt = new Date(message.created_at).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-[20px] px-4 py-2.5 shadow-sm ${
          isOwn
            ? 'rounded-br-md bg-[linear-gradient(180deg,rgba(138,194,255,0.96),rgba(88,161,255,0.92))] text-slate-950'
            : 'rounded-bl-md border border-white/[0.08] bg-white/[0.06] text-white'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        <p
          className={`mt-1 text-[10px] ${
            isOwn ? 'text-slate-800/70' : 'text-slate-500'
          }`}
        >
          {sentAt}
        </p>
      </div>
    </div>
  );
}
