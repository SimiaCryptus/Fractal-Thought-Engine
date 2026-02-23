# Planning Instructions: JSON++ Technical Deep-Dive

This document outlines the instructions and structural requirements for an upcoming technical essay exploring JSON++ as
a symbolic, extensible data substrate.

## 1. Core Narrative & Framing

* **The "Substrate" Thesis:** Frame the essay around the transition from JSON as a "frozen format" to a "
  grammar-extensible substrate." Contrast this with the rigidity of standard JSON and the complexity of binary formats
  like Protobuf.
* **The JS-Eval Constraint:** Emphasize the strategic decision to remain a subgrammar of JavaScript. Explain how this
  provides "free" compatibility with existing engines while enabling symbolic power.
* **Active vs. Passive Data:** Explore the shift from passive data storage to declarative processing graphs.

## 2. Structural Requirements

* **Introduction:** Define the limitations of current data interchange (redundancy, lack of logic, "dumb" strings) and
  introduce the JSON++ philosophy.
* **Section I: The Symbolic Layer:**
    * Detail Prefix Trees and Symbolic Bindings.
    * Explain the `u = "user."` and `u + "phone"` syntax.
    * Discuss structural compression and deduplication.
* **Section II: The Active Layer:**
    * Explain Pure Function calls (`decrypt`, `decompress`, `fft`).
    * Describe compositional pipelines as data reconstruction chains.
    * Highlight the safety/determinism of the side-effect-free environment.
* **Section III: Specialized Extensions:**
    * Cover Dense Numerical Arrays (HPC/ML context).
    * Cover Encrypted Fields (JWE envelopes).
    * Cover the role of C-style comments in metadata.
* **Section IV: The Ecosystem & Tooling:**
    * Explain "TypeScript as the Spec" and how it provides validation/linting.
    * Discuss the "LLM-Native" design—why JS-eval-able syntax is superior for model generation.
* **Conclusion:** Summarize JSON++ as the bridge between human-readable DSLs and machine-efficient execution.

## 3. Technical Tone & Style

* **Audience:** Systems architects, language designers, and AI engineers.
* **Tone:** Visionary yet grounded in implementation details. Avoid marketing fluff; focus on the "how" and "why" of the
  grammar.
* **Examples:** Use code snippets to illustrate the "Pretty" vs. "Verbose" dual-mode syntax.

## 4. Key Constraints for the Writer

* **No Filtering:** Ensure all four extensions (Comments, Prefix Trees, Dense Arrays, Encryption) are treated with equal
  depth.
* **Terminology:** Consistently use terms like "Symbolic Bindings," "Computed Keys," and "Declarative Processing."
* **Safety First:** Explicitly address how the format remains safe despite allowing function calls (pure functions
  only).