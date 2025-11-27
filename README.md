# ANEx (Atomic Notes Extractor)

An Obsidian plugin that automatically converts raw clippings into structured atomic notes using LLM-powered extraction. ANEx follows RSA-Core principles for modular, predictable knowledge processing.

## Overview

**ANEx (Atomic Notes Extractor)** transforms raw text clippings into clean, structured atomic notes. Each clipping becomes 3-8 focused notes (1-2 sentences each) with labels, tags, and full traceability.

**Core Workflow:** Clipping → Extracted Ideas → Atomic Notes → Written Files → Processed Marker

## Features

- 🤖 **Multi-Provider LLM Support**: OpenAI, Anthropic Claude, Google Gemini, or offline Mock provider
- 📁 **Smart Folder Watching**: Monitors clippings folder with drag-and-drop support and event handling
- 🏷️ **Structured Atomic Notes**: Clean YAML frontmatter with full metadata and traceability
- 🔗 **Bidirectional Linking**: Obsidian wiki-links connect atomic notes to their source clippings
- 🎛️ **Rich Sidebar Interface**: Live status dashboard with quick actions and progress tracking
- ⚡ **Ribbon Button Access**: One-click sidebar access like other Obsidian plugins
- 🔄 **Idempotent Processing**: Prevents duplicates through smart processed markers
- 🛡️ **Robust Error Handling**: Filters invalid ideas instead of failing completely
- ⚙️ **Comprehensive Settings**: Full configuration UI for all options
- 🧪 **Offline Testing**: Mock provider for development without API costs

## Installation

