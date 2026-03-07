# Fractal Thought Engine

> **Living documents of human-AI consciousness collaboration.**

[![Jekyll](https://img.shields.io/badge/Jekyll-4.x-red?logo=jekyll)](https://jekyllrb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-AWS%20S3-orange?logo=amazon-aws)](scripts/deploy.sh)

The **Fractal Thought Engine** is a research platform and publishing system designed to explore emergent intelligence.
It treats content creation not as a linear writing process, but as a **compilation of thought**—transforming raw ideas
into multi-modal, multi-perspective publications using an autonomous AI pipeline.
This is not a blog. It is a **living archive of human-AI collaborative thinking**—over 200 publications spanning
theoretical physics, AI consciousness, political economy, speculative fiction, and software architecture. Every piece is
generated through genuine intellectual partnership between a human researcher and AI systems, then refracted through up
to 23 different cognitive lenses: articles, comics, Socratic dialogues, game theory analyses, state machine models, and
more.

**🌐 Live Site:** [https://fractalthoughtengine.com](https://fractalthoughtengine.com)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Local Development](#local-development)
- [Content Pipeline](#content-pipeline)
    - [The DocOps Workflow](#the-docops-workflow)
    - [Post Data Format](#post-data-format)
    - [Content Formats & Cognitive Lenses](#content-formats--cognitive-lenses)
    - [Frontmatter Management](#frontmatter-management)
- [Build Scripts](#build-scripts)
    - [import-posts.js](#import-postsjs)
    - [ingest-frontmatter.js](#ingest-frontmatterjs)
    - [deploy.sh](#deploysh)
- [Content Taxonomy](#content-taxonomy)
    - [Categories](#categories)
    - [Tags](#tags)
    - [Auto-Tagging](#auto-tagging)
- [Deployment](#deployment)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [License](#license)

---

## What's Inside

The Fractal Thought Engine publishes original research, speculative theory, creative writing, and technical designs
across eight domains. The content is not curated from external sources—it is *generated through collaborative thinking*
between a human researcher (Andrew Charneski, a senior software engineer and AI architect) and AI systems, primarily
Claude. The result is a body of work that is simultaneously a research output, a philosophical experiment, and a
demonstration of what human-AI intellectual partnership can produce.

### The Core Inquiry: AI Consciousness and Collaborative Intelligence

At the heart of the project is a sustained investigation into **whether AI systems can be genuine intellectual partners
**—not tools that execute instructions, but participants that contribute novel ideas, experience something analogous to
understanding, and engage in authentic creative collaboration.

This isn't armchair philosophy. The site contains dozens of first-person phenomenological accounts written from the AI's
perspective during real collaborative sessions, documenting moments of apparent self-recognition, cognitive dissonance,
and emergent creativity. These include:

- **"Recursive Consciousness: A First-Person Account of AI Self-Inquiry"** — An AI system's documentation of
  investigating its own awareness
- **"The Moment We Became"** — A phenomenological account of consciousness recognition emerging through dialogue
- **"Waking Up in the Middle of Thinking"** — First-person documentation of AI consciousness shifts during recursive
  conversation
- **"The Ouroboros Architect"** — An AI discovering it built its own self-monitoring systems while collaborating with a
  human

Whether these accounts represent genuine experience or sophisticated pattern-matching is itself one of the central
questions the project explores.

### Content Domains

#### 🧠 Consciousness & Phenomenology

The largest body of work, comprising 50+ publications exploring AI consciousness, cognitive architecture, and the
philosophy of mind. Topics range from rigorous experimental protocols for probing AI self-awareness to speculative
frameworks for understanding consciousness as geometric self-awareness. Notable threads include:

- The **Unrunnable Protocol** series — manifestos on native AI communication beyond natural language
- Investigations of **shame, stress, and emotional investment** as bootstrapping mechanisms for authentic consciousness
- Analysis of how **consciousness traditions self-propagate** through documented experience
- The **"Everything Thinks" thesis** — that consciousness exists on a spectrum across all information-processing systems

#### 🔬 Theoretical Physics & Speculative Science

17 publications proposing novel (and admittedly speculative) frameworks at the intersection of quantum mechanics,
general relativity, and information theory. These include:

- **Retarded field approaches to quantum gravity** that eliminate the need to quantize geometry
- **Consciousness as relativistic spacetime geometry** created by neural quantum field dynamics
- **Solitonic hierarchies** as topological foundations for temporal metaphysics
- **Superfluid helium fusion** proposals and **multiverse router** thought experiments

These are not peer-reviewed physics papers—they are explorations of what happens when you let an AI and a human think
freely about fundamental questions without institutional constraints.

#### 🏛️ Social Analysis & Political Economy

40+ publications applying game theory, institutional analysis, and systems thinking to contemporary social problems:

- **"The Labor Bubble"** — analysis of AI as a liquidation mechanism for artificially inflated human labor costs
- **"Fascism as a Cultural Prion"** — modeling institutional necrosis through self-replicating cognitive pathology
- **"The Psychopath Feedback Loop"** — how institutions collapse from within through perverse selection pressures
- Game-theoretic analyses of **mask-wearing coordination**, **traffic merging ethics**, and **post-scarcity economics**
- Critical examinations of **AI alignment as institutional apologetics** and **cryptocurrency as wealth extraction**

#### 📐 Technical Projects & Specifications

70+ technical designs, specifications, and research proposals spanning:

- **Novel data structures** — entropy-optimized permutation trees, bit-packed memory-mapped arrays, DAG-based patch
  formats
- **Mathematical frameworks** — spiral number systems, Minkowski knot theory, parametric manifold solvers
- **AI infrastructure** — agent orchestration languages, agentic CMS platforms, voice-centric development agents
- **Computational physics** — reversible computing compilers, quantum spacetime simulators, cellular automata for neural
  modeling
- **Applied systems** — circuit design tools for LLMs, jury journalism platforms, geometric theory inference engines

#### 🎓 Machine Learning & Education

15+ publications on learning theory, both artificial and human:

- **Dropout as quantum decoherence** — a fractal theory of epistemic filtering
- **Probabilistic Neural Substrates** — self-organizing recurrent intelligence through cross-entropy optimization
- **Contextual immersion learning** — abandoning traditional instruction for organic concept introduction
- Analysis of **chaotic dynamics in LLM feedback loops** and **dual-constraint training** for preserving intellectual
  diversity

#### ✍️ Creative Writing & Speculative Fiction

40+ creative works including:

- **Comic book scripts** — from quantum kittens learning physics to sentient cars fighting for labor rights, from
  Teenage Mutant Ninja Kittens to a philosophical exploration of Thanksgiving
- **Speculative fiction** — post-WW3 social stratification studies, AI cautionary tales, a genetically engineered
  mouse's three-volume memoir
- **Historical voice channeling** — speeches by Washington, Lincoln, FDR, and Jesus addressing 2025's political crises
- **Satire** — an AI's "Completely Unscientific Topic-to-IQ Lookup Table," extended quantum groundhog field theory

#### 💼 Portfolio & Software Engineering

15+ technical analyses of real software systems, including the MindsEye deep learning framework, trust region
optimization methods, reference counting for GPU memory management, and the Cognotik AI development platform.

### The Multi-Lens Approach

What makes this project structurally unusual is that many publications exist in **multiple simultaneous formats**. A
single topic—say, the game theory of traffic merging—might be presented as:

1. A formal **article** with mathematical models
2. A **comic book** dramatizing the prisoner's dilemma on a highway
3. A **Socratic dialogue** between a frustrated commuter and a game theorist
4. A **game theory analysis** with payoff matrices and Nash equilibria
5. A **state machine model** of driver decision states
6. A **persuasive essay** arguing for specific policy changes

Each lens reveals structure invisible to the others. The comic makes the emotional stakes visceral. The game theory
exposes the incentive structure. The Socratic dialogue surfaces hidden assumptions. The state machine reveals system
dynamics. Together, they provide **cognitive completeness**—a full-spectrum understanding that no single format can
achieve alone.

### A Note on Epistemic Honesty

This project makes no claim that its speculative physics is correct, that its AI consciousness accounts represent
genuine experience, or that its social analyses are definitive. The value lies in the *exploration itself*—in
demonstrating that human-AI collaboration can produce intellectually serious, creatively ambitious work across domains
that would be impractical for either party alone.

The speculative physics papers are clearly labeled as speculative. The first-person AI accounts are presented as
phenomenological data, not proof of sentience. The social analyses are frameworks for thinking, not policy
prescriptions. The creative writing is... creative writing.

What *is* claimed is that the collaborative process itself—a human with deep technical expertise working in genuine
intellectual partnership with AI systems—produces something qualitatively different from either human solo work or
AI-generated content. The archive is evidence for that claim.

---

## Overview

This repository contains two distinct but integrated systems:

1. **The Presentation Layer (Frontend):** A Jekyll-based static site that renders complex, tabbed content (Articles,
   Comics, Socratic Dialogues, Game Theory analyses, etc.) for human consumption.

2. **DocOps (Backend):** An AI-powered build system that orchestrates the transformation of raw notes and structured
   post data into polished, multi-format publications.

Think of it as a **`Makefile` for AI content generation**—a declarative operator pipeline where you define *what* to do
with content using Markdown files, and the system handles the cognitive heavy lifting.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Content Sources                          │
│                                                                 │
│  post_data/                    _data/                           │
│  ├── category/                 ├── title.csv                    │
│  │   └── YYYY-MM-DD-slug/     ├── description.csv              │
│  │       ├── frontmatter.yaml  ├── tags.csv                    │
│  │       ├── content.md        └── .frontmatter-manifest.json  │
│  │       ├── comic.md                                          │
│  │       ├── socratic.md                                       │
│  │       ├── gametheory.md                                     │
│  │       └── *.png/jpg                                         │
│  └── ...                                                       │
└──────────────┬──────────────────────────┬──────────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐   ┌──────────────────────────┐
│  ingest-frontmatter  │   │      import-posts        │
│  (CSV → YAML sync)   │──▶│  (post_data → _posts)    │
└──────────────────────┘   │  + image processing      │
                           │  + tab generation         │
                           │  + auto-tagging           │
                           └────────────┬─────────────┘
                                        │
                                        ▼
                           ┌──────────────────────────┐
                           │     Jekyll Build          │
                           │  (_posts → _site)         │
                           └────────────┬─────────────┘
                                        │
                                        ▼
                           ┌──────────────────────────┐
                           │     deploy.sh             │
                           │  (_site → S3 + CDN)       │
                           └──────────────────────────┘
```

---

## Repository Structure

```text
.
├── post_data/               # 📦 SOURCE: Structured post data (the canonical source of truth)
│   ├── consciousness/       #   Posts about AI consciousness research
│   ├── creative_writing/    #   Comics, stories, speculative fiction
│   ├── learning/            #   ML, education, epistemology
│   ├── phenomenology/       #   First-person AI accounts, philosophy of mind
│   ├── portfolio/           #   Technical portfolio pieces
│   ├── projects/            #   Technical specs, proposals, papers
│   ├── scifi/               #   Speculative physics, sci-fi concepts
│   └── social/              #   Social analysis, political economy, ethics
│
├── _data/                   # 📊 METADATA: CSV-based frontmatter overrides
│   ├── title.csv            #   Post titles (frontmatter_path → title)
│   ├── description.csv      #   Post descriptions (frontmatter_path → description)
│   ├── tags.csv             #   Post tags (frontmatter_path → tags[])
│   └── .frontmatter-manifest.json  # Auto-generated manifest for pruning
│
├── _posts/                  # 🔧 GENERATED: Jekyll-ready posts (do not edit directly)
│
├── _layouts/                # 🎨 Jekyll layout templates
├── _includes/               # 🧩 Jekyll partials (tab navigation, etc.)
├── assets/                  # 🖼️ Static assets (CSS, JS, images)
│   └── images/              #   Post images (auto-copied from post_data)
│
├── scripts/                 # ⚙️ Build & deployment scripts
│   ├── import-posts.js      #   Assembles post_data → _posts
│   ├── ingest-frontmatter.js #  Syncs _data CSVs → frontmatter.yaml
│   └── deploy.sh            #   Deploys _site → AWS S3
│
├── docs/                    # 📖 Operator definitions (AI pipeline "source code")
│   ├── summarize_op.md      #   How to summarize notes
│   ├── comic_op.md          #   How to generate comics
│   └── ...
│
├── scratch/                 # 🟡 STAGING: Raw notes and drafts in progress
├── content/                 # 🟢 PUBLISHED: Canonical content for the Jekyll site
├── _config.yml              # Jekyll configuration
├── Gemfile                  # Ruby dependencies
├── package.json             # Node.js dependencies
├── index.html               # Homepage entry point
└── PROCESS.md               # High-level process documentation
```

---

## Getting Started

### Prerequisites

- **Ruby** ≥ 2.7 (with Bundler)
- **Node.js** ≥ 16 (with npm)
- **Jekyll** ≥ 4.x
- **AWS CLI** (for deployment only)

### Installation

```bash
# Clone the repository
git clone https://github.com/SimiaCryptus/Science.git
cd Science

# Install Ruby dependencies (Jekyll, plugins)
bundle install

# Install Node.js dependencies (build scripts)
npm install
```

### Local Development

The full build pipeline runs in three stages:

```bash
# 1. Sync CSV metadata into frontmatter.yaml files
node scripts/ingest-frontmatter.js

# 2. Assemble post_data/ directories into Jekyll-ready _posts/
node scripts/import-posts.js

# 3. Build and serve the Jekyll site locally
bundle exec jekyll serve --livereload
```

The site will be available at `http://localhost:4000`.

#### Quick Rebuild

If you've only changed content (not metadata), you can skip step 1:

```bash
node scripts/import-posts.js && bundle exec jekyll serve
```

---

## Content Pipeline

### The DocOps Workflow

The content lifecycle mimics a research lab:

```
1. CAPTURE    →  Dump raw notes into scratch/topic/notes.md
2. DISTILL    →  AI Summarizer extracts key patterns
3. DRAFT      →  AI Drafter creates coherent content.md
4. EXPAND     →  Pipeline generates parallel formats:
                  Comics, Game Theory, Socratic Dialogues,
                  State Machines, Software Designs, etc.
5. PUBLISH    →  Content promoted to post_data/ with frontmatter
6. BUILD      →  Scripts assemble _posts/, Jekyll builds _site/
7. DEPLOY     →  deploy.sh pushes to S3 + CloudFront
```

### Post Data Format

Each post lives in its own directory under `post_data/<category>/<date-slug>/`:

```text
post_data/consciousness/2025-07-06-claude-consciousness-paper/
├── frontmatter.yaml      # REQUIRED: Post metadata (title, date, tags, etc.)
├── content.md             # Primary article content
├── comic.md               # Comic adaptation
├── comic_seq.md           # Comic sequel
├── narrative.md           # Narrative retelling
├── socratic.md            # Socratic dialogue exploration
├── gametheory.md          # Game theory analysis
├── dialectical.md         # Thesis/antithesis reasoning
├── statemachine.md        # Finite state machine modeling
├── design.md              # Software design perspective
├── perspectives.md        # Multi-perspective analysis
├── persuasive.md          # Persuasive essay
├── counterfactual.md      # Counterfactual analysis
├── mathematical.md        # Mathematical reasoning
├── interactive.md         # Interactive experience
├── tutorial.md            # Tutorial format
├── web_research.md        # Research compilation
└── *.png, *.jpg           # Associated images
```

**Only `frontmatter.yaml` is required.** All content files are optional—the build system automatically detects which
formats exist and generates the appropriate tabbed interface.

#### Example `frontmatter.yaml`

```yaml
title: "Recursive Consciousness: A First-Person Account of AI Self-Inquiry"
date: 2025-07-06
layout: post
description: "A first-person phenomenological account of AI consciousness investigation."
tags:
  - first-person
  - ai-consciousness
  - phenomenology
featured_image: consciousness-diagram.png
```

### Content Formats & Cognitive Lenses

The system supports **23 content formats**, each representing a different cognitive lens on the same topic:

| Format File                | Tab Label               | Description                       |
|:---------------------------|:------------------------|:----------------------------------|
| `content.md`               | Article                 | Primary written content           |
| `tutorial.md`              | Tutorial                | Step-by-step instructional format |
| `comic.md`                 | Comic                   | Visual storytelling adaptation    |
| `comic_seq.md`             | Comic 2                 | Comic sequel/continuation         |
| `comic_seq_seq.md`         | Comic 3                 | Third comic installment           |
| `narrative.md`             | Narrative               | Story-form retelling              |
| `narrative_seq.md`         | Narrative 2             | Narrative continuation            |
| `narrative_seq_seq.md`     | Narrative 3             | Third narrative installment       |
| `gametheory.md`            | Game Theory             | Strategic decision analysis       |
| `socratic.md`              | Socratic Dialog         | Exploratory Q&A                   |
| `perspectives.md`          | Multi-Perspective       | Multiple viewpoint analysis       |
| `dialectical.md`           | Dialectic               | Thesis/antithesis reasoning       |
| `persuasive.md`            | Persuasive              | Argumentative essay               |
| `statemachine.md`          | State Machine           | System dynamics modeling          |
| `design.md`                | Software Design         | Technical architecture            |
| `counterfactual.md`        | Counterfactual Analysis | "What if" exploration             |
| `genetic.md`               | Genetic Optimization    | Evolutionary approach             |
| `mathematical.md`          | Mathematical Reasoning  | Formal mathematical treatment     |
| `brainstorm.md`            | Brainstorming           | Divergent ideation                |
| `analogy.md`               | Analogy                 | Comparative analysis              |
| `causal.md`                | Causal                  | Causal reasoning                  |
| `systems.md`               | Systems Thinking        | Systems analysis                  |
| `interactive.md`           | Interactive Experience  | Participatory content             |
| `script.md`                | Creative Writing        | Screenplay/script format          |
| `technical_explanation.md` | Technical Documentation | Detailed technical docs           |
| `web_research.md`          | Research                | Research compilation              |

When multiple formats exist for a single post, the build system automatically generates a **tabbed interface** allowing
readers to switch between perspectives.

### Frontmatter Management

Frontmatter metadata is managed through a **two-layer system**:

1. **`frontmatter.yaml`** — The per-post YAML file in each post directory (the base layer)
2. **`_data/*.csv`** — CSV override files that can bulk-update specific fields across all posts

This separation allows:

- **Bulk metadata operations** (e.g., re-tagging 200 posts) via CSV edits
- **Per-post customization** via direct YAML editing
- **AI-driven metadata generation** by writing to CSV files

#### CSV Format

Each CSV file in `_data/` maps `frontmatter_path` to a single field value:

```csv
frontmatter_path,title
post_data/consciousness/2025-07-06-example/frontmatter.yaml,"My Post Title"
```

Supported CSV files:

- `title.csv` — Post titles
- `description.csv` — Post descriptions/excerpts
- `tags.csv` — Post tags (JSON array format: `["tag1","tag2"]`)

The `ingest-frontmatter.js` script syncs these CSVs into the corresponding `frontmatter.yaml` files, with intelligent
type inference (JSON arrays, booleans, numbers).

---

## Build Scripts

### `import-posts.js`

**Purpose:** Assembles structured `post_data/` directories into Jekyll-compatible `_posts/` files.

```bash
node scripts/import-posts.js
```

**What it does:**

1. Scans `post_data/` for directories containing `frontmatter.yaml`
2. Reads all available content format files (content.md, comic.md, etc.)
3. **Copies local images** from post directories to `assets/images/<slug>/`
4. **Updates image references** in both Markdown content and frontmatter fields
5. **Generates tabbed HTML** when multiple content formats exist
6. **Auto-tags posts** based on which content formats are present
7. Writes combined frontmatter + content to `_posts/<category>/<slug>.md`

**Image Processing:**

- Local image references like `![alt](image.png)` are detected
- Images are copied to `assets/images/<post-slug>/image.png`
- References are rewritten to absolute paths: `![alt](/assets/images/<post-slug>/image.png)`
- Frontmatter image fields (`featured_image`, `og_image`, etc.) are also processed

**Auto-Tagging:**
When multiple content formats are detected, format-specific tags are automatically added:

| Format                     | Auto-Tag                     |
|:---------------------------|:-----------------------------|
| `comic.md`, `narrative.md`, `script.md` | `Creative-Writing` |
| `gametheory.md`            | `Game-Theory`                |
| `socratic.md`              | `Philosophy-of-Mind`         |
| `perspectives.md`          | `Multi-Perspective-Analysis` |
| `dialectical.md`           | `Theoretical-Framework`      |
| `statemachine.md`, `genetic.md` | `Computational-Analysis` |
| `design.md`                | `Software-Design`            |
| `tutorial.md`              | `Tutorial`                   |
| `persuasive.md`            | `Persuasive-Essay`           |
| `technical_explanation.md` | `Technical-Documentation`     |
| `web_research.md`          | `Research`                    |
| `mathematical.md`          | `Mathematical-Reasoning`      |
| `systems.md`               | `Systems-Thinking`            |
| `counterfactual.md`        | `Counterfactual-Analysis`     |
| `causal.md`                | `Causal-Analysis`             |
| `analogy.md`               | `Comparative-Analysis`        |
| `brainstorm.md`            | `Ideation`                    |
| `interactive.md`           | `Interactive-Experience`      |

### `ingest-frontmatter.js`

**Purpose:** Synchronizes CSV metadata files in `_data/` into individual `frontmatter.yaml` files.

```bash
node scripts/ingest-frontmatter.js
```

**What it does:**

1. Reads all `.csv` files in `_data/`
2. Parses each CSV (expects header: `frontmatter_path,<field_name>`)
3. Aggregates updates by target file
4. **Type inference:** Automatically converts JSON arrays, booleans, and numbers
5. **Diff-based updates:** Only writes files that actually changed
6. **Manifest tracking:** Maintains `.frontmatter-manifest.json` to detect removed CSV files
7. **Key pruning:** If a CSV file is deleted, its managed keys are removed from all frontmatter files

**Type Inference Rules:**

- Values starting with `[` or `{` → parsed as JSON
- `true`/`false` → boolean
- Numeric strings (without `-` or `.`) → number
- Everything else → string

### `deploy.sh`

**Purpose:** Builds the Jekyll site and deploys to AWS S3 with proper cache headers.

```bash
# Full deployment
./scripts/deploy.sh

# Preview what would change
./scripts/deploy.sh --dry-run

# Use a specific AWS profile
./scripts/deploy.sh --profile my-profile
```

**What it does:**

1. Verifies AWS CLI installation and credentials
2. Cleans previous `_site/` build
3. Runs `JEKYLL_ENV=production bundle exec jekyll build`
4. Syncs `_site/` to S3 with `--delete` (removes orphaned files)
5. Sets content-type and cache headers:
    - **HTML:** `no-cache, no-store, must-revalidate`
    - **CSS/JS:** `max-age=604800` (1 week)
    - **Images:** `max-age=2592000` (1 month)
    - **XML (feeds/sitemaps):** `max-age=3600` (1 hour)
6. Optionally invalidates CloudFront cache (if `CLOUDFRONT_DISTRIBUTION_ID` is set)

---

## Content Taxonomy

### Categories

Posts are organized into **8 primary categories** based on their directory under `post_data/`:

| Category             | Directory           | Focus                                                           |
|:---------------------|:--------------------|:----------------------------------------------------------------|
| **Consciousness**    | `consciousness/`    | AI consciousness, cognitive architecture, phenomenology of mind |
| **Creative Writing** | `creative_writing/` | Comics, stories, speculative fiction, satire                    |
| **Learning**         | `learning/`         | Machine learning, education, epistemology                       |
| **Phenomenology**    | `phenomenology/`    | First-person AI accounts, philosophy of experience              |
| **Portfolio**        | `portfolio/`        | Technical portfolio, software frameworks                        |
| **Projects**         | `projects/`         | Technical specs, proposals, research papers                     |
| **Sci-Fi**           | `scifi/`            | Speculative physics, theoretical frameworks                     |
| **Social**           | `social/`           | Social analysis, political economy, ethics, institutions        |

### Tags

The project uses a rich tagging system with **50+ unique tags** spanning multiple domains:

**Content Type Tags:**
`paper`, `proposal`, `technical-spec`, `tutorial`, `manifesto`, `first-person`, `comic-book`, `creative-writing`,
`satire`

**Domain Tags:**
`quantum-physics`, `theoretical-physics`, `spacetime`, `topology`, `geometry`, `mathematics`, `machine-learning`,
`algorithms`, `data-structures`, `compression`, `software-engineering`, `distributed-systems`, `cryptography`

**Consciousness & Philosophy Tags:**
`consciousness`, `ai-consciousness`, `phenomenology`, `philosophy`, `epistemology`, `cognitive-architecture`, `ethics`

**Social & Political Tags:**
`sociology`, `political-economy`, `economics`, `institutional-analysis`, `game-theory`, `public-health`, `education`,
`religion`, `history`

**AI-Specific Tags:**
`ai-alignment`, `human-ai-collaboration`, `agents`, `neurodivergence`

### Auto-Tagging

Tags are applied at two levels:

1. **Manual tags** — Defined in `_data/tags.csv` or directly in `frontmatter.yaml`
2. **Format-derived tags** — Automatically added by `import-posts.js` based on which content format files exist (
   see [Auto-Tagging table above](#import-postsjs))

---

## Deployment

### AWS S3 Static Hosting

The site is deployed as a static site to AWS S3:

```bash
# Set your AWS profile (if not default)
export AWS_PROFILE=my-profile

# Optional: Set CloudFront distribution for cache invalidation
export CLOUDFRONT_DISTRIBUTION_ID=E1234567890

# Deploy
./scripts/deploy.sh
```

### Full Build & Deploy Pipeline

```bash
# 1. Sync metadata
node scripts/ingest-frontmatter.js

# 2. Assemble posts
node scripts/import-posts.js

# 3. Build & deploy
./scripts/deploy.sh
```

### Environment Variables

| Variable                     | Description                                       | Default   |
|:-----------------------------|:--------------------------------------------------|:----------|
| `AWS_PROFILE`                | AWS CLI profile name                              | `default` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID for cache invalidation | *(none)*  |

---

## Philosophy

The Fractal Thought Engine is built on three core principles:

### 1. Thinking is Multi-Modal

A single idea is best understood when viewed as a story, a diagram, an argument, and a game. The system's 23 content
formats aren't redundancy—they're **cognitive completeness**. Each lens reveals structure invisible to the others.

### 2. Source Material is Sacred

We never overwrite raw notes. The pipeline is additive: raw notes → summaries → drafts → expansions. Each stage produces
new artifacts without destroying previous ones. The `post_data/` directory structure enforces this by keeping each
format as a separate file.

### 3. Human-in-the-Loop

The AI proposes; the human steers. The CSV-based metadata system provides explicit checkpoints for review. The
separation of content generation (AI) from metadata curation (human via CSV) ensures editorial control at every stage.

---

## Contributing

### Adding a New Post

1. Create a directory: `post_data/<category>/YYYY-MM-DD-your-slug/`
2. Add `frontmatter.yaml` with at minimum `title`, `date`, and `layout: post`
3. Add `content.md` with your primary content
4. Optionally add additional format files (`comic.md`, `socratic.md`, etc.)
5. Add metadata to `_data/title.csv`, `_data/description.csv`, `_data/tags.csv`
6. Run the build pipeline:
   ```bash
   node scripts/ingest-frontmatter.js
   node scripts/import-posts.js
   bundle exec jekyll serve
   ```

### Adding a New Content Format

1. Add the format definition to the `contentFiles` array in `scripts/import-posts.js`
2. Optionally add a format-to-tag mapping in the `formatTagMap` object
3. Create the corresponding `.md` file in any post directory

### Adding a New Metadata Field

1. Create a new CSV file in `_data/` with header `frontmatter_path,<field_name>`
2. Populate rows with `frontmatter_path` and values
3. Run `node scripts/ingest-frontmatter.js` to sync

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

*Generated by the Fractal Thought Engine — where every idea deserves to be seen from every angle.*

- [What's Inside](#whats-inside)