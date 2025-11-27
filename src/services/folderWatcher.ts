import { Plugin, TFile, TFolder } from "obsidian";
import { Notice } from "obsidian";
import { AnexSettings } from "../settings";
import { ClippingService } from "./clippingService";
import { ExtractionWorkflow } from "../workflows/extractionWorkflow";
import { StatusIndicatorService } from "./statusIndicator";

function normalizeFolder(folder: string): string {
	return folder.replace(/^[\\/]+/, "").replace(/[\\/]+$/, "");
}

export class FolderWatcherService {
	private processingFiles = new Set<string>();

	constructor(
		private plugin: Plugin,
		private settings: AnexSettings,
		private clippingService: ClippingService,
		private workflow: ExtractionWorkflow,
		private statusIndicator?: StatusIndicatorService
	) {}

	startWatching(): void {
		if (!this.settings.autoWatchClippings) {
			return;
		}

		// Watch for file creation in the clippings folder
		this.plugin.registerEvent(
			this.plugin.app.vault.on("create", (file) => {
				if (file instanceof TFile) {
					this.handleFileCreated(file);
				}
			})
		);

		// Watch for file modifications (in case files are moved into the folder)
		this.plugin.registerEvent(
			this.plugin.app.vault.on("modify", (file) => {
				if (file instanceof TFile) {
					this.handleFileModified(file);
				}
			})
		);

		// Watch for file renames (when files are moved into the folder)
		this.plugin.registerEvent(
			this.plugin.app.vault.on("rename", (file, oldPath) => {
				if (file instanceof TFile) {
					this.handleFileRenamed(file, oldPath);
				}
			})
		);
	}

	private async handleFileCreated(file: TFile): Promise<void> {
		if (!this.isInClippingsFolder(file)) return;
		if (!this.shouldProcessFile(file)) return;
		if (this.processingFiles.has(file.path)) return;

		this.processingFiles.add(file.path);

		// Small delay to ensure file is fully written
		setTimeout(async () => {
			try {
				await this.workflow.runOnFile(file);
			} catch (error) {
				console.error(`Failed to auto-process clipping: ${file.path}`, error);
				// Don't show notice for auto-processing failures to avoid spam
			} finally {
				this.processingFiles.delete(file.path);
			}
		}, 100);
	}

	private async handleFileModified(file: TFile): Promise<void> {
		// Only process if moved into clippings folder and not already processed
		if (!this.isInClippingsFolder(file)) return;
		if (!this.shouldProcessFile(file)) return;
		if (this.processingFiles.has(file.path)) return;

		// Check if this was recently processed to avoid double-processing
		const clipping = await this.clippingService.readClipping(file);
		if (!clipping.processed) {
			this.processingFiles.add(file.path);
			try {
				await this.workflow.runOnFile(file);
			} catch (error) {
				console.error(`Failed to auto-process clipping: ${file.path}`, error);
			} finally {
				this.processingFiles.delete(file.path);
			}
		}
	}

	private async handleFileRenamed(file: TFile, oldPath: string): Promise<void> {
		// Only process if the file was moved into the clippings folder
		if (!this.isInClippingsFolder(file)) return;
		if (!this.shouldProcessFile(file)) return;
		if (this.processingFiles.has(file.path)) return;

		// If the file was moved from outside the clippings folder into it, process it
		const wasInClippingsFolder = this.wasInClippingsFolder(oldPath);
		if (!wasInClippingsFolder) {
			// Check if already processed to avoid double-processing
			const clipping = await this.clippingService.readClipping(file);
			if (!clipping.processed) {
				this.processingFiles.add(file.path);
				// Small delay to ensure file is fully written after move
				setTimeout(async () => {
					try {
						await this.workflow.runOnFile(file);
					} catch (error) {
						console.error(`Failed to auto-process moved clipping: ${file.path}`, error);
					} finally {
						this.processingFiles.delete(file.path);
					}
				}, 200);
			}
		}
	}

	private wasInClippingsFolder(oldPath: string): boolean {
		const normalized = normalizeFolder(this.settings.clippingFolder);
		return oldPath.startsWith(`${normalized}/`) || oldPath === normalized;
	}

	private isInClippingsFolder(file: TFile): boolean {
		return this.clippingService.isInClippingFolder(file, this.settings.clippingFolder);
	}

	private shouldProcessFile(file: TFile): boolean {
		// Only process markdown files
		return file.extension === "md";
	}

	async processAllUnprocessedFiles(): Promise<void> {
		const folder = this.plugin.app.vault.getAbstractFileByPath(this.settings.clippingFolder);
		if (!(folder instanceof TFolder)) {
			new Notice(`Clippings folder "${this.settings.clippingFolder}" not found. Please create this folder or update the path in settings.`);
			return;
		}

		const unprocessedFiles: TFile[] = [];
		this.collectUnprocessedFiles(folder, unprocessedFiles);

		if (unprocessedFiles.length === 0) {
			new Notice("No unprocessed clippings found.");
			return;
		}

		new Notice(`Processing ${unprocessedFiles.length} unprocessed clippings...`);

		let processedCount = 0;
		let errorCount = 0;

		for (const file of unprocessedFiles) {
			try {
				await this.workflow.runOnFile(file);
				processedCount++;
			} catch (error) {
				console.error(`Failed to process ${file.path}:`, error);
				errorCount++;
				// For batch processing, we'll continue with other files
				// Individual errors are already shown by the workflow
			}
		}

		const message = `Processed ${processedCount} clippings${errorCount > 0 ? ` (${errorCount} failed)` : ""}.`;
		new Notice(message);
	}

	private collectUnprocessedFiles(folder: TFolder, result: TFile[]): void {
		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === "md") {
				// Check if already processed
				const cache = this.plugin.app.metadataCache.getFileCache(child);
				const frontmatter = cache?.frontmatter;
				const isProcessed = frontmatter?.[this.settings.processedFlagField] === true;

				if (!isProcessed) {
					result.push(child);
				}
			} else if (child instanceof TFolder) {
				// Recursively check subfolders
				this.collectUnprocessedFiles(child, result);
			}
		}
	}
}
