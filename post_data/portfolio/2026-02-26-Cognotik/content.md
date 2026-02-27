# Cognotik Demos: AI-Powered Workflows in Action

---

## What is Cognotik?

Cognotik is an open-source, AI-powered development platform that combines intelligent planning, code generation, and
interactive interfaces to automate complex workflows. It is **not** a venture-funded magic genie — it's a tool built
for professionals who want control, not hype. It lacks polish in places, and that's a deliberate trade-off for
transparency and user agency. That deliberate roughness functions as a signal: this is a build system, not a sales
pitch. In a market saturated with "magic genie" hype, the absence of polish is itself a commitment device — a way of
saying the engineering went into the machinery, not the marketing.

It follows a **"Bring Your Own Key"** model — you supply your own API keys for providers like OpenAI, Anthropic, or
Google, giving you full control over cost, privacy, and model selection. The entire codebase is open source, every AI
action is visible and reviewable in the UI, and there are no black boxes between you and the models you're paying for.

**Why this matters:** Nearly every AI product today funnels user interaction through a chat-based control surface —
what game theorists would call the "conversation partner" model. That's intuitive for casual use, but it's a poor fit
for professional and enterprise workflows where you need reproducibility, auditability, structured file operations,
and integration with existing toolchains. The strategic difference isn't incremental; it's categorical. Chat-based AI
treats intent as ephemeral — each prompt drifts from the last, context decays, and reproducibility is essentially
zero. Cognotik offers something that doesn't easily compare to other AI tools because it's solving a fundamentally
different problem: **orchestrating AI as a build system**, not as a conversation partner.

The BYOK model has a deeper strategic implication beyond cost savings: it **decouples the orchestration layer from the
intelligence layer**. You can use GPT-4o for planning, Claude for code generation, and a local Llama instance for
summarization — all within the same pipeline. When a new model drops or a provider changes pricing, you swap the key,
not the tool. This eliminates the vendor lock-in that defines the subscription AI market and shifts competitive
pressure from "who has the smartest chatbot" to "who has the most reliable build system for thought."

At its core, Cognotik uses a **declarative document-driven approach**: you describe *what* you want done using Markdown
files with YAML frontmatter, and the platform's **DocProcessor** engine figures out *how* to execute it — orchestrating
AI models, file transformations, web research, and code generation automatically.

---

## The DocProcessor Engine

Before diving into the demos, it's worth understanding the mechanism that powers them. Every workflow in Cognotik is
defined by **Markdown files with frontmatter** that declare:

- **`specifies`** — files this document should create or update
- **`transforms`** — regex-based rules that map input files to output files
- **`documents`** — source files this document describes (for keeping docs in sync)
- **`generates`** — explicit input-to-output generation specs
- **`related`** — additional context files or URLs
- **`task_type`** — the kind of AI task to perform (e.g., `FileModification`, `Brainstorming`, `CrawlerAgent`,
  `SubPlan`)

The engine resolves dependencies between tasks topologically, expands glob and regex patterns, and executes everything
with configurable overwrite modes (skip, overwrite, patch). Think of it as a **Makefile for AI** — but instead of
compiling code, it compiles *thought*.

This architecture has a property that's easy to overlook but profoundly important: **the filesystem is the source of
truth**. Unlike agentic frameworks that maintain state in volatile memory or hidden databases, every input, output,
and intermediate artifact lives on disk as a plain file. That means the AI's entire "thought process" is
version-controllable, diffable, and auditable using the same tools (Git, diff, grep) that developers already use for
source code. The operation files themselves — the Markdown documents with YAML frontmatter — are simultaneously
human-readable documentation and machine-executable build instructions. This is the "Content-as-Code" philosophy
taken to its logical conclusion.

---

## Demo 1: Package README Generator — The Simplest Use Case

**Goal:** Automatically generate and maintain `README.md` files for every package in a codebase, keeping documentation
perpetually in sync with source code.

### The Operation

This is the simplest possible Cognotik workflow — a single Markdown file with one line of frontmatter:

```yaml
---
transforms: ../(.+/src/main/kotlin/.+/)([^\./]+)\.kt -> ../$1/README.md
---
```

That's it. This single regex transform matches **every Kotlin source file** in the entire monorepo and maps it to a
`README.md` in the same directory.

### What Happens When You Run It

