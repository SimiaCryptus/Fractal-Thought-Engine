# DocOps: AI-Powered Content Pipeline

## Overview

This repository defines a **document operations pipeline** — a collection of declarative operator files that orchestrate
AI-driven content transformation workflows. Each operator is a lightweight markdown file with YAML frontmatter that
describes *what* to do, *where* to find inputs, and *where* to put outputs. Together, they form a composable, extensible
system for turning raw ideas into polished, multi-format publications.

The underlying engine is **DocProcessor**, a frontmatter-driven build system that resolves file dependencies, matches
source files via regex transforms, and dispatches work to specialized AI task types. Think of it as a `Makefile` for AI
content generation — but instead of compiling code, it compiles *thought*.

---

## How It Works

### The Core Concept

Each `.md` file in the `docs/` directory is an **operator definition**. An operator declares:

1. **A transform pattern** — a regex mapping from input files to output files (e.g., `content.md → comic.md`)
2. **A task type** — the kind of AI processing to apply (e.g., `ComicBookGeneration`, `SocraticDialogue`)
3. **Instructions** — optional markdown body text that provides additional guidance to the AI

When the pipeline runs, DocProcessor scans for source files matching the input patterns, pairs them with their output
targets, checks whether outputs are stale, and dispatches AI tasks to generate or update the results.

### The Transform Pattern

```yaml
transforms: (.+)/content\.md -> $1/comic.md
```

This is the heart of each operator. It says: *"For every `content.md` file found anywhere in the directory tree, produce
a sibling `comic.md` in the same directory."* The regex capture groups (`$1`, `$2`, etc.) allow flexible path rewriting,
enabling operators to work across any number of content directories without hardcoding paths.

### Task Types

Task types determine the AI's *mode of engagement* with the content. They aren't just prompt templates — they represent
fundamentally different cognitive strategies:

| Task Type                   | Purpose                                   |
|-----------------------------|-------------------------------------------|
| `IterativeFileModification` | Careful, incremental writing and editing  |
| `ComicBookGeneration`       | Visual storytelling adaptation            |
| `NarrativeGeneration`       | Dramatic prose and fiction                |
| `SocraticDialogue`          | Exploratory question-and-answer format    |
| `DialecticalReasoning`      | Thesis-antithesis-synthesis analysis      |
| `GameTheory`                | Strategic and decision-theoretic framing  |
| `MultiPerspectiveAnalysis`  | Multiple viewpoint examination            |
| `PersuasiveEssay`           | Argumentative and rhetorical writing      |
| `ProbabilisticReasoning`    | Uncertainty-aware analysis                |
| `FiniteStateMachine`        | State-based system modeling               |
| `SoftwareDesignDocument`    | Technical architecture documentation      |
| `TutorialGeneration`        | Educational step-by-step content          |
| `GenerateImage`             | Visual asset creation                     |
| `ImageVariation`            | Image-to-image transformation             |
| `IllustrateDocument`        | Inline illustration of existing documents |
| `CounterfactualAnalysisTask`| Alternative-outcome scenario analysis     |
| `GeneticOptimizationTask`   | Evolutionary optimization framing         |
| `MathematicalReasoningTask` | Formal mathematical analysis              |
| `BrainstormingTask`         | Divergent idea generation                 |
| `Interactive`               | Branching, reader-driven experiences      |
| `Scriptwriting`             | Screenplay and stage script adaptation    |
| `TechnicalExplanation`      | Precise, in-depth technical breakdowns    |

---

## The Content Lifecycle

The operators define a multi-stage pipeline that mirrors a real editorial workflow. Content flows through distinct
phases, each handled by different operators:

### Phase 1: Capture & Distill

Raw material enters the system as unstructured notes — voice transcripts, brainstorm dumps, meeting recordings, or
freeform writing — landing in `scratch/` directories as `notes.*` files.

**`summarize_op`** picks up these raw notes and produces a thematic summary. This isn't a chronological recap; it's a
conceptual distillation that extracts key ideas, identifies patterns, and organizes insights into a structured outline.
If a `content.md` already exists, the summarizer compares it against the canonical notes to surface any missing
insights.

