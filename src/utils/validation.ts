import { ExtractedIdea } from "../types/entities";

export interface IdeaValidationOptions {
	minIdeas: number;
	maxIdeas: number;
	maxSentencesPerIdea?: number;
	convertSpacesToHyphens?: boolean;
}

export function validateIdeas(
	ideas: ExtractedIdea[],
	options: IdeaValidationOptions
): ExtractedIdea[] {
	const convertSpaces = options.convertSpacesToHyphens ?? true;

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
			tags: idea.tags
				?.map((tag) => sanitizeTag(tag, convertSpaces))
				.filter(Boolean) ?? [],
		}));

	// Next, remove near-duplicate ideas that repeat the same core concept
	const dedupedIdeas = dedupeIdeas(validIdeas);

	// Check if we have enough valid ideas
	if (dedupedIdeas.length < options.minIdeas) {
		throw new Error(
			`Only ${dedupedIdeas.length} valid ideas found, but minimum required is ${options.minIdeas}. ` +
			`Some ideas were filtered out due to validation or deduplication.`
		);
	}

	// If we have too many, truncate to the maximum
	const finalIdeas = dedupedIdeas.slice(0, options.maxIdeas);

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

function normalizeIdeaText(text: string): string {
	return text
		.toLowerCase()
		.replace(/[\u2018\u2019]/g, "'")
		.replace(/[\u201C\u201D]/g, '"')
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function dedupeIdeas(ideas: ExtractedIdea[]): ExtractedIdea[] {
	const result: ExtractedIdea[] = [];
	const seen: string[] = [];

	for (const idea of ideas) {
		const normalized = normalizeIdeaText(idea.idea);
		if (!normalized) continue;

		let isDuplicate = false;
		for (let i = 0; i < seen.length; i++) {
			const existing = seen[i];
			if (existing === normalized) {
				isDuplicate = true;
				break;
			}

			// If one idea's normalized text is almost contained in another, treat as duplicate
			if (
				existing.length > 40 &&
				normalized.length > 40 &&
				(existing.includes(normalized) || normalized.includes(existing))
			) {
				isDuplicate = true;
				break;
			}
		}

		if (!isDuplicate) {
			seen.push(normalized);
			result.push(idea);
		} else {
			console.warn(`Filtering out near-duplicate idea: "${idea.label}"`);
		}
	}

	return result;
}

function sanitizeTag(tag: string, convertSpaces: boolean): string {
	const spaceNormalized = convertSpaces ? tag.replace(/\s+/g, "-") : tag;
	const stripped = spaceNormalized
		.replace(/[\\/\\.]/g, "-")
		.replace(/[^A-Za-z0-9_-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");

	return stripped.trim();
}