1. The DocProcessor scans the workspace and finds all `.kt` files matching the pattern.
2. For each package directory, it groups the matched source files.
3. The AI reads the actual source code — class definitions, public APIs, `@Description` annotations, doc comments —
   and generates a `README.md` that describes the package's purpose, key classes, and usage patterns.
4. On subsequent runs, it updates existing READMEs to reflect code changes, using the configured overwrite mode
   (patch, overwrite, or skip).

### What This Demonstrates

- **Zero-configuration start:** You don't need to learn a complex API or write any code. One frontmatter directive
  and you have a working documentation pipeline.
- **Pattern-based file routing:** The regex transform is the core primitive of the DocProcessor. A single pattern
  can match hundreds of files and produce hundreds of outputs.
- **AI-grounded documentation:** Because the AI reads the source code as context, the generated docs describe what
  the code *actually does*, not what someone hoped it would do six months ago.
- **Incremental maintenance:** This isn't a one-shot generator. Run it after every code change and your docs stay
  current automatically.

This is the pattern that Cognotik uses to maintain its own package documentation (more on that in Demo 5). But the
same one-line transform works on any Kotlin, Java, or TypeScript project — just adjust the regex.

---

## The Task Planning System

The README generator above uses the default task type (`FileModification`) — the AI simply reads input files and
writes output files. But Cognotik's real power emerges when you need to **combine multiple task types** into a
coordinated workflow. This is where the **Task Planning System** comes in.

### Tasks: The Building Blocks

A **Task** is the fundamental unit of work in Cognotik. Each task is a specialized tool designed for a specific
kind of operation:

| Category               | Example Tasks                                                          | What They Do                                                              |
|:-----------------------|:-----------------------------------------------------------------------|:--------------------------------------------------------------------------|
| **File Operations**    | `FileModificationTask`, `FileSearchTask`, `AnalysisTask`               | Create, read, update, and search files in the workspace                   |
| **Code & Execution**   | `RunCodeTask`, `RunShellCommandTask`, `SelfHealingTask`                | Execute code, run terminal commands, auto-fix failing scripts             |
| **Reasoning**          | `ChainOfThoughtTask`, `DecompositionSynthesisTask`, `SystemsThinkingTask` | Advanced analysis — explore causes, consider viewpoints, model systems |
| **Online & Web**       | `CrawlerAgentTask`, `GitHubSearchTask`, `SeleniumSessionTask`          | Scrape websites, search GitHub, automate browser actions                  |
| **Knowledge Base**     | `KnowledgeIndexingTask`, `VectorSearchTask`                            | Build and query semantic search indexes from documents                    |
| **Planning**           | `SubPlanningTask`                                                      | Recursively invoke the entire planning framework for a sub-problem        |
| **Content Generation** | `WriteHtmlTask`, `GeneratePresentationTask`                            | Create structured HTML pages, slide decks, and other formatted content    |

Every task has configuration parameters, can declare dependencies on other tasks, and produces results that
subsequent tasks can consume.

### Cognitive Modes: How the Planner Thinks

When a workflow requires multiple tasks, Cognotik needs a **strategy** for deciding which tasks to run and in what
order. This strategy is called a **Cognitive Mode**:

| Mode                       | Strategy                        | Best For                                                    |
|:---------------------------|:--------------------------------|:------------------------------------------------------------|
| **Waterfall**              | Plan everything upfront, then execute sequentially | Well-defined projects where you want to review the plan first |
| **Conversational**         | Analyze → pick one task → execute → repeat | Interactive debugging, exploratory work                      |
| **Adaptive Planning**      | Think → Act → Reflect loop, updating beliefs each cycle | Complex, ambiguous problems requiring experimentation        |
| **Hierarchical Planning**  | Decompose into a goal tree, execute leaves in parallel | Large projects with many interdependent sub-parts            |
The choice of cognitive mode is itself a strategic decision. A Waterfall plan gives you a reviewable blueprint before
any work begins — essential when the cost of error is high. Adaptive Planning lets the system learn from its own
outputs and adjust course, which matters when the problem space is ambiguous. The point is that you're not just
telling the AI *what* to do; you're choosing the *cognitive architecture* it uses to figure out how.


### SubPlanningTask: Plans Within Plans

The most powerful composition mechanism is the `SubPlanningTask`. It launches a **new, independent instance** of
the planning framework to tackle a sub-goal — with its own cognitive mode and its own set of enabled tasks.