### Phase 2: Plan

**`instruct_op`** takes the summary and produces a *plan for the plan* — a structural blueprint that identifies the
target audience, core message, and value proposition. It deliberately stops short of writing the actual piece, creating
a reviewable checkpoint where a human can steer direction before committing to a full draft.

### Phase 3: Draft

**`draft_article_op`** consumes the instructions (or summary, or raw notes) and produces a complete `content.md` — a
polished, coherent article or essay. This is the canonical content artifact that all downstream operators build from.

### Phase 4: Analyze & Enrich

Once a `content.md` exists, a constellation of analytical operators can process it in parallel, each producing a
different lens on the same material:

- **`dialectical_op`** — Examines the content through thesis/antithesis/synthesis
- **`gametheory_op`** — Applies strategic and decision-theoretic frameworks
- **`perspectives_op`** — Presents the content from multiple stakeholder viewpoints
- **`persuasive_op`** — Reframes the content as a compelling argument
- **`probablistic_op`** — Introduces uncertainty quantification and probabilistic reasoning
- **`socratic_op`** — Transforms the content into an exploratory dialogue
- **`statemachine_op`** — Models the content's dynamics as state transitions
- **`softwaredesign_op`** — Extracts technical architecture implications
- **`tutorial_op`** — Restructures the content as a learning pathway

These aren't just reformattings — they're genuinely different *modes of thinking* applied to the same source material.
The dialectical analysis might surface contradictions the original author missed. The game theory lens might reveal
hidden strategic dynamics. The Socratic dialogue might expose unstated assumptions.

### Phase 5: Adapt & Visualize

Another set of operators transforms content into different media formats:

- **`comic_op`** — Generates a comic book adaptation
- **`narrative_op`** — Creates a dramatized narrative version (with illustrations)
- **`icon_op`** — Produces a representative image for the article
- **`icon_variant_op`** — Creates HTML variations from generated images
- **`illustration_op`** — Adds inline illustrations to existing content

### Phase 6: Iterate & Converge

**`update_article_op`** closes the loop. It takes the original `content.md` along with *any* of the analytical or
creative derivatives — the dialectical analysis, the game theory breakdown, the narrative adaptation, even raw notes —
and folds their insights back into the canonical content. This creates a feedback cycle where each analytical lens can
improve the source material.

**`comic_seq_op`** and **`narrative_seq_op`** demonstrate another iteration pattern: they consume outputs from
previous generation runs (JSON for comics, Markdown for narratives) to produce sequels, enabling serialized storytelling.

### Phase 7: Publish

**`frontmatter_op`** generates rich YAML frontmatter for the final content, producing the metadata needed for a dynamic
site architecture — SEO tags, content classification, reading difficulty, navigation hints, schema.org structured data,
and more.
**`import-posts.js`** assembles the final Jekyll posts from the content directory. During assembly, it automatically
enriches frontmatter with metadata about which content variants were integrated:
- **`content_formats`** — An auto-generated list of content format IDs (e.g., `["article", "comic", "gametheory"]`)
  reflecting which operator outputs were present and assembled into the tabbed post.
- **Auto-tags** — Tags are automatically augmented based on included formats. For example, if a `comic.md` was found,
  `Creative-Writing` is added to the tags array; if `gametheory.md` was found, `Game-Theory` is added. These are merged
  with any existing tags from `frontmatter.yaml` without overwriting manual curation.
#### Format-to-Tag Mapping
| Content Format       | Auto-Added Tag              |
|----------------------|-----------------------------|
| `comic`              | Creative-Writing            |
| `narrative`          | Creative-Writing            |
| `gametheory`         | Game-Theory                 |
| `socratic`           | Philosophy-of-Mind          |
| `perspectives`       | Multi-Perspective-Analysis  |
| `dialectical`        | Theoretical-Framework       |
| `persuasive`         | Persuasive-Essay            |
| `statemachine`       | Computational-Analysis      |
| `design`             | Software-Design             |
| `tutorial`           | Tutorial                    |
| `interactive`        | Interactive-Experience      |
| `script`             | Creative-Writing            |
| `technical_explanation` | Technical-Documentation  |

