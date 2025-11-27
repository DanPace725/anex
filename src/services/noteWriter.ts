import { normalizePath, Plugin, TFile } from "obsidian";
import { AtomicNote } from "../types/entities";

export class AtomicNoteWriter {
	constructor(private plugin: Plugin) {}

	async writeNotes(
		notes: AtomicNote[],
		folderPath: string,
		allowOverwrite: boolean,
		filenameFor: (note: AtomicNote) => string
	): Promise<string[]> {
		const targetFolder = normalizePath(folderPath);
		await this.ensureFolder(targetFolder);

		const writtenPaths: string[] = [];

		for (const note of notes) {
			const filename = filenameFor(note);
			const fullPath = `${targetFolder}/${filename}`;
			const existing = this.plugin.app.vault.getAbstractFileByPath(fullPath);

			if (existing instanceof TFile && !allowOverwrite) {
				throw new Error(`Atomic note "${filename}" already exists. Enable "Allow overwrite" in settings to replace it, or rename the file.`);
			}

			const content = this.renderNote(note);
			if (existing instanceof TFile && allowOverwrite) {
				await this.plugin.app.vault.modify(existing, content);
			} else {
				await this.plugin.app.vault.create(fullPath, content);
			}
			writtenPaths.push(fullPath);
		}

		return writtenPaths;
	}

	private async ensureFolder(folderPath: string): Promise<void> {
		const { vault } = this.plugin.app;
		const normalized = normalizePath(folderPath);
		const exists = await vault.adapter.exists(normalized);
		if (!exists) {
			await vault.createFolder(normalized);
		}
	}

	private renderNote(note: AtomicNote): string {
		const lines = [
			"---",
			`title: ${note.title}`,
			`sourceClippingId: ${note.sourceClippingId}`,
			`created: ${new Date(note.timestamp).toISOString()}`,
		];

		if (note.tags.length) {
			const tags = note.tags.map((tag) => `"${tag}"`).join(", ");
			lines.push(`tags: [${tags}]`);
		}

		lines.push("---", "", note.body);

		// Add source link
		const sourceFilename = this.getFilenameFromPath(note.sourceClippingId);
		lines.push("", `**Source:** [[${sourceFilename}]]`);

		return lines.join("\n");
	}

	private getFilenameFromPath(path: string): string {
		// Extract filename from path, removing extension if it's .md
		const parts = path.split("/");
		const filename = parts[parts.length - 1];
		return filename.replace(/\.md$/, "");
	}
}
