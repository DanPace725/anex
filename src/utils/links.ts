import { normalizePath } from "obsidian";
import { SourceLinkFormat } from "../settings";

export function formatWikiLink(path: string, title: string, format: SourceLinkFormat): string {
	const cleanedTitle = title.trim();
	const normalizedPath = normalizePath(path)
		.replace(/\.md$/i, "")
		.replace(/^[\\/]+/, "")
		.replace(/^['"]+|['"]+$/g, "");

	const safeAlias = cleanedTitle.replace(/["'`]+/g, "").trim();
	const filename = normalizedPath.split("/").pop() || normalizedPath;

	if (format === "pathWithTitle") {
		const alias = safeAlias || filename;
		return `[[${normalizedPath}|${alias}]]`;
	}

	return `[[${filename}]]`;
}
