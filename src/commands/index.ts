import { Plugin } from "obsidian";
import { ExtractionWorkflow } from "../workflows/extractionWorkflow";
import { FolderWatcherService } from "../services/folderWatcher";
import { AnexSettings } from "../settings";

interface CommandServices {
	workflow: ExtractionWorkflow;
	folderWatcher: FolderWatcherService;
	settings: AnexSettings;
}

export function registerCommands(plugin: Plugin, services: CommandServices) {
	const { workflow, folderWatcher } = services;

	plugin.addCommand({
		id: "anex-extract-active-file",
		name: "Extract Active File",
		checkCallback: (checking: boolean) => {
			const file = plugin.app.workspace.getActiveFile();
			if (!file) return false;
			if (!checking) {
				void workflow.runOnFile(file);
			}
			return true;
		},
	});

	plugin.addCommand({
		id: "anex-process-all-clippings",
		name: "Extract from Clippings Folder",
		callback: () => {
			void folderWatcher.processAllUnprocessedFiles();
		},
	});
}