This ensures that published posts carry accurate metadata about their content composition without requiring manual
bookkeeping.

---

## Architecture Principles

### Declarative & Composable

Each operator is a standalone declaration. Operators don't know about each other — they only know their input pattern
and output target. The pipeline emerges from the *overlap* of these patterns: one operator's output matches another
operator's input. This makes the system trivially extensible; adding a new analytical lens is just adding a new `.md`
file.

### Convention Over Configuration

The directory structure *is* the configuration. Content lives in topic directories. Each directory accumulates artifacts
as operators process its `content.md`. There's no central manifest or build file — the regex patterns and file system do
the routing.

### Human-in-the-Loop

The pipeline is designed for human oversight at key junctures. The `instruct_op` creates an explicit planning
checkpoint. The `update_article_op` requires a human to decide which analytical outputs to feed back. The DocProcessor's
overwrite modes (`SkipExisting`, `PatchExisting`, etc.) give fine-grained control over what gets regenerated versus
preserved.

### Idempotent & Incremental

Operators can be re-run safely. The `PatchToUpdate` default mode means outputs are only regenerated when inputs are
newer than outputs, and updates are applied as patches rather than full replacements — preserving any manual edits while
incorporating new insights.

### Multi-Modal

The pipeline doesn't just produce text. Image generation, comic book creation, and illustration operators treat visual
assets as first-class outputs, enabling rich multimedia publications from a single source of truth.

---

## Directory Structure

```
scratch/                          # Raw input material
  topic-name/
    notes.md                      # Raw notes, transcripts, brainstorms
    summary.md                    # ← summarize_op
    instruct.md                   # ← instruct_op
    content.md                    # ← draft_article_op (Drafts live here until promoted)

content/                          # Published content (Manually promoted from scratch)
  topic-name/
    content.md                    # Canonical article
    frontmatter.yaml              # ← frontmatter_op
    dialectical.md                # ← dialectical_op
    gametheory.md                 # ← gametheory_op
    perspectives.md               # ← perspectives_op
    persuasive.md                 # ← persuasive_op
    probablistic.md               # ← probablistic_op
    socratic.md                   # ← socratic_op
    statemachine.md               # ← statemachine_op
    design.md                     # ← softwaredesign_op
    tutorial.md                   # ← tutorial_op
    comic.md                      # ← comic_op
    narrative.md                  # ← narrative_op
    counterfactual.md             # ← counterfactual_op
    genetic.md                    # ← genetic_op
    mathematical.md               # ← mathematical_op
    brainstorm.md                 # ← brainstorm_op
    main.png                      # ← icon_op
    main.html                     # ← icon_variant_op

docs/                             # Operator definitions (this directory)
  summarize_op.md
  instruct_op.md
  draft_article_op.md
  update_article_op.md
  frontmatter_op.md
  dialectical_op.md
  ...
```

---

## Creating New Operators

Adding a new operator is straightforward. Create a markdown file with frontmatter:

```markdown
---
transforms: (.+)/content\.md -> $1/my_analysis.md
task_type: MyTaskType
---

* Specific instructions for the AI
* What to focus on
* What format to produce
```

The transform pattern determines routing. The task type determines the AI's cognitive strategy. The markdown body
provides domain-specific guidance. That's it — the pipeline will automatically pick up any matching content files on the
next run.

---

## Design Philosophy

This system embodies a particular philosophy about AI-assisted content creation:

1. **Thinking is multi-modal.** A single idea benefits from being examined through dialectical reasoning, game theory,
   narrative drama, and visual representation. Each lens reveals something the others miss.

2. **Writing is iterative.** The pipeline doesn't try to produce perfect output in one pass. It captures, distills,
   plans, drafts, analyzes, and converges — with human review at each stage.

3. **Structure enables creativity.** The rigid operator format and regex routing might seem constraining, but they free
   the AI to focus entirely on the creative task at hand, while the system handles orchestration.

4. **Source material is sacred.** Raw notes are never modified. The canonical `content.md` is updated through patches,
   not replacements. Every analytical derivative is preserved alongside the original, creating a rich archaeological
   record of how ideas evolved.