import { Plugin, TFile } from "obsidian";
import { Notice } from "obsidian";

export class StatusIndicatorService {
	private statusBarItem?: HTMLElement;
	private processingFiles = new Set<string>();
	private isProcessing = false;

	constructor(private plugin: Plugin) {
		this.addStatusBarItem();
	}

	private addStatusBarItem(): void {
		this.statusBarItem = this.plugin.addStatusBarItem();
		this.statusBarItem.setText("ANEX: Idle");
		this.statusBarItem.addClass("anex-status-bar");
		this.updateStatusDisplay();
	}

	startProcessing(file: TFile): void {
		this.processingFiles.add(file.path);
		this.isProcessing = true;
		this.updateStatusDisplay();

		// Show immediate feedback
		new Notice(`🔄 Processing "${file.basename}"...`, 2000);
	}

	finishProcessing(file: TFile, success: boolean, noteCount?: number): void {
		this.processingFiles.delete(file.path);

		if (this.processingFiles.size === 0) {
			this.isProcessing = false;
		}

		this.updateStatusDisplay();

		// Show completion feedback
		if (success && noteCount !== undefined) {
			new Notice(`✅ "${file.basename}": ${noteCount} atomic notes created`, 3000);
		} else if (!success) {
			new Notice(`❌ "${file.basename}": Processing failed`, 5000);
		}
	}

	private updateStatusDisplay(): void {
		if (!this.statusBarItem) return;

		if (this.processingFiles.size === 0) {
			this.statusBarItem.setText("ANEX: Idle");
			this.statusBarItem.removeClass("processing");
		} else if (this.processingFiles.size === 1) {
			const filePath = Array.from(this.processingFiles)[0];
			const fileName = filePath.split('/').pop() || filePath;
			this.statusBarItem.setText(`ANEX: Processing "${fileName}"`);
			this.statusBarItem.addClass("processing");
		} else {
			this.statusBarItem.setText(`ANEX: Processing ${this.processingFiles.size} files`);
			this.statusBarItem.addClass("processing");
		}
	}

	getProcessingFiles(): string[] {
		return Array.from(this.processingFiles);
	}

	isFileBeingProcessed(filePath: string): boolean {
		return this.processingFiles.has(filePath);
	}
}
