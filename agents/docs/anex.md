Here is a **clean, agent-oriented “Overview / Goal / Plan”** document for the **Atomic Notes Extraction Plugin**.
It is engineered to work perfectly alongside `rsa-core.md` so coding agents have an unambiguous scope, architecture, and direction.

Place this in your repo under:

`agents/docs/atomic-notes-extractor.md`

---

# 📘 **Atomic Notes Extraction Plugin — Overview, Goal, Plan**

**Location:** `agents/docs/atomic-notes-extractor.md`
**Audience:** LLM coding agents working on the plugin
**Purpose:** Provide a clear, bounded description of what the plugin *is*, what it *must do*, what it *must not do*, and how to build it using RSA-Core concepts.

---

# **1. Overview**

The Atomic Notes Extraction Plugin is a **modular Obsidian plugin** (or equivalent JS-based extension) that converts *raw clippings* into **clean, structured atomic notes** through an LLM-assisted extraction step.

It is the **first stage** in a larger relational workflow.
Its job is **only extraction**.
It does **not** cluster, summarize, tag deeply, classify, or perform analysis.

The plugin follows the principles defined in **RSA-Core** to maintain clarity, modularity, and predictable behavior.

---

# **2. High-Level Purpose**

The plugin provides a reliable, repeatable flow:

**Raw Clipping → Extracted Ideas → Atomic Notes (files)**

Each atomic note:

* contains one coherent idea
* is 1–2 sentences
* has a short label
* includes minimal topical tags (optional)
* is stored as a markdown file in an Extracted zone
* is marked as derived from a specific clipping (traceability)

The plugin also marks the original clipping as **processed** to ensure idempotence.

---

# **3. Scope (What This Plugin *Does*)**

The plugin handles the following responsibilities:

### **A) Detect or receive raw clippings**

* Watch a designated “Clippings” folder
* OR trigger extraction manually
* OR receive clipping input from another plugin (e.g., OBI)

### **B) Send clipping text to an LLM to extract atomic ideas**

The LLM produces a list of ideas with:

* `label`
* `idea`
* optional `tags`

### **C) Convert extracted ideas into structured “Atomic Note” entities**

Each idea becomes a markdown file with:

* YAML frontmatter
* Label → title
* Idea → body
* Tags → frontmatter tags
* Source clipping reference
* Timestamp

### **D) Write atomic notes into the correct workspace location**

Typically:
`/AtomicNotes/` or user-configured folder.

### **E) Mark the clipping as processed**

To prevent reprocessing loops.

### **F) Provide minimal UI affordances**

Examples:

* “Extract Atomic Notes” command
* Status indicator for processed/unprocessed
* Optional sidebar panel

---

# **4. Non-Scope (What This Plugin *Does Not Do*)**

To avoid boundary-bleed:

* Does **not** cluster or embed notes
* Does **not** generate summaries
* Does **not** rewrite the clipping
* Does **not** attempt deep tagging
* Does **not** categorize the notes
* Does **not** perform analysis or visualization
* Does **not** determine meaning beyond extraction
* Does **not** connect to downstream systems automatically

These belong to **other modules** in a suite—not this one.

This plugin stays in its **RSA boundaries**.

---

# **5. RSA-Core Mapping**

Below is how the plugin’s design maps onto RSA-Core concepts.

### **Entity Patterns**

* `Clipping`
* `ExtractedIdea`
* `AtomicNote`

### **Transformations**

1. `Clipping → ExtractedIdea[]`
2. `ExtractedIdea[] → AtomicNote[]`
3. `AtomicNote[] → WrittenFiles`

### **Context Space**

* The Obsidian vault (or configured folder set)
* API config for LLM
* Plugin settings

### **Invariants**

* Max 3–8 ideas per clipping
* Atomic notes must be <= 2 sentences
* Raw clippings cannot be overwritten
* Each clipping can only be processed once
* Atomic notes must retain source reference

### **Sequence**

1. Read clipping
2. Extract ideas
3. Build atomic notes
4. Write notes
5. Mark processed

### **Signature**

* Clear, stable shape of each entity
* Predictable file output
* Minimal required metadata

### **Boundary**

Extraction is *strictly* its own domain.

### **Integration Points**

* Optional OBI integration
* Optional downstream clustering plugin
* File output for other tools to consume

### **Lifecycle**

* Start: detect clipping
* Run: process
* Closure: mark processed + write notes

### **Resolution Layer**

* Complexity is compressed into simple atomic units

### **Coherence Surface**

* A fully generated set of atomic notes
* Cleanly written to disk
* Stable for downstream tools

### **Orientation**

* This plugin sits **upstream** of all other processing tools.
* It outputs canonical atomic notes for the rest of the system.

---

# **6. Expected Behavior (Codified)**

Coding agents should treat these as rules:

1. **One clipping → many atomic notes.**
2. **Never modify raw clippings.**
3. **Always mark processed after success.**
4. **Output must be deterministic.**
5. **Error on invariant violations.**
6. **UI must be optional, not required.**
7. **No side-effects beyond writing notes + marking processed.**
8. **Keep implementation modular and replaceable.**

---

# **7. Minimal Data Shapes (for agent reasoning)**

### **Clipping**

```
id: string
path: string
text: string
processed: boolean
```

### **ExtractedIdea**

```
label: string
idea: string
tags?: string[]
```

### **AtomicNote**

```
id: string
title: string
body: string
tags: string[]
sourceClippingId: string
timestamp: number
```

(These are *conceptual shapes*, not strict schemas.)

---

# **8. Plan of Implementation (Agent-Friendly)**

### **Step 1 — Setup**

* Create plugin settings
* Configure clipping folder
* Configure output folder
* Configure LLM provider + key

### **Step 2 — Clipping Detection**

* Watch folder OR manual trigger
* Ensure clipping is valid and unprocessed

### **Step 3 — Idea Extraction**

* Send text to LLM
* Receive extracted idea list
* Validate against invariants

### **Step 4 — Build Atomic Notes**

* Map ideas to atomic note entities
* Fill metadata (tags, timestamps, source)
* Generate readable filenames

### **Step 5 — Write Files**

* Write each atomic note separately
* Ensure folder exists
* Avoid overwriting existing notes

### **Step 6 — Mark Processed**

* Update clipping metadata
* Store status flags

### **Step 7 — UI / Commands**

* “Extract Notes from Current File”
* Status indicator

---

# **9. What Agents Should Prioritize**

1. **Clear separation of steps** (do not merge unrelated logic)
2. **Idempotence** (processing a clipping twice should not duplicate notes)
3. **Readable output files**
4. **Minimalism** (avoid unnecessary complexity)
5. **Modularity** (downstream tools must be easy to attach)
6. **RSA-Core alignment** (respect boundaries + invariants)

---


