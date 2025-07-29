'use client';

import { useState, useCallback } from 'react';
import { QrConnect, type ConnectionStatus } from '@/components/qr-connect';
import { ChatLayout } from '@/components/chat-layout';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const handleConnect = useCallback(() => {
    setConnectionStatus('connected');
  }, []);

  const handleDisconnect = useCallback(() => {
    setConnectionStatus('disconnected');
    try {
      // Hapus riwayat saat memutuskan sambungan untuk sesi baru
      localStorage.removeItem('chatterjet-history');
    } catch (error) {
      console.error('Failed to remove chat history from localStorage', error);
    }
  }, []);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      {connectionStatus === 'connected' ? (
        <ChatLayout onDisconnect={handleDisconnect} />
      ) : (
        <QrConnect onConnect={handleConnect} setConnectionStatus={setConnectionStatus} connectionStatus={connectionStatus} />
      )}
    </main>
  );
}
