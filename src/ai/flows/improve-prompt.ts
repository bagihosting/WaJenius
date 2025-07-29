'use server';
/**
 * @fileOverview This file defines a Genkit flow for improving user prompts using AI suggestions.
 *
 * It exports:
 * - `improvePrompt`: An async function that takes a prompt as input and returns an improved prompt.
 * - `ImprovePromptInput`: The input type for the `improvePrompt` function.
 * - `ImprovePromptOutput`: The output type for the `improvePrompt` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImprovePromptInputSchema = z.object({
  prompt: z.string().describe('The original prompt to be improved.'),
});
export type ImprovePromptInput = z.infer<typeof ImprovePromptInputSchema>;

const ImprovePromptOutputSchema = z.object({
  improvedPrompt: z.string().describe('The improved prompt suggested by the AI.'),
});
export type ImprovePromptOutput = z.infer<typeof ImprovePromptOutputSchema>;

export async function improvePrompt(input: ImprovePromptInput): Promise<ImprovePromptOutput> {
  return improvePromptFlow(input);
}

const improvePromptPrompt = ai.definePrompt({
  name: 'improvePromptPrompt',
  input: {schema: ImprovePromptInputSchema},
  output: {schema: ImprovePromptOutputSchema},
  prompt: `You are an AI assistant designed to help users improve their prompts for a chat application.

  Your goal is to make the prompt clearer and more specific so that the user gets better responses from the chat application.

  Original Prompt: {{{prompt}}}

  Improved Prompt:`, // Removed unnecessary Handlebars braces
});

const improvePromptFlow = ai.defineFlow(
  {
    name: 'improvePromptFlow',
    inputSchema: ImprovePromptInputSchema,
    outputSchema: ImprovePromptOutputSchema,
  },
  async input => {
    const {output} = await improvePromptPrompt(input);
    return output!;
  }
);
