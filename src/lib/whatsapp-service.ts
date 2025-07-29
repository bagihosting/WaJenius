'use server';

import type { Message } from '@/lib/types';

const WHATSAPP_API_VERSION = 'v20.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

/**
 * Mengirim pesan teks ke pengguna melalui WhatsApp Business API.
 * @param to - Nomor telepon penerima.
 * @param text - Isi pesan yang akan dikirim.
 * @returns Promise yang resolve ketika pesan berhasil dikirim.
 */
export async function sendWhatsappMessage(to: string, text: string): Promise<void> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN || WHATSAPP_ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN') {
    console.warn('WhatsApp credentials not configured. Skipping message send. Please update your .env file.');
    // Mensimulasikan penundaan jaringan untuk pengembangan lokal tanpa kredensial
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: text,
    },
  };

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', responseData);
      throw new Error(`Error from WhatsApp API: ${responseData.error?.message || response.statusText}`);
    }

    console.log('WhatsApp message sent successfully:', responseData);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}
