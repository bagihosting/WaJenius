'use server';

import type { Message } from '@/lib/types';

const WHATSAPP_API_VERSION = 'v20.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

function areCredentialsValid(): boolean {
  if (
    !WHATSAPP_PHONE_NUMBER_ID ||
    !WHATSAPP_ACCESS_TOKEN ||
    !APP_SECRET ||
    WHATSAPP_ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN' ||
    APP_SECRET === 'YOUR_APP_SECRET' ||
    APP_SECRET === '41893946d02025cc29cb11905ece6ff3' 
  ) {
    return false;
  }
  return true;
}

/**
 * Mengirim pesan teks ke pengguna melalui WhatsApp Business API.
 * @param to - Nomor telepon penerima.
 * @param text - Isi pesan yang akan dikirim.
 * @returns Promise yang resolve ketika pesan berhasil dikirim.
 */
export async function sendWhatsappMessage(to: string, text: string): Promise<void> {
  if (!areCredentialsValid()) {
    console.warn(
      'WhatsApp credentials not fully configured in .env file. Skipping message send. Please check WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_APP_SECRET.'
    );
    // Mensimulasikan penundaan jaringan untuk pengembangan lokal tanpa kredensial
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      preview_url: false, // Disarankan untuk menonaktifkan pratinjau URL untuk bot
      body: text,
    },
  };

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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
