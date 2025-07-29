'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Message as MessageType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { LogOut, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { generateSmartReplies } from '@/ai/flows/smart-replies';
import { improvePrompt } from '@/ai/flows/improve-prompt';
import { sendWhatsappMessage } from '@/lib/whatsapp-service';

type ChatLayoutProps = {
  onDisconnect: () => void;
};

const BOT_USER = {
    id: 'bot',
    name: 'ChatterJet',
    avatar: '/logo.svg',
};

const GUEST_USER = {
    id: 'user',
    name: 'Guest',
    avatar: 'https://placehold.co/32x32.png',
}

export function ChatLayout({ onDisconnect }: ChatLayoutProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isBotReplying, setIsBotReplying] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isImproving, setIsImproving] = useState(false);
  const { toast } = useToast();

  const recipientPhoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_RECIPIENT_PHONE_NUMBER || '';

  useEffect(() => {
    // Load chat history from localStorage on mount
    try {
      const savedHistory = localStorage.getItem('chatterjet-history');
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
        // Initial bot message if no history
        setMessages([
          {
            id: 'init-message',
            text: `Halo! Ini adalah dasbor ChatterJet. Anda dapat mengirim pesan ke nomor pengujian (${recipientPhoneNumber}) dari sini untuk memeriksa fungsionalitas.`,
            sender: 'bot',
          },
        ]);
      }
    } catch (error) {
        console.error('Failed to load chat history', error);
        setMessages([]);
    }
  }, [recipientPhoneNumber]);
  
  // Save history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('chatterjet-history', JSON.stringify(messages));
    } catch (error) {
        console.error('Failed to save chat history', error);
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!recipientPhoneNumber) {
        toast({
            variant: 'destructive',
            title: 'Gagal Mengirim Pesan',
            description: 'Nomor telepon penerima belum diatur di file .env (NEXT_PUBLIC_WHATSAPP_RECIPIENT_PHONE_NUMBER).',
        });
        return;
    }

    const newMessage: MessageType = { id: Date.now().toString(), text, sender: 'user', recipient: recipientPhoneNumber };
    setMessages((prev) => [...prev, newMessage]);
    setIsBotReplying(true);
    setSmartReplies([]);

    try {
        // Send message via WhatsApp API
        await sendWhatsappMessage(recipientPhoneNumber, text);

        // NOTE: The bot's reply will come via the webhook to the user's phone,
        // not directly back to this UI. This is a simulation that the message was sent.
        console.log('Pesan berhasil dikirim ke WhatsApp. Balasan akan muncul di perangkat pengguna.');
        toast({
            title: 'Pesan Terkirim',
            description: `Pesan Anda telah dikirim ke ${recipientPhoneNumber}. Balasan akan muncul di WhatsApp.`,
        });


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
            variant: 'destructive',
            title: 'Gagal Mengirim Pesan',
            description: `Gagal mengirim pesan melalui WhatsApp: ${errorMessage}`,
        });
        // Remove the message from UI if it failed to send
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
        setIsBotReplying(false);
    }
    
    // Fetch smart replies based on the new message
    const messageHistory = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    try {
        const { suggestedReplies } = await generateSmartReplies({
            messageHistory,
            currentMessage: text,
        });
        setSmartReplies(suggestedReplies);
    } catch (error) {
        console.error('Error fetching smart replies:', error);
    }

  }, [messages, toast, recipientPhoneNumber]);

  const handleImprovePrompt = async (prompt: string): Promise<string> => {
    setIsImproving(true);
    try {
        const { improvedPrompt } = await improvePrompt({ prompt });
        return improvedPrompt;
    } catch (error) {
        console.error('Error improving prompt:', error);
        toast({
            variant: 'destructive',
            title: 'Gagal Meningkatkan Prompt',
            description: 'Tidak dapat menghubungi AI untuk meningkatkan prompt saat ini.',
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
                <AvatarImage src={'/logo.svg'} alt="ChatterJet Logo" />
                <AvatarFallback>CJ</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">ChatterJet Dashboard</h1>
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
