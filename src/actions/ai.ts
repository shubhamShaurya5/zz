'use server';

import { recommendWatches } from '@/ai/flows/ai-powered-recommendations';
import type { RecommendWatchesInput, RecommendWatchesOutput } from '@/ai/flows/ai-powered-recommendations';

export async function getRecommendationsAction(
    input: RecommendWatchesInput
): Promise<RecommendWatchesOutput> {
    return await recommendWatches(input);
}
