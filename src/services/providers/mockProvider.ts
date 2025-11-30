import { Clipping, ExtractedIdea } from "../../types/entities";
import { ExtractionContext, LLMProvider } from "./provider";

export class MockProvider implements LLMProvider {
	id = "mock";

	async extractIdeas(clipping: Clipping, context: ExtractionContext): Promise<ExtractedIdea[]> {
		const clampedMin = Math.max(context.minIdeas, 1);
		const clampedMax = Math.max(clampedMin, context.maxIdeas);
		const preferred = Math.max(clampedMin, Math.min(context.targetIdeas, clampedMax));
		const ideaCount = preferred;
		const ideas: ExtractedIdea[] = [];

		for (let i = 0; i < ideaCount; i++) {
			ideas.push({
				label: `Idea ${i + 1}`,
				idea: `Atomic idea ${i + 1} derived from ${clipping.path}.`,
				tags: ["mock"],
			});
		}

		return ideas;
	}
}
