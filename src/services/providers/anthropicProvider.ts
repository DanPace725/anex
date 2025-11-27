import { Clipping, ExtractedIdea } from "../../types/entities";
import { buildOpenAIExtractionMessages, parseIdeasFromModelText } from "./openaiPrompt";
import { ExtractionContext, LLMProvider } from "./provider";

interface AnthropicContentBlock {
	text?: string;
}

interface AnthropicResponse {
	content?: AnthropicContentBlock[];
}

export class AnthropicProvider implements LLMProvider {
	id = "anthropic";

	constructor(
		private apiKey: string,
		private model: string
	) {}

	async extractIdeas(clipping: Clipping, context: ExtractionContext): Promise<ExtractedIdea[]> {
		if (!this.apiKey) {
			throw new Error("Anthropic API key is missing. Add it in settings.");
		}

		const messages = buildOpenAIExtractionMessages(clipping, context);
		const response = await this.callMessages(messages);
		const content = this.getContent(response);
		return parseIdeasFromModelText(content);
	}

	private async callMessages(messages: ReturnType<typeof buildOpenAIExtractionMessages>) {
		const res = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: 2048,
				temperature: 0.2,
				system: messages.system,
				messages: [
					{
						role: "user",
						content: messages.user,
					},
				],
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Anthropic API error (${res.status}): ${text}`);
		}

		return (await res.json()) as AnthropicResponse;
	}

	private getContent(response: AnthropicResponse): string {
		const block = response.content?.[0];
		const text = block?.text;
		if (!text) {
			throw new Error("Anthropic response contained no content.");
		}
		return text;
	}
}
