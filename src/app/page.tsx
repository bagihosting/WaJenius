'use client';

import { useState, useCallback } from 'react';
import { QrConnect, type ConnectionStatus } from '@/components/qr-connect';
import { ChatLayout } from '@/components/chat-layout';
import { ConnectionSuccess } from '@/components/connection-success';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const handleConnect = useCallback(() => {
    setConnectionStatus('connected');
  }, []);

  const handleDisconnect = useCallback(() => {
    setConnectionStatus('disconnected');
  }, []);

  const renderContent = () => {
    switch (connectionStatus) {
      case 'connected':
        return <ConnectionSuccess onDisconnect={handleDisconnect} />;
      case 'disconnected':
      case 'scanning':
      case 'connecting':
      case 'error':
      default:
        return <QrConnect onConnect={handleConnect} setConnectionStatus={setConnectionStatus} connectionStatus={connectionStatus} />;
    }
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      {renderContent()}
    </main>
  );
}
