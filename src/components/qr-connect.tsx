
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, QrCode, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

type QrConnectProps = {
  onConnect: () => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
};

const statusInfo = {
    disconnected: {
        title: "Hubungkan dengan WhatsApp",
        description: "Bot terhubung melalui API, bukan QR Code. Klik untuk menyimulasikan koneksi dan masuk ke dasbor.",
        icon: <QrCode className="mr-2" />,
        buttonText: "Hubungkan ke Dasbor",
        color: ""
    },
    scanning: {
        title: "Menyimulasikan Koneksi...",
        description: "Menghubungkan ke WhatsApp Business API...",
        icon: <Loader2 className="mr-2 animate-spin" />,
        buttonText: "Menghubungkan...",
        color: "text-blue-500"
    },
    connecting: {
        title: "Memverifikasi Kredensial...",
        description: "Harap tunggu, koneksi API sedang dibuat.",
        icon: <Loader2 className="mr-2 animate-spin" />,
        buttonText: "Menghubungkan...",
        color: "text-yellow-500"
    },
    connected: {
        title: "Terhubung!",
        description: "Koneksi API berhasil. Anda akan diarahkan ke dasbor.",
        icon: <Check className="mr-2" />,
        buttonText: "Selesai",
        color: "text-green-500"
    },
    error: {
        title: "Koneksi Gagal",
        description: "Gagal terhubung. Pastikan kredensial API Anda di file .env benar.",
        icon: <X className="mr-2" />,
        buttonText: "Coba Lagi",
        color: "text-red-500"
    },
}

export function QrConnect({ onConnect, connectionStatus, setConnectionStatus }: QrConnectProps) {
  const [showQr, setShowQr] = useState(false);
  const currentStatus = statusInfo[connectionStatus];
  const [qrKey, setQrKey] = useState('');

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setQrKey(Date.now().toString());
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (connectionStatus === 'scanning') {
      // Show QR for a bit for visual effect, then proceed
      setShowQr(true);
      timer = setTimeout(() => setConnectionStatus('connecting'), 2000);
    } else if (connectionStatus === 'connecting') {
      setShowQr(false);
      timer = setTimeout(() => {
        // Check for an environment variable to simulate connection error
        if (process.env.NEXT_PUBLIC_SIMULATE_WHATSAPP_CONNECTION_ERROR === 'true') {
            setConnectionStatus('error');
        } else {
            setConnectionStatus('connected');
        }
      }, 2000);
    } else if(connectionStatus === 'connected') {
        timer = setTimeout(() => {
            onConnect();
        }, 1500);
    } else {
      setShowQr(connectionStatus === 'disconnected');
    }

    return () => clearTimeout(timer);
  }, [connectionStatus, setConnectionStatus, onConnect]);
  
  const handleButtonClick = () => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      setConnectionStatus('scanning');
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center items-center mb-4">
            <Image src="/logo.svg" alt="WartaBot Logo" width="64" height="64" />
        </div>
        <CardTitle className={cn("text-2xl font-bold tracking-tight transition-colors", currentStatus.color)}>
          {currentStatus.title}
        </CardTitle>
        <CardDescription className="pt-2 min-h-[40px]">{currentStatus.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className={cn("p-2 bg-white rounded-lg border-2 shadow-inner transition-opacity duration-300", 
          !showQr && 'opacity-20'
        )}>
          {/* This QR is purely for visual simulation */}
           {qrKey ? (
            <Image
                key={qrKey}
                src={`https://placehold.co/256x256.png`}
                alt="Simulasi QR Code"
                width={256}
                height={256}
                priority
                data-ai-hint="QR code"
                className="rounded-md"
            />
           ) : (
            <Skeleton className="h-[256px] w-[256px] rounded-md" />
           )}
        </div>
        <Button 
          onClick={handleButtonClick} 
          className="w-full" 
          size="lg"
          disabled={connectionStatus === 'scanning' || connectionStatus === 'connecting' || connectionStatus === 'connected'}
        >
          {currentStatus.icon}
          {currentStatus.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