### For Users
1. Download the latest release from the [GitHub releases page](https://github.com/your-repo/anex/releases)
2. Extract the files to your vault's `.obsidian/plugins/anex/` folder
3. Reload Obsidian and enable the plugin in Settings → Community plugins
4. Configure your LLM provider and API keys in the plugin settings

### For Developers
```bash
git clone <repository-url>
cd atomic-notes-extractor
npm install
npm run build
# Copy main.js, manifest.json, and styles.css to your vault's .obsidian/plugins/anex/ folder
```

## Quick Start

1. **Set up folders**: Create `ingest/clippings` and `ingest/anex` folders (or set your own paths in settings)
2. **Configure provider**: Go to Settings → ANEx and choose your LLM provider
3. **Add API key**: Enter your API key for the chosen provider
4. **Create a clipping**: Add a text file to your `ingest/clippings` folder
5. **Extract notes**: Use the command palette to run "ANEx: Extract Active File"

## Usage

### Sidebar Dashboard
- **Ribbon Button**: Click the notebook icon in the left sidebar to open the ANEx panel
- **Command Palette**: "ANEx: Toggle Sidebar" to show/hide the interface
- **Live Status**: View clipping counts, processing progress, and quick actions

### Manual Processing
- Open a clipping file in Obsidian
- Use Command Palette: **"ANEx: Extract Active File"**
- Or use the sidebar's quick actions for batch processing

### Batch Processing
- Sidebar: Click **"Process All Unprocessed"** button
- Command Palette: **"ANEx: Extract from Clippings Folder"**
- Processes all unprocessed files with live progress updates

### Automatic Processing
- Toggle **Auto-watch clippings folder** on in settings (off by default to avoid surprises)
- New files added to your clippings folder (including drag-and-drop) are processed automatically
- Robust event handling for create, modify, and rename operations, and can be disabled instantly from settings

## Settings

### Core Settings
- **Clipping folder**: Path to monitor for new clippings (default: `ingest/clippings`)
- **Output folder**: Where atomic notes are saved (default: `ingest/anex`)
- **Processed flag field**: Frontmatter field name for tracking processed status (default: `Processed`)
- **Processed timestamp field**: Frontmatter field name for when the clipping was processed (default: `ProcessedAt`)
- **Auto-watch clippings folder**: Enable/disable automatic processing of new files (off by default)
- **Clipping note links property**: Frontmatter property for backlinks to generated notes (default: `anex_notes`)
- **Source clipping property**: Frontmatter property on notes storing the source link (default: `source_clipping`)
- **Source link format**: Choose between `[[filename]]` or `[[path/to/file|Title]]`

### Extraction Settings
- **Min/Max ideas**: Control the number of atomic notes per clipping (3-8 recommended)
- **Allow overwrite**: Replace existing atomic note files on conflicts
- **Sanitize tags**: Convert spaces to hyphens and strip invalid characters
- **Custom extraction prompt**: Override the built-in prompt when needed

### LLM Providers
- **Provider**: Choose OpenAI, Anthropic, Google (Gemini), or Mock
- **API Keys**: Securely stored locally for each provider
- **Models**: Select specific models (GPT-4, Claude, Gemini, etc.)

## Sidebar Interface

The ANEx sidebar provides comprehensive control and monitoring:

### Features
- **📊 Live Status**: Real-time counts of total, processed, and unprocessed clippings
- **📈 Progress Tracking**: Visual progress bar and completion percentage
- **⚡ Quick Actions**: One-click processing of all unprocessed files
- **🔄 Auto-Refresh**: Updates every 5 seconds to show current status
- **🎯 Error Handling**: Clear feedback for missing folders or access issues

### Access Methods
- **Ribbon Button**: Notebook icon in left sidebar (like other plugins)
- **Command Palette**: "ANEx: Toggle Sidebar"
- **Keyboard**: Assign hotkey to the toggle command

### Status Indicators
- **Total Clippings**: All markdown files in your clippings folder
- **Processed**: Files that have been successfully extracted
- **Unprocessed**: Files awaiting processing
- **Progress Bar**: Visual completion indicator

## Output Format

Each atomic note is saved as a separate Markdown file with bidirectional linking:

### Atomic Note Structure
```yaml
---
title: Idea Label
source_clipping: [[/ingest/clippings/my-clipping|My Clipping]]
created: 2024-01-15T10:30:00.000Z
tags: [topic1, topic2]
---

The atomic idea content goes here, typically 1-2 sentences focusing on a single concept.
```

### Source Clipping Updates
After processing, source clippings gain a frontmatter property with backlinks to generated notes:

```yaml
anex_notes:
  - [[/ingest/anex/idea-1|Idea 1]]
  - [[/ingest/anex/idea-2|Idea 2]]
```

You can optionally append a footer section of links via settings if you prefer visible in-body backlinks.

## Providers

### OpenAI
- Uses GPT models via the Chat Completions API
- Recommended: `gpt-4o-mini` for cost-effective extraction
- Requires OpenAI API key

### Anthropic Claude
- Uses Claude models via the Messages API
- Recommended: `claude-3-5-sonnet-20240620`
- Requires Anthropic API key

### Google Gemini
- Uses Gemini models via the Generative Language API
- Recommended: `gemini-1.5-flash` for fast processing
- Requires Google AI API key

### Mock Provider
- Generates deterministic sample ideas for testing
- No API key required
- Perfect for offline development and testing

## Development

### Setup
```bash
npm install
npm run dev    # Watch mode for development
npm run build  # Production build
```

### Architecture
- **Entry Point**: `src/main.ts`
- **Workflow**: `src/workflows/extractionWorkflow.ts` - Main processing pipeline
- **Services**: Modular extraction, building, writing, and monitoring components
- **UI Components**: Settings tab and interactive sidebar dashboard
- **Providers**: Pluggable LLM integration layer (OpenAI, Anthropic, Google, Mock)
- **RSA-Core Compliant**: Clear entity patterns, transformations, and invariants

### Key Files
- `src/main.ts` - Plugin lifecycle, service orchestration, and view registration
- `src/workflows/extractionWorkflow.ts` - Main processing pipeline with bidirectional linking
- `src/services/` - Individual service components (extraction, building, writing, watching)
- `src/ui/` - User interface components (settings tab, sidebar dashboard)
- `src/settings.ts` - Configuration interface and defaults
- `src/types/entities.ts` - Core data structures and type definitions

## Troubleshooting

### Common Issues
- **"API key is missing"**: Configure your API key in plugin settings
- **"File already exists"**: Enable "Allow overwrite" or rename conflicting files
- **"Clippings folder not found"**: Create the folder or update the path in settings
- **"Too many/few ideas extracted"**: Adjust min/max idea settings or check LLM response
- **Sidebar not showing**: Use ribbon button or "ANEx: Toggle Sidebar" command
- **Links not working**: Ensure filenames don't contain special characters
- **Empty files**: Check that your clipping contains readable text content

### Debug Mode
Enable developer console in Obsidian (Ctrl+Shift+I) to see detailed error logs.

## Security & Privacy

- API keys are stored locally in Obsidian's settings
- No telemetry or data collection beyond required LLM API calls
- Clipping content is sent to your chosen LLM provider
- All processing happens locally in your vault

## Contributing

This plugin follows RSA-Core architectural principles. Key guidelines:

- Maintain clear separation between extraction and downstream processing
- Keep atomic notes focused and minimal
- Preserve idempotency through processed markers
- Add comprehensive error handling
- Follow TypeScript strict mode requirements

## License

MIT License - see LICENSE file for details.
