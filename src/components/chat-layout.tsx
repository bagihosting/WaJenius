'use client';

import { useState, useEffect } from 'react';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { generateAutomaticReply } from '@/ai/flows/automatic-replies';
import { generateSmartReplies } from '@/ai/flows/smart-replies';
import { improvePrompt } from '@/ai/flows/improve-prompt';
import type { Message as MessageType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { LogOut, MoreVertical } from 'lucide-react';

const fixedRules = "Jika pengguna bertanya tentang cuaca, katakan Anda tidak tahu. Jika pengguna menyapa, balas sapaan dengan ramah. Untuk pertanyaan lain, katakan 'Saya adalah bot sederhana'.";

type ChatLayoutProps = {
  onDisconnect: () => void;
};

export function ChatLayout({ onDisconnect }: ChatLayoutProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isBotReplying, setIsBotReplying] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedMessages = localStorage.getItem('chatterjet-history');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Failed to parse messages from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('chatterjet-history', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages to localStorage', error);
      }
    }
  }, [messages, isMounted]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: MessageType = { id: crypto.randomUUID(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsBotReplying(true);
    setSmartReplies([]);

    try {
      const { reply } = await generateAutomaticReply({ message: text, rules: fixedRules });
      const botMessage: MessageType = { id: crypto.randomUUID(), text: reply, sender: 'bot' };
      
      const fullHistory = [...messages, userMessage, botMessage];
      setMessages(fullHistory);
      
      const messageHistoryText = fullHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
      const { suggestedReplies } = await generateSmartReplies({ messageHistory: messageHistoryText, currentMessage: reply });
      setSmartReplies(suggestedReplies);

    } catch (error) {
      console.error("Error generating reply:", error);
      const errorMessage: MessageType = { id: crypto.randomUUID(), text: "Maaf, terjadi kesalahan saat menghasilkan balasan.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal berkomunikasi dengan AI.",
      });
    } finally {
      setIsBotReplying(false);
    }
  };

  const handleImprovePrompt = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) return prompt;
    setIsImproving(true);
    try {
      const { improvedPrompt } = await improvePrompt({ prompt });
      return improvedPrompt;
    } catch (error) {
      console.error("Error improving prompt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal meningkatkan prompt.",
      });
      return prompt;
    } finally {
      setIsImproving(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen w-full max-w-4xl bg-card border-x shadow-2xl animate-in fade-in duration-500">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/50">
                <AvatarImage src="/logo.svg" alt="ChatterJet Logo" />
                <AvatarFallback>CJ</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">ChatterJet</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-500/40 text-green-600 bg-green-500/10">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Terhubung
                    </Badge>
                </div>
            </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">Opsi</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDisconnect} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Putuskan Sambungan</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <MessageList messages={messages} isBotReplying={isBotReplying} />
      <MessageInput
        onSendMessage={handleSendMessage}
        onImprovePrompt={handleImprovePrompt}
        smartReplies={smartReplies}
        isImproving={isImproving}
      />
    </div>
  );
}
