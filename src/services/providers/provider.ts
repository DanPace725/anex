import { Clipping, ExtractedIdea } from "../../types/entities";

export interface ExtractionContext {
	minIdeas: number;
	maxIdeas: number;
	targetIdeas: number;
	customPrompt?: string;
}

export interface LLMProvider {
	id: string;
	extractIdeas(clipping: Clipping, context: ExtractionContext): Promise<ExtractedIdea[]>;
}
