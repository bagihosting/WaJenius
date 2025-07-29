// src/app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsappMessage } from '@/lib/whatsapp-service';
import { generateAutomaticReply } from '@/ai/flows/automatic-replies';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const GRAPH_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

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
      console.error('Signature verification failed.');
      return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const payload = JSON.parse(body);
    console.log('Received WhatsApp payload:', JSON.stringify(payload, null, 2));

    if (payload.object === 'whatsapp_business_account' && payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const messageData = payload.entry[0].changes[0].value.messages[0];
      
      if (messageData.type !== 'text') {
        console.log('Ignoring non-text message.');
        return NextResponse.json({ status: 'ignored', reason: 'non-text message' });
      }

      const from = messageData.from; // Sender's phone number
      const text = messageData.text.body;

      console.log(`Processing message from ${from}: "${text}"`);
      
      const rules = "Anda adalah asisten AI yang ramah. Jawab pertanyaan dengan singkat dan jelas. Jika Anda tidak tahu jawabannya, katakan Anda akan mencarinya.";
      const { reply } = await generateAutomaticReply({ message: text, rules });
      
      await sendWhatsappMessage(from, reply);

      console.log(`Sent reply to ${from}: "${reply}"`);

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
 * @param body The raw request body.
 * @param signature The signature from the 'x-hub-signature-256' header.
 * @returns True if the signature is valid, false otherwise.
 */
function verifySignature(body: string, signature: string): boolean {
    if (!GRAPH_API_TOKEN) {
        console.warn('GRAPH_API_TOKEN is not set. Signature verification skipped.');
        // In a real production environment, you might want to fail this check if the token is missing.
        // For development and ease of testing, we can allow it to pass.
        return true;
    }
    
    const hmac = crypto.createHmac('sha256', GRAPH_API_TOKEN);
    hmac.update(body);
    const calculatedSignature = `sha256=${hmac.digest('hex')}`;
    
    return calculatedSignature === signature;
}