This means a `Waterfall` plan can delegate a complex research step to an `Adaptive Planning` sub-plan, which
autonomously investigates, experiments, and reports back. The result is passed to the next step in the parent plan
as if it were any other task output.

### Why This Matters for the Demos

The demos that follow use these building blocks in increasingly sophisticated ways:

- **Demo 2 (Puppy Research)** chains four different task types — `Brainstorming`, `FileModification`,
  `CrawlerAgent`, and `FileModification` again — into a linear pipeline. Each stage uses a different AI capability.
- **Demo 3 (Software Factory)** uses a `SubPlanningTask` configured with `Waterfall` cognitive mode to turn a
  one-page idea into an entire project skeleton. The sub-plan autonomously decides what files to create.
- **Demo 4 (Fractal Thought Engine)** fans out a single article through multiple cognitive lenses simultaneously,
  mixing creative writing, strategic analysis, and computational modeling tasks.

Understanding tasks and cognitive modes is the key to understanding *why* these pipelines work — and how to build
your own.

---

## Demo 2: Puppy Research Workflow

**Goal:** Help a user go from vague requirements ("I want a dog for my apartment") to a comprehensive breeder research
report — entirely automated.

### The Pipeline

This demo showcases a **four-stage linear pipeline**, where each stage's output becomes the next stage's input:

| Stage             | Operation File           | Input                      | Output                              | Task Type        |
|:------------------|:-------------------------|:---------------------------|:------------------------------------|:-----------------|
| 1. **Brainstorm** | `breed_brainstorm_op.md` | `requirements.md`          | `ideas.md`                          | Brainstorming    |
| 2. **Expand**     | `breed_expand_op.md`     | `ideas.md`                 | `[breed]_breed.md` (multiple files) | FileModification |
| 3. **Research**   | `breeder_research_op.md` | `[breed]_breed.md`         | `[breed]_breeder_research.md`       | CrawlerAgent     |
| 4. **Summarize**  | `breeder_summary_op.md`  | All breed + research files | `final_summary.md`                  | FileModification |

### What This Demonstrates

- **Multi-step orchestration:** Each operation file declares its inputs and outputs via `transforms` frontmatter, and
  the DocProcessor automatically chains them in the correct order.
- **Fan-out pattern:** Stage 2 takes a single file and produces *many* files (one per breed), which Stage 3 then
  processes in parallel.
- **Heterogeneous task types:** The pipeline mixes creative brainstorming, structured file generation, live web
  crawling, and analytical summarization — all coordinated by the same engine. Each stage uses a different task type
  from the planning system described above.
- **Real-world utility:** This isn't a toy example. The CrawlerAgent actually searches the web for breeders, health
  testing standards, and availability, producing genuinely useful research.

### How to Run It

1. Write a `requirements.md` describing what you want in a dog.
2. Select the operation files in the Cognotik interface (IntelliJ plugin, desktop app, or web UI).
3. The pipeline runs automatically, producing a `final_summary.md` with breed comparisons and breeder recommendations.

---

## Demo 3: Software Factory — Idea to Project Renderer

**Goal:** Transform a one-page software idea into a fully structured project skeleton with code, documentation, and a
README — in a single automated pass.

### The Pipeline

This demo is more compact but showcases a powerful pattern:

| Component                | File                  | Role                                                 |
|:-------------------------|:----------------------|:-----------------------------------------------------|
| **Operation Definition** | `render_op.md`        | Declares the regex transform and task type           |
| **Task Configuration**   | `render_project.json` | Configures the cognitive mode and execution settings |

### The Transform

The regex `^([^/\.]+)_idea\.md -> $1/README.md` is deceptively simple but powerful:

- **Input:** `cool-app_idea.md`
- **Output:** `cool-app/README.md`
- **What actually happens:** The `SubPlan` task type doesn't just create a README — it triggers a full **Waterfall**
  planning session that analyzes the idea, plans a file structure, generates multiple files, and summarizes the results.

### What This Demonstrates

- **Regex transforms:** A single pattern can match any number of idea files, making this a reusable factory for project
  generation.
- **External task configuration:** Complex settings are kept in a separate JSON file (`render_project.json`), referenced
- **SubPlanningTask in action:** This is the composition mechanism described in the Task Planning section above. Unlike
  via `task_config_json`, keeping the operation file clean and readable.
  the Puppy Research demo's simple task chain, the Software Factory delegates to a `SubPlanningTask` that spawns an
  entire sub-workflow with its own planning, execution, and summarization phases.
