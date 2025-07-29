import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={cn('flex items-end gap-3 w-full', isUser ? 'justify-end' : 'justify-start')}>
        <div className={cn('flex items-end gap-3 max-w-xl', isUser && 'flex-row-reverse')}>
        <Avatar className={cn('h-10 w-10 shrink-0', isUser ? 'bg-user-message' : 'bg-primary/10' )}>
            {isUser ? 
                <User className="h-6 w-6 text-user-message-foreground" /> :
                <Bot className="h-6 w-6 text-primary" />
            }
        </Avatar>
        <div
            className={cn(
            'rounded-lg px-4 py-3 shadow-sm',
            isUser ? 'rounded-br-none bg-user-message text-user-message-foreground' : 'rounded-bl-none bg-muted text-foreground'
            )}
        >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>
        </div>
    </div>
  );
}
