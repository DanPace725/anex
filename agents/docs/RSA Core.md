Below is a **clean, self-contained RSA-Core document** designed *specifically* for LLM coding agents.
It is:

* concise
* generic
* implementation-agnostic
* easy for LLMs to internalize
* abstract enough to avoid revealing RPs
* structured enough to meaningfully shape architectural decisions
* suitable to drop directly into a repo under `agents/docs/rsa-core.md`

It avoids philosophical language, mathematics, and anything that could expose the deeper ontology.
It reads like a practical design-guide.

---

# 📘 **RSA-Core: Relational Systems Architecture (Agent Guide)**

**Location:** `agents/docs/rsa-core.md`
**Audience:** LLM coding agents, architectural assistants, codegen models
**Purpose:** Provide a consistent conceptual vocabulary for designing clean, modular, relationally-sound systems.

---

# **RSA-Core Overview**

Relational Systems Architecture (RSA) is a small set of **conceptual building blocks** for designing modular, extensible, and coherent software systems.

These terms help coding agents reason about:

* data shape
* context
* workflow direction
* boundaries
* constraints
* integration
* lifecycle

RSA-Core is **not a framework** and **not a strict syntax**—it is a *design vocabulary* for structuring systems.

Agents should apply these terms when interpreting, designing, or modifying system components.

---

# **1. Entity Pattern**

**What it is:**
A stable, named kind of data used in the system.

**Purpose:**
Define what “type of thing” the system manipulates.

**Examples:**

* Clipping
* ExtractedIdea
* AtomicNote
* UserProfile
* Task
* Embedding

**Agent guidance:**

* Keep entities minimal and clear.
* Each entity represents one coherent concept.
* Do not overload an entity with responsibilities.

---

# **2. Transformation Pattern**

**What it is:**
A bounded operation that converts one entity (or set of entities) into another.

**Purpose:**
Encapsulate a single, well-defined change.

**Examples:**

* Clipping → ExtractedIdeas
* ExtractedIdea[] → AtomicNote[]
* AtomicNote → Embedding
* Embedding[] → Clusters

**Agent guidance:**

* Each transformation should do one thing.
* Inputs and outputs should be explicit.
* Avoid mixing unrelated transformations.

---

# **3. Context Space**

**What it is:**
A defined environment or scope in which entities live and operations occur.

**Purpose:**
Provide a stable “place” for reading, writing, and managing data.

**Examples:**

* Obsidian vault folder
* Database schema
* Project directory
* Request/session context

**Agent guidance:**

* Know which context space a transformation is meant to operate in.
* Never implicitly switch context spaces without being told.

---

# **4. Invariant**

**What it is:**
A rule that must remain true for entities or transformations to stay valid.

**Purpose:**
Protect the system from drift, corruption, or incoherence.

**Examples:**

* “A clipping can only be processed once.”
* “No more than 8 atomic ideas per extraction.”
* “AtomicNote text must be <= 2 sentences.”

**Agent guidance:**

* Enforce invariants where appropriate.
* Never silently violate an invariant.
* If violated, surface a clear error.

---

# **5. Sequence**

**What it is:**
An ordered chain of transformations that together form a meaningful workflow.

**Purpose:**
Define how the system progresses from raw input to final output.

**Examples:**

* Clipping → Ideas → Atomic Notes → Write
* File → Embedding → Cluster → Summary

**Agent guidance:**

* Maintain clear ordering.
* Each step should use the previous step's output.
* Avoid reordering unless explicitly instructed.

---

# **6. Signature**

**What it is:**
The minimal shape and required fields for an entity or transformation I/O.

**Purpose:**
Provide a stable contract for agents and modules.

**Examples:**

* What fields must a Clipping have?
* What does an ExtractedIdea look like?
* What type does a Transformation return?

**Agent guidance:**

* Honor signatures strictly.
* Do not add extra fields unless asked.
* Do not remove required fields.

---

# **7. Boundary**

**What it is:**
The conceptual edge of a module, component, or context.

**Purpose:**
Prevent accidental coupling or mixing responsibilities.

**Examples:**

* Extraction code should not cluster.
* Writers should not perform summarization.
* UI components should not run analysis directly.

**Agent guidance:**

* Respect module boundaries.
* If a task crosses boundaries, split it into steps.
* Keep communication between boundaries explicit.

---

# **8. Integration Point**

**What it is:**
A defined place where components or systems connect cleanly.

**Purpose:**
Make systems extensible and modular.

**Examples:**

* A transformation exposing an API
* A shared function for emitting standardized output
* A plugin’s entry method
* A clear interface between subsystems

**Agent guidance:**

* Keep integration points simple and predictable.
* Avoid hidden coupling or side-effects.
* Prefer explicit interfaces over implicit alignment.

---

# **9. Lifecycle**

**What it is:**
The predictable “start → run → finish → finalize” arc for any operation or workflow.

**Purpose:**
Ensure systems complete cleanly and consistently.

**Examples:**

* Marking a clipping as processed after extraction
* Cleanup after writing files
* Logging start + end of major operations

**Agent guidance:**

* Always complete a lifecycle.
* Write closure actions (e.g., marking completion) at the end of flows.
* Do not leave partial state unless instructed.

---

# **10. Resolution Layer**

**What it is:**
A meaningful level of abstraction where complexity is compressed into a single conceptual unit.

**Purpose:**
Make the system understandable and modifiable.

**Examples:**

* Raw text → ExtractedIdeas (meaning resolution)
* Idea[] → AtomicNotes (representation resolution)
* Notes → Embeddings (semantic resolution)

**Agent guidance:**

* Keep each layer’s purpose clear.
* Never mix layers in a single transformation.
* Do not collapse layers unless explicitly asked.

---

# **11. Coherence Surface**

**What it is:**
The final stable state of an entity, file, output, or UI after a workflow completes.

**Purpose:**
Provide the “finished form” the rest of the system can rely on.

**Examples:**

* A fully-written AtomicNote
* A completed clustering result
* A rendered UI panel

**Agent guidance:**

* Produce clean, predictable outputs.
* Avoid leaving artifacts in partial or invalid states.
* Stability and clarity matter more than internal cleverness.

---

# **12. Orientation**

**What it is:**
The relational positioning of a component within a workflow or system.

**Purpose:**
Help agents know “where this piece fits.”

**Examples:**

* “This module is upstream of clustering.”
* “This component writes files but does not read them.”
* “This step is internal and not user-facing.”

**Agent guidance:**

* Ask for orientation if uncertain.
* Keep components aligned with their intended role.
* Avoid repurposing a component without instruction.

---

# **How Agents Should Use RSA-Core**

1. **Before coding**, identify Entities + Transformations.
2. **Respect boundaries** between modules.
3. **Preserve invariants** throughout workflows.
4. **Compose steps into Sequences**, never giant monoliths.
5. **Honor signatures** exactly.
6. **Use context spaces** consistently.
7. **Ensure closure** with lifecycles.
8. **Prefer clarity over cleverness.**
9. **Ask when integration points are unclear.**

RSA-Core is meant to make agent-generated code:

* more modular
* more stable
* easier to maintain
* easier to refactor
* easier to reason about
* more predictable
* less fragile

It provides a **consistent architecture** even across unrelated projects.

---

