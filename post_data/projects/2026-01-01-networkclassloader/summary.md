# Network-Centric Distributed Classloading Substrate

This project defines a distributed, versioned, and dependency-graph-aware execution fabric for the JVM. It shifts the
unit of truth from the "Artifact" (JAR/Module) to the "Symbol" (Class), enabling a cluster-wide shared class space with
precise lifecycle management and runtime evolution.

## Core Identity and Granularity

The system moves away from flat classpaths and prescriptive module systems toward an observational, symbol-level model:

* **SymbolId:** The stable symbolic identity of a type (FQCN).
* **VersionId:** A content-addressed hash of the class bytecode and metadata.
* **TimeId:** A monotonically increasing logical time for a symbol's evolution.
* **Class-Level Tracking:** Interclass dependencies are tracked as explicit edges in a global graph, allowing for
  precise impact analysis and selective loading.

## The Global Class Graph and Projections

Instead of loading monolithic artifacts, the system treats the entire ecosystem as a programmable graph:

* **Selective Projections:** Allows for logic-based loading, such as "load class Foo and its transitive dependencies,
  excluding class Bar and its closure."
* **ClassRealms:** Logical universes of types backed by specific resolution contexts and snapshots of the dependency
  graph.
* **Network-Native Resolution:** Classes are fetched on-demand from a distributed store, verified for integrity, and
  cached locally.

## Runtime Evolution and Patching

The substrate supports sophisticated runtime updates without requiring application restarts:

* **In-Place Redefinition:** Safe, ABI-compatible changes (e.g., method body updates) can be applied to live classes.
* **Snapshot Forking:** Structural changes trigger the creation of a new realm snapshot. New requests route to the new
  snapshot while old sessions drain naturally.
* **Usage Tracking:** Live reachability and stack frame counters determine safe windows for patching and the garbage
  collection of old class versions.

## Cluster-Wide Serialization and Debugging

By establishing a permanent, shared class space, the system revolutionizes cluster communication:

* **Versioned Serialization:** Objects carry `SymbolId` and `VersionId` metadata, ensuring "honest" serialization where
  the receiver can fetch or adapt to the exact bytecode version required.
* **Virtualized Debugging:** A JDWP tunneling service presents the entire cluster as a single logical JVM.
* **Unified Thread List:** All threads across the cluster are visible in one view.
* **Heap Pools:** Each physical JVM's heap is represented as a distinct pool within the debugger.
* **Symbolic Breakpoints:** Breakpoints are set against symbols and automatically propagate to all nodes running
  relevant versions.

## Ecosystem Optimization and AI Integration

The symbol-centric approach enables massive efficiencies in storage and documentation:

* **99% Compression:** Content-addressing identical classes across Maven Central eliminates the redundancy of shaded
  variants, fat JARs, and duplicate dependencies.
* **Bytecode Templating:** Structural identity is separated from naming, allowing shaded variants to be stored as a
  single "shape template" with tiny variant maps.
* **AI-Driven Documentation:** By treating bytecode as the source of truth, the system uses AI-enhanced decompilation to
  generate semantic source code, docstrings, and usage examples on the fly, eliminating the need for source and javadoc
  JARs.

## Strategic Impact

This architecture transforms the JVM from a local bytecode interpreter into a distributed machine. It provides a
post-hoc, universal substrate that works with legacy code and modern microservices alike, treating modules as optional
views rather than prescriptive requirements.