- **Cognitive mode configuration:** The `render_project.json` file configures the sub-plan to use `Waterfall` mode,
  ensuring the AI follows a structured sequence (analyze → plan → execute → summarize) rather than attempting everything
  at once. A different project might use `Adaptive Planning` mode for more exploratory generation.
- **Scalability:** Drop ten `_idea.md` files into the directory and the factory will render ten project skeletons, each
  in its own subdirectory.
This demo also illustrates a tension worth acknowledging: the more powerful the generation, the more important the
audit. When a `SubPlanningTask` autonomously decides what files to create, the human shifts from "builder" to
"reviewer." The Waterfall cognitive mode helps here — it produces a reviewable plan *before* execution begins — but
the responsibility for verifying that the AI's architectural choices align with your actual intent remains squarely
with you. This is the trade-off at the heart of declarative orchestration: you gain leverage, but you must maintain
the judgment to wield it.


### How to Run It

1. Create a file like `my-app_idea.md` with a description of your software concept.
2. Run the DocProcessor on `render_op.md`.
3. Find your generated project in the `my-app/` directory, complete with a README and any additional files the AI
   determined were needed.

---

## Demo 4: Fractal Thought Engine — AI-Powered Publishing

**Goal:** Transform raw research notes into a multi-modal publication — articles, comics, game theory analyses, Socratic
dialogues, and system diagrams — all from a single source.

### The Pipeline

This is the most ambitious demo, showcasing a **circular, multi-modal content pipeline**:

```
Raw Notes → Summarize → Draft Article → Fan Out to Multiple Formats → Publish
     ↑                                                                    |
     └────────────── Insights fed back for iteration ─────────────────────┘
```

### The Operator Library

Each "operator" is a Markdown file in the `docs/` directory that defines a specific transformation:

| Operator              | Input       | Output             | Cognitive Lens         |
|:----------------------|:------------|:-------------------|:-----------------------|
| `summarize_op.md`     | Raw notes   | Distilled summary  | Extraction             |
| `draft_article_op.md` | Summary     | `content.md`       | Synthesis              |
| `comic_op.md`         | Article     | `comic.md`         | Creative Writing       |
| `gametheory_op.md`    | Article     | `gametheory.md`    | Strategic Analysis     |
| `socratic_op.md`      | Article     | `socratic.md`      | Philosophical Inquiry  |
| `statemachine_op.md`  | Article     | `statemachine.md`  | Computational Modeling |
| Frontmatter Operator  | All outputs | SEO-tagged content | Metadata               |

### What This Demonstrates

- **Multi-modal generation:** A single idea is rendered through multiple cognitive lenses simultaneously, producing
  radically different artifacts from the same source material.
- **Circular pipelines:** Unlike the linear puppy workflow, insights from analytical operators can be fed back into the
  original article, enabling iterative refinement.
- **Content-as-code philosophy:** The entire publishing system is defined declaratively in Markdown files — the "source
  code" of the AI's behavior lives alongside the content it produces.
- **Integration with static site generation:** The output feeds directly into a Jekyll site with automatic format
  detection and tabbed interfaces.
- **Human-in-the-loop design:** Raw notes are never overwritten. The pipeline patches and iterates, with explicit
  checkpoints for human review.
The circular feedback loop deserves special attention. When the game theory operator analyzes an article's argument
structure and surfaces strategic blind spots, or when the Socratic operator probes the logical foundations and
reveals unstated assumptions, those insights flow back into the article itself. The result is a document that has
been stress-tested against multiple cognitive frameworks — not just written, but *cross-examined*. This is the
difference between a first draft and a publication: the draft says what you think; the publication has survived
contact with what you didn't think about.

---

## Patterns Across the Demos

These demos illustrate the key architectural patterns that make Cognotik powerful:

### 1. Declarative Orchestration

Every workflow is defined in Markdown with YAML frontmatter. There's no imperative code to write — you declare
relationships between files and the engine handles execution order, dependency resolution, and error recovery.
This is a fundamentally different relationship between human and machine than the chat paradigm offers. In a
conversation, intent is ephemeral — it drifts with each exchange, and reproducibility is essentially zero. In a
declarative document, intent is persistent, versionable, and auditable. You can diff your AI instructions the same
way you diff your source code. When something goes wrong, you don't try to remember what you said three prompts ago;
you read the operation file.


