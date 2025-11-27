import { Clipping, ExtractedIdea } from "../../types/entities";
import { buildOpenAIExtractionMessages, parseIdeasFromModelText } from "./openaiPrompt";
import { ExtractionContext, LLMProvider } from "./provider";

interface GoogleCandidateContentPart {
	text?: string;
}

interface GoogleCandidate {
	content?: {
		parts?: GoogleCandidateContentPart[];
	};
}

interface GoogleResponse {
	candidates?: GoogleCandidate[];
}

export class GoogleProvider implements LLMProvider {
	id = "google";

	constructor(
		private apiKey: string,
		private model: string
	) {}

	async extractIdeas(clipping: Clipping, context: ExtractionContext): Promise<ExtractedIdea[]> {
		if (!this.apiKey) {
			throw new Error("Google API key is missing. Add it in settings.");
		}

		const messages = buildOpenAIExtractionMessages(clipping, context);
		const response = await this.callGenerateContent(messages);
		const content = this.getContent(response);
		return parseIdeasFromModelText(content);
	}

	private async callGenerateContent(messages: ReturnType<typeof buildOpenAIExtractionMessages>) {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						role: "user",
						parts: [{ text: `${messages.system}\n\n${messages.user}` }],
					},
				],
				safetySettings: [],
				temperature: 0.2,
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Google API error (${res.status}): ${text}`);
		}

		return (await res.json()) as GoogleResponse;
	}

	private getContent(response: GoogleResponse): string {
		const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) {
			throw new Error("Google response contained no content.");
		}
		return text;
	}
}
