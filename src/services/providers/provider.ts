import { Clipping, ExtractedIdea } from "../../types/entities";

export interface ExtractionContext {
	minIdeas: number;
	maxIdeas: number;
}

export interface LLMProvider {
	id: string;
	extractIdeas(clipping: Clipping, context: ExtractionContext): Promise<ExtractedIdea[]>;
}
