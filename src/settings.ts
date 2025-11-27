export type ProcessedMarkerStrategy = "frontmatter";

export type ProviderType = "openai" | "anthropic" | "google" | "mock";
export type SourceLinkFormat = "filename" | "pathWithTitle";

export interface AnexSettings {
	clippingFolder: string;
	outputFolder: string;
	processedFlagField: string;
	processedAtField: string;
	processedMarkerStrategy: ProcessedMarkerStrategy;
	maxIdeas: number;
	minIdeas: number;
	allowOverwrite: boolean;
	autoWatchClippings: boolean;
	storeNoteLinksInFrontmatter: boolean;
	noteLinksProperty: string;
	writeNoteLinksToFooter: boolean;
	sourceClippingPropertyName: string;
	sourceLinkFormat: SourceLinkFormat;
	convertTagSpacesToHyphens: boolean;
	customExtractionPrompt: string;
	provider: ProviderType;
	openAIApiKey: string;
	openAIModel: string;
	anthropicApiKey: string;
	anthropicModel: string;
	googleApiKey: string;
	googleModel: string;
}

export const DEFAULT_SETTINGS: AnexSettings = {
	clippingFolder: "ingest/clippings",
	outputFolder: "ingest/anex",
	processedFlagField: "Processed",
	processedAtField: "ProcessedAt",
	processedMarkerStrategy: "frontmatter",
	maxIdeas: 6,
	minIdeas: 3,
	allowOverwrite: false,
	autoWatchClippings: false,
	storeNoteLinksInFrontmatter: true,
	noteLinksProperty: "anex_notes",
	writeNoteLinksToFooter: false,
	sourceClippingPropertyName: "source_clipping",
	sourceLinkFormat: "filename",
	convertTagSpacesToHyphens: true,
	customExtractionPrompt: "",
	provider: "openai",
	openAIApiKey: "",
	openAIModel: "gpt-4o-mini",
	anthropicApiKey: "",
	anthropicModel: "claude-3-5-sonnet-20240620",
	googleApiKey: "",
	googleModel: "gemini-1.5-flash",
};
