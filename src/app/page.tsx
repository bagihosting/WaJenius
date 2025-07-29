'use client';

import { useState } from 'react';
import { QrConnect } from '@/components/qr-connect';
import { ChatLayout } from '@/components/chat-layout';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnected(true);
  };

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      {isConnected ? (
        <ChatLayout />
      ) : (
        <QrConnect onConnect={handleConnect} />
      )}
    </main>
  );
}
