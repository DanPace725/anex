import { ItemView, WorkspaceLeaf, TFile, TFolder, Notice } from "obsidian";
import { AnexSettings } from "../settings";
import { ExtractionWorkflow } from "../workflows/extractionWorkflow";
import { FolderWatcherService } from "../services/folderWatcher";

export const SIDEBAR_VIEW_TYPE = "atomic-notes-sidebar";

export class AtomicNotesSidebar extends ItemView {
	private settings: AnexSettings;
	private workflow: ExtractionWorkflow;
	private folderWatcher: FolderWatcherService;
	private refreshInterval?: NodeJS.Timeout;

	constructor(
		leaf: WorkspaceLeaf,
		settings: AnexSettings,
		workflow: ExtractionWorkflow,
		folderWatcher: FolderWatcherService
	) {
		super(leaf);
		this.settings = settings;
		this.workflow = workflow;
		this.folderWatcher = folderWatcher;
	}

	getViewType(): string {
		return SIDEBAR_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "ANEx";
	}

	getIcon(): string {
		return "notebook";
	}

	async onOpen(): Promise<void> {
		await this.refresh();
		const refresh = () => { void this.refresh(); };

		// Refresh every 5 seconds to show updated status
		this.refreshInterval = setInterval(refresh, 5000);

		this.registerEvent(this.app.metadataCache.on("changed", refresh));
		this.registerEvent(this.app.vault.on("create", refresh));
		this.registerEvent(this.app.vault.on("delete", refresh));
		this.registerEvent(this.app.vault.on("rename", refresh));
	}

	async onClose(): Promise<void> {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
		}
	}

	async refresh(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();

		container.addClass("atomic-notes-sidebar");

		// Header
		const header = container.createEl("div", { cls: "sidebar-header" });
		header.createEl("h3", { text: "ANEx — Atomic Notes Extractor" });

		// Status section
		const statusSection = container.createEl("div", { cls: "sidebar-section" });
		statusSection.createEl("h4", { text: "Clippings Status" });

		try {
			const status = await this.getClippingsStatus();
			this.renderStatus(statusSection, status);
		} catch (error) {
			statusSection.createEl("div", {
				text: "Error loading status",
				cls: "error-message"
			});
		}

		// Quick actions
		const actionsSection = container.createEl("div", { cls: "sidebar-section" });
		actionsSection.createEl("h4", { text: "Quick Actions" });
		this.renderQuickActions(actionsSection);
	}

	private async getClippingsStatus(): Promise<{
		total: number;
		processed: number;
		unprocessed: number;
		folderExists: boolean;
	}> {
		const folder = this.app.vault.getAbstractFileByPath(this.settings.clippingFolder);
		if (!(folder instanceof TFolder)) {
			return {
				total: 0,
				processed: 0,
				unprocessed: 0,
				folderExists: false
			};
		}

		let total = 0;
		let processed = 0;

		const collectFiles = (folder: TFolder) => {
			for (const child of folder.children) {
				if (child instanceof TFile && child.extension === "md") {
					total++;
					const cache = this.app.metadataCache.getFileCache(child);
					const frontmatter = cache?.frontmatter;
					const isProcessed = frontmatter?.[this.settings.processedFlagField] === true;
					if (isProcessed) {
						processed++;
					}
				} else if (child instanceof TFolder) {
					collectFiles(child);
				}
			}
		};

		collectFiles(folder);

		return {
			total,
			processed,
			unprocessed: total - processed,
			folderExists: true
		};
	}

	private renderStatus(container: Element, status: Awaited<ReturnType<typeof this.getClippingsStatus>>): void {
		if (!status.folderExists) {
			container.createEl("div", {
				text: `Clippings folder "${this.settings.clippingFolder}" not found`,
				cls: "error-message"
			});
			return;
		}

		const statusDiv = container.createEl("div", { cls: "status-grid" });

		// Total files
		const totalDiv = statusDiv.createEl("div", { cls: "status-item" });
		totalDiv.createEl("div", { text: status.total.toString(), cls: "status-number" });
		totalDiv.createEl("div", { text: "Total Clippings", cls: "status-label" });

		// Processed
		const processedDiv = statusDiv.createEl("div", { cls: "status-item" });
		processedDiv.createEl("div", { text: status.processed.toString(), cls: "status-number processed" });
		processedDiv.createEl("div", { text: "Processed", cls: "status-label" });

		// Unprocessed
		const unprocessedDiv = statusDiv.createEl("div", { cls: "status-item" });
		unprocessedDiv.createEl("div", { text: status.unprocessed.toString(), cls: "status-number unprocessed" });
		unprocessedDiv.createEl("div", { text: "Unprocessed", cls: "status-label" });

		// Progress bar
		if (status.total > 0) {
			const progressContainer = container.createEl("div", { cls: "progress-container" });
			const progressBar = progressContainer.createEl("div", { cls: "progress-bar" });
			const percentage = (status.processed / status.total) * 100;
			progressBar.style.width = `${percentage}%`;
			progressContainer.createEl("div", {
				text: `${percentage.toFixed(1)}% Complete`,
				cls: "progress-text"
			});
		}
	}

	private renderQuickActions(container: Element): void {
		// Process all unprocessed button
		const processAllBtn = container.createEl("button", {
			text: "Process All Unprocessed",
			cls: "sidebar-button primary"
		});
		processAllBtn.addEventListener("click", async () => {
			try {
				processAllBtn.disabled = true;
				processAllBtn.textContent = "Processing...";
				await this.folderWatcher.processAllUnprocessedFiles();
				await this.refresh(); // Refresh the view
			} catch (error) {
				new Notice(`Failed to process files: ${error}`);
			} finally {
				processAllBtn.disabled = false;
				processAllBtn.textContent = "Process All Unprocessed";
			}
		});

		// Refresh button
		const refreshBtn = container.createEl("button", {
			text: "Refresh Status",
			cls: "sidebar-button secondary"
		});
		refreshBtn.addEventListener("click", () => {
			void this.refresh();
		});
	}
}
