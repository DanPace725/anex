import { Clipping, ExtractedIdea } from "../../types/entities";
import { ExtractionContext } from "./provider";

export interface OpenAIExtractionMessages {
	system: string;
	user: string;
}

export function buildOpenAIExtractionMessages(
	clipping: Clipping,
	context: ExtractionContext
): OpenAIExtractionMessages {
	const customPrompt = context.customPrompt?.trim();

	const system = [
		"You extract concise atomic ideas from clippings.",
		"Return only JSON; no prose or Markdown.",
		"Each idea is 1-2 sentences and has a short label (<= 6 words).",
		`Return between ${context.minIdeas} and ${context.maxIdeas} ideas.`,
		"Fields: label (string), idea (string), tags (optional string array).",
		"Never invent content; stay faithful to the clipping.",
		customPrompt ? `Custom instructions: ${customPrompt}` : undefined,
	].filter((line): line is string => Boolean(line)).join(" ");

	const user = [
		"Extract distinct atomic ideas from this clipping and return a JSON array.",
		"Example shape:",
		`[{"label":"Idea","idea":"One or two sentences.","tags":["topic"]}]`,
		"Clipping:",
		'"""',
		clipping.text,
		'"""',
	].join("\n");

	return { system, user };
}

export function parseIdeasFromModelText(content: string): ExtractedIdea[] {
	const json = extractJsonArray(content);
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch (error) {
		throw new Error(`Failed to parse JSON from model response: ${error}`);
	}

	if (!Array.isArray(parsed)) {
		throw new Error("Model response is not a JSON array.");
	}

	return parsed.map((item, index) => {
		if (typeof item !== "object" || item === null) {
			throw new Error(`Idea at index ${index} is not an object.`);
		}

		const label = String((item as any).label ?? "").trim();
		const idea = String((item as any).idea ?? "").trim();
		const tagsRaw = (item as any).tags;
		const tags = Array.isArray(tagsRaw)
			? tagsRaw.map((t) => String(t).trim()).filter(Boolean)
			: [];

		if (!label || !idea) {
			throw new Error(`Idea at index ${index} is missing label or idea.`);
		}

		return { label, idea, tags };
	});
}

function extractJsonArray(content: string): string {
	const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fenced && fenced[1]) {
		const trimmed = fenced[1].trim();
		if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
			return trimmed;
		}
	}

	const start = content.indexOf("[");
	const end = content.lastIndexOf("]");
	if (start !== -1 && end !== -1 && end > start) {
		return content.slice(start, end + 1);
	}

	throw new Error("Unable to locate JSON array in model response.");
}
