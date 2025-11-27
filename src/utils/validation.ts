import { ExtractedIdea } from "../types/entities";

export interface IdeaValidationOptions {
	minIdeas: number;
	maxIdeas: number;
	maxSentencesPerIdea?: number;
}

export function validateIdeas(
	ideas: ExtractedIdea[],
	options: IdeaValidationOptions
): ExtractedIdea[] {
	// First, filter out invalid ideas and those exceeding sentence limits
	const validIdeas = ideas
		.filter((idea) => {
			if (!idea.label?.trim() || !idea.idea?.trim()) {
				console.warn(`Filtering out invalid idea: missing label or idea text`);
				return false;
			}

			if (options.maxSentencesPerIdea && !withinSentenceLimit(idea.idea, options.maxSentencesPerIdea)) {
				console.warn(
					`Filtering out idea "${idea.label}": exceeds sentence limit of ${options.maxSentencesPerIdea} sentences`
				);
				return false;
			}

			return true;
		})
		.map((idea) => ({
			...idea,
			tags: idea.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
		}));

	// Check if we have enough valid ideas
	if (validIdeas.length < options.minIdeas) {
		throw new Error(
			`Only ${validIdeas.length} valid ideas found, but minimum required is ${options.minIdeas}. ` +
			`Some ideas were filtered out due to validation failures.`
		);
	}

	// If we have too many, truncate to the maximum
	const finalIdeas = validIdeas.slice(0, options.maxIdeas);

	if (finalIdeas.length !== ideas.length) {
		console.warn(
			`Filtered ${ideas.length - finalIdeas.length} ideas. ` +
			`${finalIdeas.length} ideas will be processed.`
		);
	}

	return finalIdeas;
}

function withinSentenceLimit(text: string, limit: number): boolean {
	const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
	return sentences.length <= limit;
}
