
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LogOut, MessageSquare } from 'lucide-react';
import React from 'react';

type ConnectionSuccessProps = {
  onDisconnect: () => void;
};

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || 'nomor Anda';

export function ConnectionSuccess({ onDisconnect }: ConnectionSuccessProps) {
  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center items-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-green-600">
          Bot Terhubung!
        </CardTitle>
        <CardDescription className="pt-2 min-h-[40px]">
          Bot WhatsApp Anda sekarang aktif dan siap menerima pesan di nomor {whatsappNumber}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="text-center bg-muted p-4 rounded-lg w-full">
            <p className="font-semibold text-foreground mb-2">Langkah Selanjutnya</p>
            <p className="text-sm text-muted-foreground">
                Mulai percakapan dengan bot Anda langsung dari aplikasi WhatsApp di ponsel Anda.
            </p>
        </div>
        <Button 
          onClick={() => {
            const waLink = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}`;
            window.open(waLink, '_blank');
          }}
          className="w-full"
          size="lg"
        >
          <MessageSquare className="mr-2" />
          Mulai Mengobrol di WhatsApp
        </Button>
        <Button 
          onClick={onDisconnect} 
          className="w-full" 
          size="lg"
          variant="outline"
        >
          <LogOut className="mr-2" />
          Putuskan Sambungan
        </Button>
      </CardContent>
    </Card>
  );
}
