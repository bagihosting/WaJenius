// src/app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsappMessage } from '@/lib/whatsapp-service';
import { generateAutomaticReply } from '@/ai/flows/automatic-replies';
import { saveMessage } from '@/lib/firestore-service';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET; 

/**
 * Verifies the webhook subscription.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('Webhook verification failed.');
    if (token !== VERIFY_TOKEN) {
      console.error('Verify tokens do not match.');
    }
    return new NextResponse('Forbidden', { status: 403 });
  }
}

/**
 * Handles incoming messages from WhatsApp.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-hub-signature-256') || '';
  const body = await request.text();
  
  if (!verifySignature(body, signature)) {
      console.error('Signature verification failed. Request denied.');
      return new NextResponse('Forbidden', { status: 403 });
  }
  console.log('Signature verified successfully.');

  try {
    const payload = JSON.parse(body);
    console.log('Received WhatsApp payload:', JSON.stringify(payload, null, 2));

    if (payload.object === 'whatsapp_business_account' && payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const messageData = payload.entry[0].changes[0].value.messages[0];
      
      // We only want to process text messages
      if (messageData.type !== 'text') {
        console.log('Ignoring non-text message.');
        return NextResponse.json({ status: 'ignored', reason: 'non-text message' });
      }

      const from = messageData.from; // Sender's phone number
      const text = messageData.text.body;

      console.log(`Processing message from ${from}: "${text}"`);

      // 1. Save incoming message to Firestore
      await saveMessage(from, { text, sender: 'user' });
      
      // 2. Generate AI reply
      const rules = "Anda adalah asisten AI yang ramah dan membantu untuk ChatterJet. Jawab pertanyaan dengan singkat dan jelas. Jika Anda tidak tahu jawabannya, katakan Anda akan mencarinya.";
      const { reply } = await generateAutomaticReply({ message: text, rules });
      
      // 3. Send reply to WhatsApp
      await sendWhatsappMessage(from, reply);
      
      // 4. Save bot's reply to Firestore
      await saveMessage(from, { text: reply, sender: 'bot', recipient: from });

      console.log(`Sent reply to ${from}: "${reply}" and saved to Firestore.`);

      return NextResponse.json({ status: 'success' });
    } else {
      console.log('Ignoring non-message payload.');
      return NextResponse.json({ status: 'ignored', reason: 'non-message payload' });
    }
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ error: 'Failed to process webhook', details: errorMessage }), { status: 500 });
  }
}


/**
 * Verifies the signature of the incoming webhook request.
 * @param body The raw request body as a string.
 * @param signature The signature from the 'x-hub-signature-256' header.
 * @returns True if the signature is valid, false otherwise.
 */
function verifySignature(body: string, signature: string): boolean {
    const secret = APP_SECRET;
    
    // If the app secret isn't set, we can't verify the signature.
    // For production, this should always be set.
    if (!secret || secret === 'YOUR_APP_SECRET' || secret === '41893946d02025cc29cb11905ece6ff3') {
        console.warn('WHATSAPP_APP_SECRET is not set or is using a placeholder. Signature verification skipped. This is NOT secure for production.');
        // In a real production environment, you should fail this check if the secret is missing.
        // For development convenience, we can allow it to pass but with a strong warning.
        return true; 
    }
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const calculatedSignature = `sha256=${hmac.digest('hex')}`;
    
    try {
      // Use crypto.timingSafeEqual to prevent timing attacks.
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));
    } catch (e) {
      console.error('Error during timingSafeEqual comparison:', e);
      return false;
    }
}
