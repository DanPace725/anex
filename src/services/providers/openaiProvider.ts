import { Clipping, ExtractedIdea } from "../../types/entities";
import { buildOpenAIExtractionMessages, parseIdeasFromModelText } from "./openaiPrompt";
import { ExtractionContext, LLMProvider } from "./provider";

interface OpenAIChatResponse {
	choices: { message?: { content?: string } }[];
}

export class OpenAIProvider implements LLMProvider {
	id = "openai";

	constructor(
		private apiKey: string,
		private model: string
	) {}

	async extractIdeas(clipping: Clipping, context: ExtractionContext): Promise<ExtractedIdea[]> {
		if (!this.apiKey) {
			throw new Error("OpenAI API key is missing. Add it in settings.");
		}

		const messages = buildOpenAIExtractionMessages(clipping, context);
		const response = await this.callChatCompletions(messages);
		const content = this.getContent(response);
		return parseIdeasFromModelText(content);
	}

	private async callChatCompletions(messages: ReturnType<typeof buildOpenAIExtractionMessages>) {
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: this.model,
				temperature: 0.2,
				messages: [
					{ role: "system", content: messages.system },
					{ role: "user", content: messages.user },
				],
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`OpenAI API error (${res.status}): ${text}`);
		}

		return (await res.json()) as OpenAIChatResponse;
	}

	private getContent(response: OpenAIChatResponse): string {
		const content = response.choices?.[0]?.message?.content;
		if (!content) {
			throw new Error("OpenAI response contained no content.");
		}
		return content;
	}
}
