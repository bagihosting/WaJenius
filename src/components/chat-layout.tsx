'use client';

import { useState, useEffect } from 'react';
import type { Message as MessageType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { LogOut, MoreVertical, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';

type ChatLayoutProps = {
  onDisconnect: () => void;
};

export function ChatLayout({ onDisconnect }: ChatLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-muted/40">
        <Card className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              <Image src="/whatsapp-logo.svg" alt="WhatsApp Logo" width="32" height="32" data-ai-hint="WhatsApp logo"/>
              Terhubung ke WhatsApp!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Bot Anda sekarang aktif. Buka aplikasi WhatsApp di ponsel Anda dan kirim pesan ke nomor yang telah Anda daftarkan.
            </p>
            <p className="text-sm text-foreground font-medium bg-primary/10 p-3 rounded-lg">
              Nomor Bot: {process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '(Nomor tidak dikonfigurasi)'}
            </p>
            <div className="flex justify-center pt-2">
              <Send className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
