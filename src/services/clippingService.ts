import { Plugin, TFile } from "obsidian";
import { Clipping } from "../types/entities";
import { ProcessedMarkerService } from "./processedMarker";

export class ClippingService {
	constructor(
		private plugin: Plugin,
		private processedMarker: ProcessedMarkerService
	) {}

	async readClipping(file: TFile): Promise<Clipping> {
		const text = await this.plugin.app.vault.read(file);
		return {
			id: file.path,
			path: file.path,
			text,
			processed: this.processedMarker.isProcessed(file),
		};
	}

	isInClippingFolder(file: TFile, clippingFolder: string): boolean {
		const normalized = normalizeFolder(clippingFolder);
		return file.path.startsWith(`${normalized}/`) || file.path === normalized;
	}
}

function normalizeFolder(folder: string): string {
	return folder.replace(/^[\\/]+/, "").replace(/[\\/]+$/, "");
}
