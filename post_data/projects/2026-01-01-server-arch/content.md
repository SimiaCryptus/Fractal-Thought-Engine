# The Blind Substrate: A Minimalist Architecture for Secure, Scalable Distributed Systems

Modern distributed systems struggle to balance security (privacy from the provider), scalability (data volume), and
consistency (complex state). Traditional architectures conflate these concerns—databases handle both storage and state,
and Key Management Systems (KMS) hold custody of secrets.

The **Blind Substrate** decouples these concerns into orthogonal, highly constrained layers. By enforcing strict
separation between **permission** (Blind KMS), **volume** (Hash Store), **state** (Pointer Store), and **logic** (Client
Library), we create a substrate that is intrinsically secure, scalable, and easier to reason about.

## 1. The Core Philosophy

1. **Cryptographic Dependence, Informational Independence**: The client depends on the server for permission (
   decryption, state updates), but the server is mathematically prevented from learning the client's data.
2. **Offloading Complexity**: Data volume moves to immutable storage; cryptographic complexity moves to the client. The
   transactional core remains small, bounded, and fast.

## 2. Layer 1: The Blind KMS (Permission)

The **Blind KMS** is a stateless, blind key derivation oracle. Unlike traditional KMS, it never sees plaintext or
ciphertext.

### Mechanism

1. **Commitment**: Client computes `commit = H(data || salt || context)`.
2. **Derivation**: Client sends `key_id` and `commit` to the server.
3. **Key Generation**: Server derives `k = HKDF(master_secret, key_id || commit || epoch)`.
4. **Control**: Server returns `k` to the client after enforcing RBAC and logging the access.

### Properties

* **Server Blindness**: The server sees only a hash, never the data or the final key.
* **Per-Payload Keys**: Every unique payload gets a unique key, limiting the blast radius of a leak.
* **No Decrypt Endpoint**: Decryption is performed by re-deriving the key via the same blind process.

## 3. Layer 2: The Hash Store (Volume)

The **Hash Store** is a content-addressable, immutable blob store. It handles the "weight" of the system.

* **Mechanism**: `PUT(blob) -> hash`, `GET(hash) -> blob`.
* **Deduplication**: Identical payloads naturally collapse to the same hash.
* **O(1) Handles**: Large data is reduced to a fixed-size handle (the hash), which is then passed to the Pointer Store.
* **Immutability**: Once written, data never changes, eliminating write-write conflicts at the storage layer.

## 4. Layer 3: The Pointer Store (State)

The **Pointer Store** is a transactional, bounded key-value fabric. It manages the "meaning" and relationships of the
data.

### Architecture

* **Bounded Sizes**: Strict limits on key (e.g., 256B) and value (e.g., 8KB) sizes ensure scalability and prevent abuse
  as a document store.
* **Atomic Primitives**: Supports `GET`, `SET`, `CAS` (Compare-and-Set), and small `TXN` (multi-key transactions).
* **Sharded 3PC**: A frontend coordinator converts multi-key transactions into a sharded 3-Phase Commit protocol across
  dumb storage shards.
* **Pluggable Backends**: Can be backed by custom engines or intrinsically scaled systems like Cassandra or DynamoDB.

## 5. Layer 4: The Client Library (Logic)

The **Client Library** is the "Crypto Brain." It orchestrates the other layers and enforces best practices.

* **Responsibilities**: Compression, random padding (to obscure length), AEAD encryption, and envelope construction.
* **The BK1 Envelope**: A portable, serialized string containing everything needed for decryption except the permission:
  `BK1:key_id:base64(commit):base64(nonce):base64(ciphertext):meta`

## 6. Layer 5: The GC Service (Lifecycle)

Because the Hash Store is immutable and the Pointer Store is versioned, the system requires an external **Garbage
Collection Service**.

* **Graph Crawling**: The service crawls the logical graph starting from "roots" in the Pointer Store.
* **Reachability**: It identifies which hashes are still referenced. Unreferenced blobs are reclaimed in epochs.
* **Policy-Driven**: GC enforces data lifecycle rules (e.g., legal holds, retention windows) without sitting on the hot
  path of the application.

## 7. Layer 6: Accounting & Quotas (Enforcement)

To support multi-tenancy and prevent DoS, the **Accounting Service** tracks resource usage as billable, enforceable
state.

* **Metrics**: Tracks storage bytes (Hash Store), pointer counts (Pointer Store), and derivation ops (Blind KMS).
* **Enforcement**: Rejects writes or throttles requests when per-tenant quotas are exceeded.

## Summary of the Substrate

| Layer              | Responsibility | Visibility          | Constraint                   |
|:-------------------|:---------------|:--------------------|:-----------------------------|
| **Blind KMS**      | Permission     | Blind (Hashes only) | Stateless HKDF               |
| **Hash Store**     | Volume         | Opaque Blobs        | Immutable, Content-Addressed |
| **Pointer Store**  | State          | Pointers/Metadata   | Bounded K/V, Transactional   |
| **Client Library** | Logic          | Plaintext (Local)   | AEAD, Compression, Padding   |

By decoupling these concerns, the Blind Substrate allows for a system where the server can say **yes** or **no** to an
operation, but can never **see** the data it is protecting.