### 2. Composable Task Types

The platform provides a library of task types (`FileModification`, `Brainstorming`, `CrawlerAgent`, `SubPlan`, and more)
that can be mixed and matched within a single pipeline. Each task type encapsulates a different AI capability, and the
Task Planning System orchestrates them using configurable Cognitive Modes.

### 3. Pattern-Based File Routing

Regex transforms and glob patterns create flexible, reusable mappings between inputs and outputs. A single operation
file can process an arbitrary number of files that match its pattern.
This is powerful but demands respect. A regex is a force multiplier — it multiplies the impact of both precision and
error. In a large monorepo, a slightly malformed pattern in an operation file could trigger AI rewrites on thousands
of files, with corresponding API costs. The mitigation is the same as with any powerful tool: test your patterns,
use `Patch` mode as a default, and treat your operation files with the same review discipline you apply to production
code.


### 4. Scalable Complexity

- **Trivial case:** One regex transform generates READMEs for every package (Package README Generator).
- **Simple case:** One markdown file with a SubPlan specifies one output file (Software Factory).
- **Medium case:** A linear chain of four operations with fan-out (Puppy Research).
- **Complex case:** A circular, multi-modal pipeline with feedback loops (Fractal Thought Engine).

All four use the same underlying engine and frontmatter schema.

### 5. Separation of Concerns

Operation definitions (what to do), task configurations (how to do it), and content (the actual data) are kept in
separate files, making each independently reusable and testable.
### 6. The Shift from Generative Toil to Evaluative Toil
There's a pattern across these demos that's worth naming explicitly. As the complexity of the workflow increases,
the human's role shifts from *writing* to *reviewing*. In Demo 1, you barely review anything — the README either
matches the code or it doesn't. In Demo 3, you're reviewing an entire project skeleton that the AI designed
autonomously. In Demo 4, you're evaluating whether a game theory analysis actually strengthens your argument.
This shift has real implications. Traditional "generative toil" — the labor of writing code, drafting documents,
configuring infrastructure — is front-loaded and predictable. You struggle with syntax and structure, but once it
compiles, the behavior is deterministic. "Evaluative toil" is back-loaded and probabilistic. The expression is easy,
but the output is a hypothesis that requires forensic validation. The AI handles the *how*; you remain responsible
for the *what* and the *whether*.
This isn't a flaw in the architecture — it's the irreducible core of what human judgment means in an AI-augmented
workflow. The most valuable skill in this paradigm isn't the ability to write requirements; it's the ability to
discern the implications of the AI's implementation choices. Cognotik's transparency — the visible actions, the
filesystem-as-state, the diffable operation files — exists precisely to make that evaluative work tractable.

---

## Getting Started

To try these demos yourself:

