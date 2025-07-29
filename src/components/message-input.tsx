'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type MessageInputProps = {
  onSendMessage: (text: string) => void;
  onImprovePrompt: (prompt: string) => Promise<string>;
  smartReplies: string[];
  isImproving: boolean;
};

export function MessageInput({ onSendMessage, onImprovePrompt, smartReplies, isImproving }: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  const handleSmartReplyClick = (reply: string) => {
    onSendMessage(reply);
  };
  
  const handleImprove = async () => {
    const improved = await onImprovePrompt(text);
    setText(improved);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="p-4 border-t bg-background/80 backdrop-blur-sm shrink-0">
      {smartReplies.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {smartReplies.map((reply, index) => (
            <Button key={index} variant="outline" size="sm" onClick={() => handleSmartReplyClick(reply)} className="shadow-sm">
              {reply}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan Anda..."
          rows={1}
          className="resize-none max-h-40 flex-1 shadow-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" onClick={handleImprove} disabled={isImproving || !text.trim()}>
                    {isImproving ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    <span className="sr-only">Tingkatkan Prompt</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Tingkatkan Prompt</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <Button type="submit" size="icon" disabled={!text.trim()} className="shadow-sm">
          <Send />
          <span className="sr-only">Kirim</span>
        </Button>
      </form>
    </div>
  );
}
