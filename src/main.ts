import { Plugin } from "obsidian";
import { registerCommands } from "./commands";
import { AnexSettings, DEFAULT_SETTINGS } from "./settings";
import { ClippingService } from "./services/clippingService";
import { IdeaExtractor } from "./services/ideaExtractor";
import { ProcessedMarkerService } from "./services/processedMarker";
import { AtomicNoteBuilder } from "./services/noteBuilder";
import { AtomicNoteWriter } from "./services/noteWriter";
import { createProvider } from "./services/providers/factory";
import { AnexSettingTab } from "./ui/settingsTab";
import { AtomicNotesSidebar, SIDEBAR_VIEW_TYPE } from "./ui/sidebarView";
import { ExtractionWorkflow } from "./workflows/extractionWorkflow";
import { FolderWatcherService } from "./services/folderWatcher";
import { StatusIndicatorService } from "./services/statusIndicator";

export default class AtomicNotesPlugin extends Plugin {
	settings: AnexSettings;
	private folderWatcher?: FolderWatcherService;
	private statusIndicator?: StatusIndicatorService;

	async onload() {
		await this.loadSettings();

		// Initialize status indicator
		this.statusIndicator = new StatusIndicatorService(this);

		const workflow = this.buildWorkflow();
		const services = {
			workflow,
			folderWatcher: this.folderWatcher!,
			settings: this.settings,
		};
		registerCommands(this, services);
		this.addSettingTab(new AnexSettingTab(this.app, this));

		// Register sidebar view
		this.registerView(
			SIDEBAR_VIEW_TYPE,
			(leaf) => new AtomicNotesSidebar(leaf, this.settings, workflow, this.folderWatcher!)
		);

		// Add ribbon button to toggle sidebar
		this.addRibbonIcon("document", "Atomic Notes", () => {
			this.toggleSidebar();
		});

		// Add sidebar toggle command
		this.addCommand({
			id: "toggle-sidebar",
			name: "Toggle Atomic Notes Sidebar",
			callback: () => this.toggleSidebar(),
		});
	}

	onunload() {
		// Cleanup handled by register* helpers.
	}

	private buildWorkflow(): ExtractionWorkflow {
		const processedMarker = new ProcessedMarkerService(this, this.settings);
		const clippingService = new ClippingService(this, processedMarker);
		const provider = createProvider(this.settings);
		const ideaExtractor = new IdeaExtractor(provider, this.settings);
		const noteBuilder = new AtomicNoteBuilder();
		const noteWriter = new AtomicNoteWriter(this);

		const workflow = new ExtractionWorkflow(
			this,
			this.settings,
			clippingService,
			ideaExtractor,
			noteBuilder,
			noteWriter,
			processedMarker,
			this.statusIndicator!
		);

		// Start folder watching
		this.folderWatcher = new FolderWatcherService(
			this,
			this.settings,
			clippingService,
			workflow,
			this.statusIndicator
		);
		this.folderWatcher.startWatching();

		return workflow;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async toggleSidebar(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(SIDEBAR_VIEW_TYPE);
		if (existing.length > 0) {
			this.app.workspace.detachLeavesOfType(SIDEBAR_VIEW_TYPE);
		} else {
			const leaf = this.app.workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({
					type: SIDEBAR_VIEW_TYPE,
					active: true,
				});
			}
		}
	}
}
