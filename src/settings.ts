export type ProcessedMarkerStrategy = "frontmatter";

export type ProviderType = "openai" | "anthropic" | "google" | "mock";

export interface AnexSettings {
	clippingFolder: string;
	outputFolder: string;
	processedFlagField: string;
	processedMarkerStrategy: ProcessedMarkerStrategy;
	maxIdeas: number;
	minIdeas: number;
	allowOverwrite: boolean;
	autoWatchClippings: boolean;
	provider: ProviderType;
	openAIApiKey: string;
	openAIModel: string;
	anthropicApiKey: string;
	anthropicModel: string;
	googleApiKey: string;
	googleModel: string;
}

export const DEFAULT_SETTINGS: AnexSettings = {
	clippingFolder: "Clippings",
	outputFolder: "AtomicNotes",
	processedFlagField: "atomicNotesProcessed",
	processedMarkerStrategy: "frontmatter",
	maxIdeas: 6,
	minIdeas: 3,
	allowOverwrite: false,
	autoWatchClippings: true,
	provider: "openai",
	openAIApiKey: "",
	openAIModel: "gpt-4o-mini",
	anthropicApiKey: "",
	anthropicModel: "claude-3-5-sonnet-20240620",
	googleApiKey: "",
	googleModel: "gemini-1.5-flash",
};
