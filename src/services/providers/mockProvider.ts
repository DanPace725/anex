import { Clipping, ExtractedIdea } from "../../types/entities";
import { ExtractionContext, LLMProvider } from "./provider";

export class MockProvider implements LLMProvider {
	id = "mock";

	async extractIdeas(clipping: Clipping, context: ExtractionContext): Promise<ExtractedIdea[]> {
		const ideaCount = Math.min(Math.max(context.minIdeas, 1), context.maxIdeas);
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
