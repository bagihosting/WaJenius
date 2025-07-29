// A Genkit flow to suggest smart, context-aware replies to incoming messages.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartRepliesInputSchema = z.object({
  messageHistory: z
    .string()
    .describe(
      'The history of the conversation so far, as a single string. Include previous turns of both the user and the bot.'
    ),
  currentMessage: z.string().describe('The latest message received from the user.'),
});
export type SmartRepliesInput = z.infer<typeof SmartRepliesInputSchema>;

const SmartRepliesOutputSchema = z.object({
  suggestedReplies: z
    .array(z.string())
    .describe('An array of suggested replies to the current message.'),
});
export type SmartRepliesOutput = z.infer<typeof SmartRepliesOutputSchema>;

export async function generateSmartReplies(input: SmartRepliesInput): Promise<SmartRepliesOutput> {
  return smartRepliesFlow(input);
}

const smartRepliesPrompt = ai.definePrompt({
  name: 'smartRepliesPrompt',
  input: {schema: SmartRepliesInputSchema},
  output: {schema: SmartRepliesOutputSchema},
  prompt: `You are a helpful chatbot assistant. Given the following conversation history and the latest user message, suggest 3 possible replies that the user can send.

Conversation History:
{{messageHistory}}

Current Message:
{{currentMessage}}

Suggested Replies:`,
});

const smartRepliesFlow = ai.defineFlow(
  {
    name: 'smartRepliesFlow',
    inputSchema: SmartRepliesInputSchema,
    outputSchema: SmartRepliesOutputSchema,
  },
  async input => {
    const {output} = await smartRepliesPrompt(input);
    return output!;
  }
);
