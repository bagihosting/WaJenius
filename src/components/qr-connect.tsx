'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, QrCode, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

type QrConnectProps = {
  onConnect: () => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
};

const statusInfo = {
    disconnected: {
        title: "Hubungkan dengan WhatsApp",
        description: "Pindai kode QR ini dengan ponsel Anda untuk memulai.",
        icon: <QrCode className="mr-2" />,
        buttonText: "Mulai Memindai",
        color: ""
    },
    scanning: {
        title: "Pindai Kode QR",
        description: "Buka WhatsApp di ponsel Anda, ketuk Menu > Perangkat Tertaut > Tautkan Perangkat.",
        icon: <Loader2 className="mr-2 animate-spin" />,
        buttonText: "Menunggu Pindaian...",
        color: "text-blue-500"
    },
    connecting: {
        title: "Menghubungkan...",
        description: "Harap tunggu, koneksi sedang dibuat.",
        icon: <Loader2 className="mr-2 animate-spin" />,
        buttonText: "Menghubungkan...",
        color: "text-yellow-500"
    },
    connected: {
        title: "Terhubung!",
        description: "Anda berhasil terhubung dengan WhatsApp.",
        icon: <Check className="mr-2" />,
        buttonText: "Selesai",
        color: "text-green-500"
    },
    error: {
        title: "Koneksi Gagal",
        description: "Gagal terhubung. Silakan coba lagi.",
        icon: <X className="mr-2" />,
        buttonText: "Coba Lagi",
        color: "text-red-500"
    },
}

export function QrConnect({ onConnect, connectionStatus, setConnectionStatus }: QrConnectProps) {
  const [qrKey, setQrKey] = useState(Date.now());
  const currentStatus = statusInfo[connectionStatus];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (connectionStatus === 'scanning') {
      // Simulate connecting after a delay
      timer = setTimeout(() => setConnectionStatus('connecting'), 4000);
    } else if (connectionStatus === 'connecting') {
      // Simulate connection success after a delay
      timer = setTimeout(() => {
        setConnectionStatus('connected');
      }, 3000);
    } else if(connectionStatus === 'connected') {
        // Automatically proceed to chat after a short delay
        timer = setTimeout(() => {
            onConnect();
        }, 1500);
    }

    return () => clearTimeout(timer);
  }, [connectionStatus, setConnectionStatus, onConnect]);
  
  const handleButtonClick = () => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      setQrKey(Date.now()); // Refresh QR code
      setConnectionStatus('scanning');
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="text-center">
        <CardTitle className={cn("text-3xl font-headline tracking-tight transition-colors", currentStatus.color)}>
          {currentStatus.title}
        </CardTitle>
        <CardDescription className="pt-2 min-h-[40px]">{currentStatus.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className={cn("p-4 bg-white rounded-lg border-2 shadow-inner transition-opacity duration-300", 
          (connectionStatus === 'connecting' || connectionStatus === 'connected') && 'opacity-20'
        )}>
          <Image
            key={qrKey}
            src={`https://placehold.co/256x256.png?t=${qrKey}`}
            alt="QR Code"
            width={256}
            height={256}
            priority
            data-ai-hint="QR code"
          />
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
