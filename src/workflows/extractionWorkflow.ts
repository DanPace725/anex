import { Notice, TFile, Plugin } from "obsidian";
import { AnexSettings } from "../settings";
import { ClippingService } from "../services/clippingService";
import { IdeaExtractor } from "../services/ideaExtractor";
import { AtomicNoteBuilder } from "../services/noteBuilder";
import { AtomicNoteWriter } from "../services/noteWriter";
import { ProcessedMarkerService } from "../services/processedMarker";
import { StatusIndicatorService } from "../services/statusIndicator";
import { formatWikiLink } from "../utils/links";

export class ExtractionWorkflow {
	constructor(
		private plugin: Plugin,
		private settings: AnexSettings,
		private clippings: ClippingService,
		private ideas: IdeaExtractor,
		private noteBuilder: AtomicNoteBuilder,
		private noteWriter: AtomicNoteWriter,
		private processedMarker: ProcessedMarkerService,
		private statusIndicator?: StatusIndicatorService
	) {}

	async runOnFile(file: TFile): Promise<void> {
		try {
			// Validate settings before processing
			this.validateSettings();

			const clipping = await this.clippings.readClipping(file);
			if (clipping.processed) {
				new Notice(`"${file.name}" is already processed.`);
				return;
			}

			if (!clipping.text.trim()) {
				throw new Error(`File "${file.name}" appears to be empty.`);
			}

			// Indicate processing has started
			this.statusIndicator?.startProcessing(file);

			const extractedIdeas = await this.ideas.extractIdeas(clipping);
			const notes = this.noteBuilder.build(clipping, extractedIdeas);

			const notePaths = await this.noteWriter.writeNotes(
				notes,
				this.settings.outputFolder,
				this.settings.allowOverwrite,
				(note) => this.noteBuilder.filenameFor(note),
				{
					sourcePropertyName: this.settings.sourceClippingPropertyName,
					sourceLinkFormat: this.settings.sourceLinkFormat,
				}
			);

			const noteLinks = this.buildNoteLinks(notePaths, notes);

			await this.processedMarker.markProcessed(file, {
				noteLinks: this.settings.storeNoteLinksInFrontmatter ? noteLinks : undefined,
			});

			if (this.settings.writeNoteLinksToFooter) {
				await this.addAtomicNotesLinksToClipping(file, noteLinks);
			}

			// Indicate processing completed successfully
			this.statusIndicator?.finishProcessing(file, true, notes.length);

		} catch (error) {
			console.error(`Extraction failed for ${file.name}:`, error);

			// Indicate processing failed
			this.statusIndicator?.finishProcessing(file, false);

			const errorMessage = this.formatErrorMessage(error);
			new Notice(`❌ Extraction failed: ${errorMessage}`);
		}
	}

	private validateSettings(): void {
		if (!this.settings.outputFolder.trim()) {
			throw new Error("Output folder is not configured. Please set it in settings.");
		}

		if (this.settings.minIdeas < 1 || this.settings.maxIdeas < this.settings.minIdeas) {
			throw new Error("Invalid idea limits. Min ideas must be ≥ 1 and max ideas must be ≥ min ideas.");
		}

		const propertyNamePattern = /^[A-Za-z0-9_-]+$/;
		if (!propertyNamePattern.test(this.settings.sourceClippingPropertyName)) {
			throw new Error("Invalid source clipping property name. Use letters, numbers, hyphens, or underscores.");
		}

		if (!propertyNamePattern.test(this.settings.noteLinksProperty)) {
			throw new Error("Invalid clipping note links property name. Use letters, numbers, hyphens, or underscores.");
		}

		if (!propertyNamePattern.test(this.settings.processedFlagField)) {
			throw new Error("Invalid processed flag property name. Use letters, numbers, hyphens, or underscores.");
		}

		if (!propertyNamePattern.test(this.settings.processedAtField)) {
			throw new Error("Invalid processed timestamp property name. Use letters, numbers, hyphens, or underscores.");
		}

		if (this.settings.provider !== "mock" && !this.hasApiKey()) {
			throw new Error(`API key is required for ${this.settings.provider} provider. Please configure it in settings.`);
		}
	}

	private hasApiKey(): boolean {
		switch (this.settings.provider) {
			case "openai":
				return !!this.settings.openAIApiKey.trim();
			case "anthropic":
				return !!this.settings.anthropicApiKey.trim();
			case "google":
				return !!this.settings.googleApiKey.trim();
			default:
				return true; // mock provider doesn't need API key
		}
	}

	private async addAtomicNotesLinksToClipping(clippingFile: TFile, atomicNoteLinks: string[]): Promise<void> {
		try {
			const content = await this.plugin.app.vault.read(clippingFile);
			const updatedContent = this.updateClippingWithAtomicNoteLinks(content, atomicNoteLinks);
			await this.plugin.app.vault.modify(clippingFile, updatedContent);
		} catch (error) {
			console.warn(`Failed to add atomic note links to clipping ${clippingFile.path}:`, error);
			// Don't fail the entire process if this optional step fails
		}
	}

	private updateClippingWithAtomicNoteLinks(content: string, atomicNoteLinks: string[]): string {
		const lines = content.split("\n");

		// Remove any existing Atomic Notes section
		const atomicNotesSectionStart = lines.findIndex(line =>
			line.trim() === "## Atomic Notes" || line.trim() === "## Atomic notes" || line.trim() === "## atomic notes"
		);

		if (atomicNotesSectionStart !== -1) {
			// Find the end of the section (next heading or end of file)
			let sectionEnd = lines.length;
			for (let i = atomicNotesSectionStart + 1; i < lines.length; i++) {
				if (lines[i].startsWith("#")) {
					sectionEnd = i;
					break;
				}
			}
			// Remove the existing section
			lines.splice(atomicNotesSectionStart, sectionEnd - atomicNotesSectionStart);
		}

		// Add the new Atomic Notes section at the end
		if (atomicNoteLinks.length > 0) {
			const listContent = atomicNoteLinks.map((link) => `- ${link}`).join("\n");
			lines.push("", "## Atomic Notes", "", listContent);
		}

		return lines.join("\n");
	}

	private buildNoteLinks(notePaths: string[], notes: ReturnType<AtomicNoteBuilder["build"]>): string[] {
		return notePaths.map((path, index) => {
			const note = notes[index];
			return formatWikiLink(path, note.title, this.settings.sourceLinkFormat);
		});
	}

	private formatErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			// Truncate very long error messages
			const message = error.message;
			if (message.length > 100) {
				return message.substring(0, 100) + "...";
			}
			return message;
		}
		return String(error);
	}
}
