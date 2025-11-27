import { App, PluginSettingTab, Setting } from "obsidian";
import { AnexSettings } from "../settings";

const sanitizePropertyName = (value: string, fallback: string): string => {
	const trimmed = value.trim();
	return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : fallback;
};

const sanitizePathInput = (value: string, fallback: string): string => {
	return value.trim() || fallback;
};

interface SettingsHost {
	settings: AnexSettings;
	saveSettings: () => Promise<void>;
}

export class AnexSettingTab extends PluginSettingTab {
	constructor(app: App, private host: SettingsHost) {
		super(app, host as any);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "ANEx — Atomic Notes Extractor" });

		new Setting(containerEl)
			.setName("Clipping folder")
			.setDesc("Folder to watch/process for clippings (default: ingest/clippings).")
			.addText((text) =>
				text
					.setPlaceholder("ingest/clippings")
					.setValue(this.host.settings.clippingFolder)
					.onChange(async (value) => {
						this.host.settings.clippingFolder = sanitizePathInput(value, "ingest/clippings");
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Output folder")
			.setDesc("Destination for atomic notes (default: ingest/anex).")
			.addText((text) =>
				text
					.setPlaceholder("ingest/anex")
					.setValue(this.host.settings.outputFolder)
					.onChange(async (value) => {
						this.host.settings.outputFolder = sanitizePathInput(value, "ingest/anex");
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Processed flag field")
			.setDesc("Frontmatter flag used to mark a clipping as processed (default: Processed).")
			.addText((text) =>
				text
					.setPlaceholder("Processed")
					.setValue(this.host.settings.processedFlagField)
					.onChange(async (value) => {
						this.host.settings.processedFlagField = sanitizePropertyName(value, "Processed");
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Processed timestamp field")
			.setDesc("Frontmatter field storing when the clipping was processed (default: ProcessedAt).")
			.addText((text) =>
				text
					.setPlaceholder("ProcessedAt")
					.setValue(this.host.settings.processedAtField)
					.onChange(async (value) => {
						this.host.settings.processedAtField = sanitizePropertyName(value, "ProcessedAt");
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Source clipping property")
			.setDesc("Frontmatter property on atomic notes that stores the source clipping link.")
			.addText((text) =>
				text
					.setPlaceholder("source_clipping")
					.setValue(this.host.settings.sourceClippingPropertyName)
					.onChange(async (value) => {
						this.host.settings.sourceClippingPropertyName = sanitizePropertyName(value, "source_clipping");
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Source link format")
			.setDesc("How ANEx formats the source clipping link stored in note frontmatter.")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("filename", "[[filename]]")
					.addOption("pathWithTitle", "[[path/to/file|Title]]")
					.setValue(this.host.settings.sourceLinkFormat)
					.onChange(async (value) => {
						this.host.settings.sourceLinkFormat = value as AnexSettings["sourceLinkFormat"];
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Store atomic note links in frontmatter")
			.setDesc("Save links to generated atomic notes on the clipping frontmatter (recommended).")
			.addToggle((toggle) =>
				toggle
					.setValue(this.host.settings.storeNoteLinksInFrontmatter)
					.onChange(async (value) => {
						this.host.settings.storeNoteLinksInFrontmatter = value;
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Clipping note links property")
			.setDesc("Frontmatter property on clippings used to store atomic note links.")
			.addText((text) =>
				text
					.setPlaceholder("anex_notes")
					.setValue(this.host.settings.noteLinksProperty)
					.onChange(async (value) => {
						this.host.settings.noteLinksProperty = sanitizePropertyName(value, "anex_notes");
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Append links to clipping footer")
			.setDesc("Also add atomic note links to the bottom of the clipping document.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.host.settings.writeNoteLinksToFooter)
					.onChange(async (value) => {
						this.host.settings.writeNoteLinksToFooter = value;
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Provider")
			.setDesc("LLM provider used for extraction.")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("openai", "OpenAI")
					.addOption("anthropic", "Anthropic")
					.addOption("google", "Google (Gemini)")
					.addOption("mock", "Mock (offline)")
					.setValue(this.host.settings.provider)
					.onChange(async (value) => {
						this.host.settings.provider = value as AnexSettings["provider"];
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("OpenAI API key")
			.setDesc("Stored locally; required for OpenAI provider.")
			.addText((text) =>
				text
					.setPlaceholder("sk-...")
					.setValue(this.host.settings.openAIApiKey)
					.onChange(async (value) => {
						this.host.settings.openAIApiKey = value.trim();
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("OpenAI model")
			.setDesc("Model identifier used when provider is OpenAI.")
			.addText((text) =>
				text
					.setPlaceholder("gpt-4o-mini")
					.setValue(this.host.settings.openAIModel)
					.onChange(async (value) => {
						this.host.settings.openAIModel = value.trim() || "gpt-4o-mini";
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Anthropic API key")
			.setDesc("Stored locally; required for Anthropic provider.")
			.addText((text) =>
				text
					.setPlaceholder("sk-ant-...")
					.setValue(this.host.settings.anthropicApiKey)
					.onChange(async (value) => {
						this.host.settings.anthropicApiKey = value.trim();
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Anthropic model")
			.setDesc("Model identifier used when provider is Anthropic.")
			.addText((text) =>
				text
					.setPlaceholder("claude-3-5-sonnet-20240620")
					.setValue(this.host.settings.anthropicModel)
					.onChange(async (value) => {
						this.host.settings.anthropicModel = value.trim() || "claude-3-5-sonnet-20240620";
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Google API key")
			.setDesc("Stored locally; required for Google provider (Gemini).")
			.addText((text) =>
				text
					.setPlaceholder("AIza...")
					.setValue(this.host.settings.googleApiKey)
					.onChange(async (value) => {
						this.host.settings.googleApiKey = value.trim();
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Google model")
			.setDesc("Model identifier used when provider is Google (Gemini).")
			.addText((text) =>
				text
					.setPlaceholder("gemini-1.5-flash")
					.setValue(this.host.settings.googleModel)
					.onChange(async (value) => {
						this.host.settings.googleModel = value.trim() || "gemini-1.5-flash";
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Min ideas per clipping")
			.setDesc("Lower bound for ideas the model should return.")
			.addText((text) =>
				text
					.setPlaceholder("3")
					.setValue(String(this.host.settings.minIdeas))
					.onChange(async (value) => {
						const parsed = parseInt(value, 10);
						if (!Number.isNaN(parsed)) {
							this.host.settings.minIdeas = parsed;
							await this.host.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Max ideas per clipping")
			.setDesc("Upper bound for ideas the model should return.")
			.addText((text) =>
				text
					.setPlaceholder("8")
					.setValue(String(this.host.settings.maxIdeas))
					.onChange(async (value) => {
						const parsed = parseInt(value, 10);
						if (!Number.isNaN(parsed)) {
							this.host.settings.maxIdeas = parsed;
							await this.host.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Allow overwrite")
			.setDesc("Overwrite existing atomic note files when names collide.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.host.settings.allowOverwrite)
					.onChange(async (value) => {
						this.host.settings.allowOverwrite = value;
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Auto-watch clippings folder")
			.setDesc("Automatically extract atomic notes when new files are added to the clippings folder (off by default).")
			.addToggle((toggle) =>
				toggle
					.setValue(this.host.settings.autoWatchClippings)
					.onChange(async (value) => {
						this.host.settings.autoWatchClippings = value;
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Sanitize tags")
			.setDesc("Convert spaces to hyphens and strip invalid characters from generated tags.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.host.settings.convertTagSpacesToHyphens)
					.onChange(async (value) => {
						this.host.settings.convertTagSpacesToHyphens = value;
						await this.host.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Custom extraction prompt")
			.setDesc("Optional: override the default model instructions. Leave empty to use the built-in prompt.")
			.addTextArea((text) =>
				text
					.setPlaceholder("Keep it brief and focused on extracting atomic ideas...")
					.setValue(this.host.settings.customExtractionPrompt)
					.onChange(async (value) => {
						this.host.settings.customExtractionPrompt = value.trim();
						await this.host.saveSettings();
					})
			);
	}
}
