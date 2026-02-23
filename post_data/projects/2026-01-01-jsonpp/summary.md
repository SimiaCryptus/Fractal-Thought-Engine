# JSON++: A Symbolic, Extensible Data Substrate

JSON++ is a conceptual evolution of JSON from a static syntax into a grammar-extensible substrate. It introduces
symbolic power, structural compression, and declarative processing while maintaining strict compatibility with
JavaScript's evaluation model.

## Core Philosophy

The project aims to treat JSON as a "grammar-extensible substrate" rather than a frozen format. By leveraging a
subgrammar of JavaScript, JSON++ enables advanced features like symbolic reuse and domain-specific transforms without
requiring entirely new parsers or breaking existing ecosystems.

## Key Grammatical Extensions

The format introduces four primary orthogonal extensions to the standard JSON model:

* **Comments:** Support for C-style (`//`, `/* */`) annotations for human-readable metadata and debugging.
* **Prefix Trees (Symbolic Bindings):** Structural compression of repeated keys through local variable bindings.
* **Dense Numerical Arrays:** Efficient representation of numeric blocks (e.g., NumPy/Arrow buffers) for HPC and ML
  workloads.
* **Encrypted Fields:** Selective, field-level confidentiality using standard cryptographic envelopes (e.g., JWE).

## The JavaScript Subgrammar Approach

To ensure maximum compatibility and ease of implementation, JSON++ adopts a "JS-eval-able" syntax.

* **Symbolic Bindings:** Uses standard assignment syntax (e.g., `u = "user."`) to introduce local symbols.
* **Computed Keys:** Supports string concatenation for keys (e.g., `u + "phone": "123"`), which maps directly to
  JavaScript's computed property names.
* **Dual-Mode Syntax:** Supports a "Pretty" DSL for human readability and a "Verbose" mode (using `let` and `[]`) for
  direct execution in standard JS engines.

## Declarative Processing & Pure Functions

JSON++ transforms from a passive data format into a declarative processing graph by allowing pure function calls within
the document:

* **Domain-Specific Transforms:** Predefined functions for `decrypt()`, `decompress()`, and signal processing (e.g.,
  `fft()`, `decode_png()`).
* **Compositional Pipelines:** Functions can be nested to create data reconstruction chains (e.g.,
  `decrypt(decompress(blob))`).
* **Safety & Determinism:** The environment is restricted to pure, side-effect-free functions, ensuring the format
  remains a safe data interchange medium.

## Tooling and Enforcement

The design leverages existing industrial-strength toolchains for validation and generation:

* **TypeScript as the Spec:** The formal grammar and allowed constructs are defined and enforced via TypeScript types,
  providing "free" validation, linting, and autocomplete.
* **LLM-Native Design:** By adhering to JavaScript's syntactic patterns, the format is inherently optimized for
  generation and interpretation by Large Language Models.
* **Auto-Compression:** The symbolic nature of the format naturally deduplicates structural redundancy, making it highly
  efficient for storage and transmission.

