# Blind KMS Architecture: A Non-Custodial, Policy-Gated Substrate

This document outlines a novel server architecture for a **Blind Remote Key Derivation Service (BR-KDS)**. Unlike
traditional Key Management Systems (KMS), this architecture decouples policy enforcement from cryptographic visibility,
ensuring the server remains "blind" to plaintext, ciphertext, and derived keys while maintaining strict access control.

## 1. Core Architectural Layers

The system is composed of four distinct, single-purpose layers that work together to provide a secure, scalable, and
auditable data plane.

* **Blind KMS (The Policy Gate):** A stateless HKDF (Hash-based Key Derivation Function) oracle. It transforms a
  client-provided commitment (hash) and a `key_id` into a deterministic key using a server-side master secret. It
  enforces RBAC/ACLs and logs usage without ever seeing the underlying data.
* **Hash Store (The Data Volume):** A content-addressable, immutable blob store. It maps `blob ↔ hash`. It provides O(1)
  handles for data of any size, enables natural deduplication, and has no cryptographic or policy semantics.
* **Pointer Store (The Semantic Layer):** A transactional, bounded key-value store. It maps logical names (e.g.,
  `user:123:profile`) to cryptographic artifacts (BK1 envelopes or hashes). It is designed for Software Transactional
  Memory (STM) patterns and supports atomic operations like CAS (Compare-And-Set).
* **Client Library (The Crypto Brain):** The edge-side engine responsible for all "heavy" cryptography. It handles data
  compression, random padding (to obscure length), AEAD encryption, envelope construction, and commitment generation.

## 2. The Blind KMS Protocol

The protocol establishes a unique trust model where the server has power (control) but no visibility (blindness).

### The Encryption Flow

1. **Commitment:** Client computes `commit = H(data || salt || context)`.
2. **Derivation:** Client sends `(key_id, commit)` to the Blind KMS.
3. **Key Generation:** Server validates RBAC, then derives `k = HKDF(master_secret, key_id || commit || epoch)`.
4. **Encryption:** Client receives `k`, encrypts data locally, and constructs a **BK1 Envelope**.
5. **Persistence:** The envelope (or a hash pointing to it) is stored in the Pointer Store.

### The BK1 Envelope Format

A portable, serialized string containing:

* `version`: Protocol version (e.g., "BK1").
* `key_id`: The server-side policy bucket.
* `commit`: The hash used to re-derive the key.
* `nonce`: Random IV for AEAD.
* `ciphertext`: The encrypted payload.
* `metadata`: Optional context (tenant, epoch, etc.).

## 3. Distributed State & Transactions

To ensure scalability and correctness across sharded environments, the architecture employs specific distributed systems
patterns:

* **Transactional Pointer Fabric:** The Pointer Store supports atomic multi-key transactions (`TXN`) and `CAS`.
* **Sharded 3PC:** A frontend service acts as a coordinator, converting client-side STM operations into a 3-Phase Commit
  protocol across shards when multi-key atomicity is required.
* **Pluggable Backends:** The Pointer Store is a logical layer that can be backed by custom sharded engines or
  intrinsically scaled databases like **DynamoDB** or **Cassandra**, utilizing their native conditional write
  capabilities (LWT).

## 4. Operational Infrastructure

A production-grade implementation requires three critical cross-cutting services:

* **Garbage Collection (GC):** A graph-crawling service that traverses the Pointer Store from "roots" to identify
  reachable hashes in the Hash Store. It reclaims space by deleting unreferenced blobs and stale pointers.
* **Accounting & Quotas:** An authoritative service that tracks per-tenant usage (storage bytes, pointer counts, KMS
  derivation ops). It enforces hard limits and rate-throttling at the API gateways.
* **Observability:** Integrated metrics and tracing for shard health, transaction latency, and GC efficiency.

## 5. Comparison with Existing Standards

| Property               | AWS KMS   | Google Tink | libsodium | **Blind KMS**    |
|:-----------------------|:----------|:------------|:----------|:-----------------|
| **Server Blindness**   | No        | No          | N/A       | **Full**         |
| **Server Sees Keys**   | Yes       | No          | N/A       | **Never**        |
| **Policy Enforcement** | Yes       | No          | No        | **Yes**          |
| **Key Derivation**     | Custodial | Local       | Local     | **Remote/Blind** |
| **Decrypt Endpoint**   | Required  | N/A         | N/A       | **Not Needed**   |

## 6. Design Philosophies

* **Separation of Concerns:** The server controls *permission*, while the client controls *information*.
* **Immutability:** Data in the Hash Store never changes; only pointers in the Pointer Store move.
* **Side-Channel Resistance:** Mandatory compression and random padding obscure data structure and length.
* **Honest Threat Model:** The system assumes clients can retain what they have decrypted; its goal is to control
  *future* access via deterministic re-derivation.
