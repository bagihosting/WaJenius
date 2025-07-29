// src/app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsappMessage } from '@/lib/whatsapp-service';
import { generateAutomaticReply } from '@/ai/flows/automatic-replies';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

/**
 * Handles webhook verification from Meta.
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
  try {
    const payload = await request.json();
    console.log('Received WhatsApp payload:', JSON.stringify(payload, null, 2));

    // Basic validation of the payload structure
    if (payload.object === 'whatsapp_business_account' && payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const messageData = payload.entry[0].changes[0].value.messages[0];
      
      // We only process text messages for now
      if (messageData.type !== 'text') {
        console.log('Ignoring non-text message.');
        return NextResponse.json({ status: 'ignored', reason: 'non-text message' });
      }

      const from = messageData.from; // Sender's phone number
      const text = messageData.text.body;

      console.log(`Processing message from ${from}: "${text}"`);
      
      // Use the AI to generate a reply
      const rules = "Anda adalah asisten AI yang ramah. Jawab pertanyaan dengan singkat dan jelas. Jika Anda tidak tahu jawabannya, katakan Anda akan mencarinya.";
      const { reply } = await generateAutomaticReply({ message: text, rules });
      
      // Send the reply back to the user
      await sendWhatsappMessage(from, reply);

      console.log(`Sent reply to ${from}: "${reply}"`);

      return NextResponse.json({ status: 'success' });
    } else {
      // This might be a status update or other event, we can ignore it
      console.log('Ignoring non-message payload.');
      return NextResponse.json({ status: 'ignored', reason: 'non-message payload' });
    }
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ error: 'Failed to process webhook', details: errorMessage