import { AnexSettings } from "../../settings";
import { LLMProvider } from "./provider";
import { MockProvider } from "./mockProvider";
import { OpenAIProvider } from "./openaiProvider";
import { AnthropicProvider } from "./anthropicProvider";
import { GoogleProvider } from "./googleProvider";

export function createProvider(settings: AnexSettings): LLMProvider {
	switch (settings.provider) {
	case "openai":
		return new OpenAIProvider(settings.openAIApiKey, settings.openAIModel);
	case "anthropic":
		return new AnthropicProvider(settings.anthropicApiKey, settings.anthropicModel);
	case "google":
		return new GoogleProvider(settings.googleApiKey, settings.googleModel);
	case "mock":
	default:
		return new MockProvider();
	}
}
