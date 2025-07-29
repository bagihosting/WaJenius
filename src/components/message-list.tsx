'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from '@/components/message-bubble';
import type { Message } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type MessageListProps = {
  messages: Message[];
  isBotReplying: boolean;
};

export function MessageList({ messages, isBotReplying }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotReplying]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MessageBubble message={message} />
            </div>
          ))}
          {isBotReplying && (
            <div className="flex items-start gap-3 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Avatar className="h-8 w-8 shrink-0 border-2 border-muted">
                    <AvatarImage src="/logo.svg" alt="Bot Avatar" />
                    <AvatarFallback>B</AvatarFallback>
                </Avatar>
              <div className="flex items-center space-x-1.5 p-4 rounded-lg bg-muted">
                <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse"></span>
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
    </div>
  );
}
