'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

type QrConnectProps = {
  onConnect: () => void;
};

export function QrConnect({ onConnect }: QrConnectProps) {
  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline tracking-tight">Hubungkan dengan WhatsApp</CardTitle>
        <CardDescription className="pt-2">Pindai kode QR ini dengan ponsel Anda untuk memulai.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="p-4 bg-white rounded-lg border-2 shadow-inner">
          <Image
            src="https://placehold.co/256x256.png"
            alt="QR Code"
            width={256}
            height={256}
            priority
            data-ai-hint="QR code"
          />
        </div>
        <Button onClick={onConnect} className="w-full" size="lg">
          <QrCode className="mr-2" />
          Simulasikan Koneksi
        </Button>
      </CardContent>
    </Card>
  );
}
