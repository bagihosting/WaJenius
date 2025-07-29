import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={cn('flex items-start gap-3 w-full', isUser ? 'justify-end' : 'justify-start')}>
        <div className={cn('flex items-start gap-3 max-w-2xl', isUser && 'flex-row-reverse')}>
          <Avatar className={cn('h-8 w-8 shrink-0 border-2', isUser ? 'border-primary/50' : 'border-muted' )}>
              {isUser ? 
                  <AvatarImage src="https://placehold.co/32x32.png" alt="User Avatar" data-ai-hint="user avatar" /> :
                  <AvatarImage src="/logo.svg" alt="Bot Avatar" />
              }
              <AvatarFallback>{isUser ? 'U' : 'B'}</AvatarFallback>
          </Avatar>
          <div
              className={cn(
              'rounded-lg px-4 py-3 shadow-sm',
              isUser ? 'rounded-br-none bg-primary text-primary-foreground' : 'rounded-bl-none bg-muted text-foreground'
              )}
          >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
        </div>
    </div>
  );
}
