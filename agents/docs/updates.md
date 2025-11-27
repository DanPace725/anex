Below is a **clean, bounded, actionable set of plugin-update tasks** derived from your conversation with your brother.
These are grouped, sequenced, and written in a way that can go directly into your **`agents/docs/anex-update-tasks.md`** file so agents can execute or iterate on them safely.

This is the *minimal discrete task list* for ANEx improvements.

---

# 📘 **ANEx – Update Task List (Discrete, Agent-Ready)**

## **0. Naming / Identity Updates**

**Goal: establish consistent naming + identity across codebase & UI.**

### **Tasks**

* [ ] Add acronym **ANEx** (Atomic Notes Extractor) to all docs in `agents/docs/`
* [ ] Update README to use **ANEx** as the official project name
* [ ] Ensure plugin commands + settings display “ANEx” instead of long names

---

# **1. Command Naming Improvements**

**Goal: Make commands clearer and shorter.**

### **Tasks**

* [ ] Rename command:
  `Run Extraction on Active File` → **`ANEx: Extract Active File`**
* [ ] Rename command:
  `Run Extraction on Folder` → **`ANEx: Extract from Clippings Folder`**
* [ ] Shorten or prefix all commands with `ANEx:` for clarity

---

# **2. Auto-Run Toggle Fix**

**Goal: Ensure “Auto-run on new files” truly disables automatic processing.**

### **Tasks**

* [ ] Fix setting: `autoRunOnLoad = false` should fully disable file watcher
* [ ] Ensure watcher unsubscribes from `vault.on('create')` when setting = off
* [ ] If needed, reattach listener when setting toggles to ON

---

# **3. Tag Sanitization**

**Goal: Prevent invalid Obsidian tags (spaces, invalid chars).**

### **Tasks**

* [ ] Normalize tags by converting spaces → hyphens (`Deep Focus` → `Deep-Focus`)
* [ ] Strip invalid characters (`/`, `\`, `.` etc.)
* [ ] Add simple tag sanitizer to extraction step
* [ ] (Optional) provide setting: *“Convert spaces to hyphens in tags?”*

---

# **4. Source Link Formatting Improvements**

**Goal: Store processed note links in a cleaner, consistent format.**

Your brother suggested the format:

```
[[/ingest/anex/accountability-imbalance|Accountability Imbalance]]
```

### **Tasks**

* [ ] Add setting: “Source Link Format”
  Options:

  * `[[filename]]` (current default)
  * `[[path/to/file|Title]]` (cleaner, explicit)
* [ ] Implement link generation using the user’s preferred format
* [ ] Add this link to **frontmatter property** instead of bottom of file

---

# **5. Move Atomic Note Backlinks into Properties Instead of Document Body**

**Goal: Avoid clutter at bottom of clippings; keep link metadata structured.**

### **Tasks**

* [ ] Remove automatic insertion of note links at bottom of clipping
* [ ] Add property in frontmatter, e.g.:

  ```yaml
  anex_notes:
    - [[path|Title]]
    - [[path|Title]]
  ```
* [ ] Add setting: “Store atomic note links in frontmatter (recommended)”

---

# **6. Make `sourceClippingId` Configurable**

**Goal: Let users define where source reference is stored.**

### **Tasks**

* [ ] Add setting: `sourceClippingPropertyName`
  Default: `source_clipping`
* [ ] Use this setting when writing frontmatter to atomic notes
* [ ] Validate that property name is legal YAML key

---

# **7. Improve File Naming + Title Generation**

**Goal: Ensure atomic note names are clean and readable.**

### **Tasks**

* [ ] Sanitize titles (no spaces → hyphens, lowercase, safe chars only)
* [ ] Add setting for naming template, example:

  * `${label}-${timestamp}`
  * `${label}`
  * `${uuid}`

---

# **8. Add User-Facing “Custom Prompt” in Settings**

**Goal: Enable user customization without breaking internal defaults.**

### **Tasks**

* [ ] Add “Custom Extraction Prompt” field in settings
* [ ] Default to internal backend prompt if custom empty
* [ ] Sanitize user prompt (trim whitespace, avoid blank strings)

---

# **9. UI Improvements + Sidebar Icon**

**Goal: Ensure sidebar is visible and properly oriented.**

### **Tasks**

* [ ] Verify sidebar icon appears in ribbon
* [ ] Rename to “ANEx” or an icon representing notes
* [ ] Add tooltip: “Open ANEx Sidebar”
* [ ] Ensure the sidebar updates (processed vs unprocessed) when:

  * extraction completes
  * clipping processed flag changes
  * user toggles auto-run

---

# **10. Settings Defaults & Cleanup**

**Goal: Clean up user experience for fresh installs.**

### **Tasks**

* [ ] Default auto-run to OFF
* [ ] Provide default folder suggestions:

  * Clippings: `/ingest/clippings/`
  * Output: `/ingest/anex/`
* [ ] Add validation to highlight missing folders
* [ ] Ensure missing API key produces a clear error popup

---

# **11. Optional (Future-Proofing)**

These aren't required immediately but came up implicitly.

### **Tasks**

* [ ] Add toggle: “Show extracted note links in clipping footer” (off by default)
* [ ] Add toggle: “Include tag suggestions in atomic notes”
* [ ] Allow users to choose between:

  * OpenAI
  * Anthropic
  * Google
  * Any LLM endpoint (custom URL)

---

# **12. Meta Tasks (Repository Organization)**

**Goal: Reflect ANEx identity + maintain structure for agents.**

### **Tasks**

* [ ] Update repo name if desired (`anex`)
* [ ] Update `AGENTS.md` to reference RSA-Core + ANEx
* [ ] Add short design rationale from chat-conversation insights
* [ ] Add `CHANGELOG.md` for future updates

---

# 🌟 **Summary of Most Important Changes (to prioritize)**

If you want a *minimum set*:

1. Rename commands + add ANEx prefix
2. Fix auto-run toggle
3. Sanitize tags
4. Move extracted note links into frontmatter
5. Add custom prompt setting
6. Make sourceClippingId configurable
7. Improve sidebar icon visibility
8. Update repo author/name metadata

Everything else is polish.


