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
            ? 'rounded-br-md bg-gray-900 text-white'
            : 'rounded-bl-md border border-gray-100 bg-white text-gray-800'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        <p
          className={`mt-1 text-[10px] ${
            isOwn ? 'text-gray-300' : 'text-gray-400'
          }`}
        >
          {sentAt}
        </p>
      </div>
    </div>
  );
}
