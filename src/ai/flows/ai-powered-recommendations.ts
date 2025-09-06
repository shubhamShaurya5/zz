
'use server';

/**
 * @fileOverview An AI agent for recommending watches based on user browsing history.
 *
 * - recommendWatches - A function that handles the watch recommendation process.
 * - RecommendWatchesInput - The input type for the recommendWatches function.
 * - RecommendWatchesOutput - The return type for the recommendWatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendWatchesInputSchema = z.object({
  browsingHistory: z
    .string()
    .describe('The user browsing history of watches on the site.'),
  allProducts: z.array(z.string()).describe('A list of all available product names.'),
});
export type RecommendWatchesInput = z.infer<typeof RecommendWatchesInputSchema>;

const RecommendWatchesOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommended product names based on browsing history. Should be a subset of the provided product list.'),
});
export type RecommendWatchesOutput = z.infer<typeof RecommendWatchesOutputSchema>;

export async function recommendWatches(input: RecommendWatchesInput): Promise<RecommendWatchesOutput> {
  return recommendWatchesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendWatchesPrompt',
  input: {schema: RecommendWatchesInputSchema},
  output: {schema: RecommendWatchesOutputSchema},
  prompt: `You are an expert watch recommender. Based on the user's browsing history, recommend a maximum of 4 watches from the provided list of available products that the user might be interested in. Only return product names that exist in the provided list.

  Browsing History: {{{browsingHistory}}}
  Available Products:
  {{#each allProducts}}
  - {{{this}}}
  {{/each}}
  `,
});

const recommendWatchesFlow = ai.defineFlow(
  {
    name: 'recommendWatchesFlow',
    inputSchema: RecommendWatchesInputSchema,
    outputSchema: RecommendWatchesOutputSchema,
  },
  async input => {
    // If there's no browsing history, don't call the AI.
    if (!input.browsingHistory || input.browsingHistory.trim() === '') {
        return { recommendations: [] };
    }
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (error: any) {
        // If the model is overloaded or unavailable, just return no recommendations instead of crashing.
        if (error.message && error.message.includes('503 Service Unavailable')) {
            console.warn('AI recommendation service is unavailable. Returning empty recommendations.');
            return { recommendations: [] };
        }
        // For other errors, re-throw them.
        throw error;
    }
  }
);
