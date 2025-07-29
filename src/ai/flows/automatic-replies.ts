'use server';

/**
 * @fileOverview Implements the automatic replies AI agent.
 *
 * - generateAutomaticReply - A function that generates automatic replies based on predefined rules and patterns.
 * - AutomaticReplyInput - The input type for the generateAutomaticReply function.
 * - AutomaticReplyOutput - The return type for the generateAutomaticReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticReplyInputSchema = z.object({
  message: z.string().describe('The incoming message from the user.'),
  rules: z
    .string()
    .describe(
      'A set of predefined rules and patterns to use for generating the automatic reply.'
    ),
});
export type AutomaticReplyInput = z.infer<typeof AutomaticReplyInputSchema>;

const AutomaticReplyOutputSchema = z.object({
  reply: z.string().describe('The automatically generated reply.'),
});
export type AutomaticReplyOutput = z.infer<typeof AutomaticReplyOutputSchema>;

export async function generateAutomaticReply(
  input: AutomaticReplyInput
): Promise<AutomaticReplyOutput> {
  return automaticRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticRepliesPrompt',
  input: {schema: AutomaticReplyInputSchema},
  output: {schema: AutomaticReplyOutputSchema},
  prompt: `You are an AI assistant designed to automatically respond to incoming messages based on predefined rules and patterns.

  Your goal is to analyze the context of the message and formulate an appropriate response based on the provided rules.
  The responses should be concise and helpful.

  Here are the rules and patterns to follow:
  {{rules}}

  Incoming Message: {{message}}

  Reply:`,
});

const automaticRepliesFlow = ai.defineFlow(
  {
    name: 'automaticRepliesFlow',
    inputSchema: AutomaticReplyInputSchema,
    outputSchema: AutomaticReplyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
