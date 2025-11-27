import { AnexSettings } from "../settings";
import { Clipping, ExtractedIdea } from "../types/entities";
import { validateIdeas } from "../utils/validation";
import { LLMProvider } from "./providers/provider";

export class IdeaExtractor {
	constructor(
		private provider: LLMProvider,
		private settings: AnexSettings
	) {}

	async extractIdeas(clipping: Clipping): Promise<ExtractedIdea[]> {
		const rawIdeas = await this.provider.extractIdeas(clipping, {
			minIdeas: this.settings.minIdeas,
			maxIdeas: this.settings.maxIdeas,
		});

		return validateIdeas(rawIdeas, {
			minIdeas: this.settings.minIdeas,
			maxIdeas: this.settings.maxIdeas,
			maxSentencesPerIdea: 2,
		});
	}
}
