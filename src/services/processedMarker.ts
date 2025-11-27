import { Plugin, TFile } from "obsidian";
import { AnexSettings } from "../settings";

export interface ProcessedMarkerPayload {
	noteLinks?: string[];
}

export class ProcessedMarkerService {
	constructor(
		private plugin: Plugin,
		private settings: AnexSettings
	) {}

	isProcessed(file: TFile): boolean {
		const cache = this.plugin.app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter;
		return frontmatter?.[this.settings.processedFlagField] === true;
	}

	async markProcessed(file: TFile, payload: ProcessedMarkerPayload = {}): Promise<void> {
		if (this.settings.processedMarkerStrategy !== "frontmatter") {
			return;
		}

		await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter[this.settings.processedFlagField] = true;
			frontmatter[this.settings.processedAtField] = new Date().toISOString();
			if (this.settings.storeNoteLinksInFrontmatter && payload.noteLinks?.length) {
				frontmatter[this.settings.noteLinksProperty] = payload.noteLinks;
			}
		});
	}
}