1. **Install Cognotik** via the [desktop application](https://github.com/SimiaCryptus/Cognotik/releases/latest),
   the [IntelliJ plugin](https://plugins.jetbrains.com/plugin/27289-cognotik), or build from source.
2. **Configure your API keys** for at least one AI provider (OpenAI, Anthropic, Google, etc.).
3. **Clone a demo repository** and open it in your preferred interface.
4. **Select the operation files** and run the DocProcessor — choose your overwrite mode (🩹 Patch Outdated is a good
   default) and watch the pipeline execute.

Each demo is self-contained and designed to run out of the box with minimal configuration. The frontmatter in each
operation file tells the engine everything it needs to know.
A practical note on overwrite modes: **Patch** is the right default for almost every situation. It preserves
human-written sections while updating machine-generated parts, maintaining the human-in-the-loop standard that
separates a professional workflow from a "wish and hope" approach. **Overwrite** is for regeneration from scratch.
**Skip** protects files you've manually edited and don't want the AI to touch. Choose deliberately.

---

*These demos represent just a fraction of what's possible with Cognotik's declarative AI orchestration. The same
patterns can be applied to code generation, documentation maintenance, data analysis, content localization, and any
workflow where AI can transform inputs into structured outputs.*

---

## Demo 5: Bootstrapping — How Cognotik Builds Itself

**Goal:** Demonstrate the ultimate validation of a tool: using it to maintain, document, and evolve its own codebase.
Cognotik's own development workflow is powered by the same DocProcessor engine and task types that users employ for
their projects.

### The Self-Referential Architecture

Cognotik's `docs/` directory isn't just documentation — it's a **live build system** that uses frontmatter-driven
operations to keep the codebase internally consistent. When a developer modifies a Kotlin source file, the
documentation, product pages, and even review checklists can be automatically regenerated by running the same
DocProcessor pipeline that powers the demos above.
From a security and data sovereignty perspective, this architecture has a notable property: the entire orchestration
runs locally. The DocProcessor engine, the operation files, and all intermediate artifacts stay on the developer's
machine. The only data that leaves the local environment is what gets sent to the LLM provider via the developer's
own API key — and even that can be eliminated entirely by pointing Cognotik at a local model (via Ollama or
LocalAI). The `docs/` directory is simultaneously a build system and an audit trail, version-controlled in Git
alongside the source code it governs.


### The Operations

#### 1. Source → Documentation Sync (`index_docs.md`)

```yaml
---
transforms: ../(.+/src/main/kotlin/.+/)([^\./]+)\.kt -> ../$1/README.md
---
```

This is the same pattern from Demo 1 — applied to Cognotik's own codebase. When the DocProcessor runs:

- It scans all `.kt` files across `core/`, `webui/`, `jo-penai/`, and every other module.
- For each source file (or group of files in the same package), it generates or updates a `README.md` that describes the
  package's purpose, public API, and usage patterns.
- The AI reads the actual source code as context, so the documentation is always grounded in reality — not aspirational.
  **What this means:** Every package in Cognotik has machine-maintained documentation that stays in sync with the code.
  When a developer adds a new `TaskType`, the corresponding package README is updated on the next pipeline run.

#### 2. Source → Product Pages (`task_product_page.md`)

```yaml
---
transforms: ../webui/src/main/kotlin/com/simiacryptus/cognotik/plan/tools/(?:.+/)([^\./]+)\.kt -> ../site/cognotik.com/$1.html
---
```

This transform takes every task implementation file (e.g., `FileModificationTask.kt`, `BrainstormingTask.kt`) and
generates a **user-facing product page** on the Cognotik website. The operation file (`task_product_page.md`) contains
the full "Industrial" design system specification — the Bento Grid layout, the Reality Check component, the tabbed
interface — and the AI uses this specification as its creative brief.

The pipeline:

1. **Reads** the Kotlin source file to extract configuration fields, `@Description` annotations, `promptSegment()` text,
   and execution logic.
2. **Generates** a complete HTML page following the design system: header with badges, input/output split view,
   configuration tables, and integration code blocks.
3. **Writes** the page to the `site/` directory, ready for deployment.
   **What this means:** When a developer ships a new task type, the marketing site updates itself. No separate
   documentation sprint required.

#### 3. Source → Review Standards (`task_type_best_practices.md`)

```yaml
---
specifies: ../webui/src/main/kotlin/com/simiacryptus/cognotik/plan/tools/**/*.kt
---
```

This document doesn't generate output files — it **governs** them. The `specifies` directive tells the DocProcessor that
this standards document is the authoritative specification for all task implementation files. When the pipeline runs in
review mode:

- Each task file is checked against the review checklist (R1–R16).
- Missing `@Description` annotations, unwrapped API clients, unclosed transcript streams, and other violations are
  flagged.
- The AI can automatically generate patches to bring non-compliant files into alignment.

**What this means:** Cognotik's coding standards aren't just a document that developers read — they're an executable
  specification that the AI enforces on every pipeline run.
This is "Compliance-as-Code" in its most literal form. For enterprise environments — particularly regulated industries
like finance, healthcare, and defense — the ability to turn policy documents into executable constraints is
transformative. Instead of a PDF of coding standards that drifts from practice within weeks of publication, you have
a Markdown file that the AI uses to actively flag and fix non-compliant code. The audit trail lives in Git. The
enforcement happens on every run.


#### 4. Model Registry Maintenance (`anthropic_models.md`)

```yaml
---
documents: ../core/src/main/kotlin/com/simiacryptus/cognotik/chat/model/AnthropicModels.kt
specifies: ../core/src/main/kotlin/com/simiacryptus/cognotik/chat/model/AnthropicModels.kt
related:
  - https://platform.claude.com/docs/en/about-claude/pricing
  - https://platform.claude.com/docs/en/about-claude/models/overview
---
```

This operation has both `documents` and `specifies` directives pointing at the same file, plus `related` URLs to
Anthropic's live pricing and model pages. This creates a **bidirectional sync**:

- **Documents direction:** The AI reads `AnthropicModels.kt` and generates documentation describing the available
  models, their token limits, and pricing.
- **Specifies direction:** The AI reads Anthropic's live documentation (via the `related` URLs) and checks whether
  `AnthropicModels.kt` is up to date. If Anthropic has released a new model or changed pricing, the pipeline can
  generate a patch to update the Kotlin enum.
  **What this means:** When Claude releases a new model, Cognotik's model registry can be updated by running the
  pipeline — the AI crawls Anthropic's docs, compares them to the source code, and produces the necessary code changes.

### The Bootstrap Loop

Here's where it gets recursive. The development workflow looks like this:

```
┌──────────────────────────────────────────────────────────────┐
│                    Developer makes a change                  │
│                  (e.g., adds new TaskType)                   │
└───────────────────────────┬──────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────┐
│              DocProcessor Pipeline Runs                      │
│                                                              │
│  1. index_docs.md        → Updates package READMEs           │
│  2. task_product_page.md → Generates/updates product pages   │
│  3. task_type_best_practices.md → Reviews code compliance    │
│  4. anthropic_models.md  → Syncs model registry with APIs    │
└───────────────────────────┬──────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────┐
│             Generated artifacts include:                     │
│                                                              │
│  • Updated docs that describe the new task                   │
│  • A product page for the new task                           │
│  • Review feedback if the task violates standards            │
│  • Patches to fix any detected issues                        │
└───────────────────────────┬──────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────┐
│         Developer reviews and applies patches                │
│         (or autoFix applies them automatically)              │
│                                                              │
│        The patches themselves were generated by              │
│        the same task types being documented.                 │
└──────────────────────────────────────────────────────────────┘
```

The tool that generates `FileModificationTask.html` (the product page) is itself a `FileModification` task. The
standards document that requires `@Description` annotations was enforced by an AI that read those very annotations to
understand what to check. The model registry that lists available AI models was updated by one of those AI models.

### What This Demonstrates

- **Dogfooding at the deepest level:** Cognotik doesn't just use itself for convenience — its development process
  *depends* on its own capabilities. If the DocProcessor breaks, the project's documentation and website stop updating.
- **Executable documentation:** The `docs/` directory is simultaneously human-readable documentation and
  machine-executable build instructions. The same Markdown file that explains the design system to a developer also
  instructs the AI on how to generate product pages.
- **Continuous consistency:** In most projects, documentation drifts from code within days of a release. In Cognotik,
  the drift is detected and corrected on every pipeline run because the documentation *reads the source code* to verify
  itself.
- **The frontmatter schema scales:** The same `transforms`, `specifies`, `documents`, and `related` directives that
  power the puppy research demo and the software factory also power the project's own internal tooling. There's no
  separate "internal" system — it's the same engine all the way down.
- **Trust through transparency:** Because Cognotik's own development is visible in its `docs/` directory, users can
  inspect exactly how the tool maintains itself. The operation files are the proof that the system works — they're not
  demo artifacts, they're production infrastructure.

### How to Run It

1. Clone the Cognotik repository.
2. Make a change to any source file (e.g., add a field to a `TaskExecutionConfig`).
3. Run the DocProcessor on the `docs/` directory.
4. Observe:

- The package README updates to reflect your change.
- The product page regenerates with the new configuration field.
- The review system flags any missing `@Description` annotation.

5. Apply the suggested patches — or enable `autoFix` and let the pipeline handle it.
   You're now using Cognotik to build Cognotik.

---

## The Meta-Pattern: Tools That Maintain Themselves

Demo 5 reveals the architectural insight that ties all the demos together. The puppy research workflow, the software
factory, and the fractal thought engine are all instances of the same pattern: **declarative documents that describe
transformations between files, executed by AI models that read those documents to understand what to do.**

When that pattern is applied to the tool's own source code, something qualitatively different emerges. The documentation
isn't a separate artifact that must be manually synchronized — it's a **live view** of the codebase, regenerated on
demand. The coding standards aren't aspirational guidelines — they're **enforced constraints** checked on every run. The
product website isn't a marketing exercise — it's a **projection** of the source code through a design system template.

This is what "eating your own dog food" looks like when the dog food is an AI orchestration engine: the tool doesn't
just use itself — it *needs* itself to function, and that dependency is the strongest possible guarantee that the tool
actually works.
---
## The Strategic Landscape: Why This Architecture Wins
The demos above are concrete workflows, but they exist within a broader strategic context that's worth making explicit.
The AI tooling market is currently split between two equilibria, and understanding where Cognotik sits — and why —
clarifies what kind of user it's built for.
### Two Equilibria
**The "Hype" Equilibrium:** Users adopt chat-based AI tools; providers offer black-box subscriptions. This is the
path of least resistance. The barrier to entry is low, the experience feels magical, and the provider captures
maximum value through recurring fees and data moats. For casual use — brainstorming, drafting emails, exploratory
questions — this equilibrium is perfectly rational.
**The "Professional" Equilibrium:** Users adopt declarative orchestration with BYOK; providers offer transparent,
open-source platforms. The barrier to entry is higher (you need to understand regex, YAML, and file-system
conventions), but the payoffs compound over time: reproducibility, auditability, cost control, and zero vendor
lock-in. For production workflows — CI/CD integration, documentation pipelines, compliance enforcement, multi-step
research — this equilibrium dominates.
The two equilibria aren't in competition so much as they serve different markets. The chat interface wins on
**convenience**. The declarative interface wins on **professional-grade reliability**. Cognotik isn't trying to
replace your ChatGPT window; it's trying to replace the brittle shell scripts, manual documentation sprints, and
ad-hoc AI integrations that accumulate as technical debt in professional environments.
### The BYOK Advantage
The "Bring Your Own Key" model deserves emphasis because its implications extend beyond cost savings. In the
traditional subscription model, the provider acts as a middleman for compute — you pay a marked-up "convenience fee"
on every token. BYOK removes the middleman entirely. You pay the raw API cost, and you can arbitrage between
providers based on the specific task: cheaper models for README generation, expensive models for strategic analysis,
local models for sensitive data that should never leave your network.
More importantly, BYOK means your orchestration tool and your intelligence provider are **independently
replaceable**. When GPT-5 drops or Anthropic changes pricing, you swap the key, not the workflow. Your operation
files — the actual intellectual property of your AI pipeline — remain untouched. This is the difference between
renting a tool and owning your process.
### The Transparency Premium
In regulated industries — finance, healthcare, defense, government — auditability isn't a nice-to-have; it's a
binary gate. Either the AI's decision-making process is inspectable, or the tool is rejected by legal and compliance
before it reaches a single developer's machine. Cognotik's architecture — open-source engine, filesystem-as-state,
Git-versioned operation files, visible AI actions in the UI — satisfies this requirement by construction, not by
promise.
For organizations operating under these constraints, the "Hype" equilibrium isn't just suboptimal; it's
inaccessible. The only viable path to AI adoption runs through transparency, and Cognotik is built for that path.
### The Honest Trade-offs
None of this comes free. Cognotik's architecture introduces trade-offs that are worth stating plainly:
- **The skill floor is real.** Regex, YAML frontmatter, and file-system conventions are not difficult, but they're
  not zero either. Non-technical team members will need support or starter templates to get productive.
- **LLMs are stochastic.** Traditional build systems are deterministic — same input, same output. An LLM-powered
  build system is probabilistic. A `Patch` operation that works today might produce a slightly different result
  tomorrow. The `Patch` and `Skip` overwrite modes exist to manage this, but the fundamental non-determinism is
  inherent to the technology.
- **Execution tasks carry risk.** `RunShellCommandTask` and `RunCodeTask` are powerful, but they're also authorized
  code execution driven by a probabilistic model. In production environments, these should be sandboxed (Docker,
  restricted VMs) and gated behind human approval until trust is established.
- **The "average" trap.** AI models are trained on the aggregate of the internet. For standard CRUD applications and
  common patterns, this produces excellent results. For novel, high-performance, or domain-specific architectures,
  the AI's "default" choices may be mediocre. The more unusual your requirements, the more precise your operation
  files need to be — and the more carefully you need to review the output.
These aren't reasons to avoid the tool. They're reasons to use it with the same engineering discipline you'd apply
to any powerful system. The demos above are designed to illustrate not just what Cognotik can do, but how to do it
responsibly — with `Patch` mode as the default, human review as the norm, and transparency as the foundation.