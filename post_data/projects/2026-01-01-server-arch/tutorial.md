# Building a Blind Substrate: Implementing Privacy-Preserving Distributed Storage

This tutorial guides you through implementing a functional prototype of the Blind Substrate architecture. You will build a system where data storage is decoupled from data permission. By the end of this session, you will have a working Blind KMS (Key Management System), a Content-Addressable Hash Store, and a Client Library that orchestrates secure data "Put" and "Get" operations without the server ever seeing the plaintext data.

**⏱️ Estimated Time:** 60 minutes

**🎯 Skill Level:** Intermediate

**💻 Platform:** Python / Distributed Systems

---

## What You'll Learn

✓ Implement a Blind KMS using HKDF for stateless, deterministic key derivation.
✓ Build a Content-Addressable Hash Store for immutable data storage.
✓ Develop a Client Library that manages client-side encryption and cryptographic commitments.
✓ Demonstrate the Blind Put/Get lifecycle, ensuring the server remains "blind" to the content it hosts.

---

## Prerequisites

### Required

- **Python 3.9 or higher** (software): Programming language required for implementation.
- **pip** (software): Python package installer.
- **Intermediate Python** (knowledge): Knowledge of classes, decorators, and type hinting.
- **Basic Cryptography** (knowledge): Understanding of Symmetric encryption and Hashing.
- **JSON-based APIs** (knowledge): Familiarity with JSON data structures.
- **Modern Laptop** (hardware): Linux, macOS, or Windows environment.

---

## Tutorial Steps

### Step 1: Environment Setup and Project Structure

The Blind Substrate architecture relies on the separation of concerns between three distinct entities: the **Blind Key Management Service (KMS)**, the **Hash Store**, and the **Client Library**. To simulate this distributed environment effectively, we must first establish a clean workspace and install the cryptographic primitives required for blind signatures and authenticated encryption.

We will create a modular structure to simulate the network boundaries between the KMS, the Store, and the Client, including a `common` module for shared logic.

**Target Directory Structure:**
```text
blind-substrate-prototype/
├── venv/
├── kms/
│   ├── __init__.py
│   └── service.py
├── store/
│   ├── __init__.py
│   └── service.py
├── client/
│   ├── __init__.py
│   └── lib.py
├── common/
│   ├── __init__.py
│   └── crypto_utils.py
└── requirements.txt
```

Create the project root directory and navigate into it.

```bash
mkdir blind-substrate-prototype
cd blind-substrate-prototype
```

Initialize a Python virtual environment.

*Run in: `blind-substrate-prototype`*

```bash
python3 -m venv venv
```

Activate the virtual environment (macOS/Linux). For Windows use: .\venv\Scripts\activate

*Run in: `blind-substrate-prototype`*

```bash
source venv/bin/activate
```

Update pip and install the `cryptography` library.

*Run in: `blind-substrate-prototype`*

```bash
pip install --upgrade pip
pip install cryptography
```

Create the component directories, package initialization files, and main entry point files.

*Run in: `blind-substrate-prototype`*

```bash
mkdir kms store client common
touch kms/__init__.py store/__init__.py client/__init__.py common/__init__.py
touch kms/service.py
touch store/service.py
touch client/lib.py
touch common/crypto_utils.py
```

Freeze dependencies to ensure reproducibility.

*Run in: `blind-substrate-prototype`*

```bash
pip freeze > requirements.txt
```

**Expected Outcome:** You will have a project directory named `blind-substrate-prototype` containing four distinct Python packages (kms, store, client, common). Your virtual environment will be active, and the `cryptography` library will be available for import.

**Verify Success:**
1. Create a temporary file named `check_env.py`.
2. Paste the following code into `check_env.py`:
```python
from cryptography.hazmat.primitives.hashes import SHA256, Hash
from cryptography.hazmat.backends import default_backend

digest = Hash(SHA256(), backend=default_backend())
digest.update(b"blind-substrate-test")
print(f"Environment Check: Success. Hash: {digest.finalize().hex()}")
```
3. Run the script: `python check_env.py`
4. Verify that a hex string is printed to the console without any `ImportError`.
5. Delete the test file: `rm check_env.py`

**⚠️ Common Issues:**
- Permissions Error: If `pip install` fails, ensure you have activated the virtual environment. Do not use `sudo pip install`.
- Python Version: If `python3 -m venv` fails, you may need to install the venv module (e.g., `sudo apt install python3-venv` on Ubuntu).
- Architecture Mismatch: On Apple Silicon (M1/M2/M3) Macs, ensure you are running a native ARM64 version of Python to avoid issues with the `cryptography` library's C-extensions.

---

### Step 2: Implementing the Blind KMS (The Permission Layer)

In this step, you will build the core of the Blind Substrate architecture: the **Blind Key Management Service (KMS)**.

The "Blind" aspect is critical. In traditional systems, a KMS might manage keys directly. In this architecture, the KMS acts as a **stateless oracle**. It never sees the plaintext data, nor does it store individual keys for every piece of data. Instead, it uses a **Master Secret** and a **Commitment** (a hash of the data provided by the client) to deterministically derive a unique encryption key.

### 1. Understanding the Logic
We will use **HKDF (HMAC-based Extract-and-Expand Key Derivation Function)**. HKDF is ideal here because:
*   **Extraction:** It mixes the Master Secret with a salt to create a strong pseudorandom key.
*   **Expansion:** It uses context-specific information (the `key_id` and the `commitment`) to "expand" that key into a unique output key.
*   **Determinism:** Given the same Master Secret, Key ID, and Commitment, it will always produce the exact same key, allowing the KMS to remain stateless.

Create the KMS Service Module at `kms/service.py`.

```python
# kms/service.py
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.backends import default_backend

class BlindKMS:
    """
    A stateless Key Management Service that derives keys based on 
    a master secret and a client-provided commitment.
    """
    def __init__(self, master_secret: bytes):
        """
        Initialize with a master secret. In a production environment, 
        this would be loaded from a Hardware Security Module (HSM) 
        or an environment variable.
        """
        if len(master_secret) < 32:
            raise ValueError("Master secret must be at least 32 bytes for security.")
        self.master_secret = master_secret

    def derive_data_key(self, key_id: str, commitment: bytes) -> bytes:
        """
        Derives a unique symmetric key using HKDF.
        
        :param key_id: A unique identifier for the key (e.g., a UUID).
        :param commitment: A SHA-256 hash of the data (the 'blind' part).
        :return: A 32-byte derived key.
        """
        # We use the key_id as the 'salt' and the commitment as 'info' (context).
        # This ensures that even if two files have the same content (same commitment),
        # they will have different keys if their key_ids differ.
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=key_id.encode(),
            info=commitment,
            backend=default_backend()
        )
        
        return hkdf.derive(self.master_secret)

# Helper to generate a fresh master secret for the first time
def generate_master_secret():
    return os.urandom(32)
```

Create a Simple Test Script `test_kms.py` in the root directory.

```python
# test_kms.py
from kms.service import BlindKMS, generate_master_secret

def test_kms_consistency():
    # 1. Setup
    master_secret = b"super-secret-master-key-at-least-32-bytes"
    kms = BlindKMS(master_secret)
    
    key_id = "user-file-123"
    # Simulate a commitment (hash of "hello world")
    commitment = b"\x2c\xf2\x4d\x1b\x4a\x50\x51\x0e\x06\x54\x40\x10\x6a\x91\x96\x1d" 

    # 2. Derive key twice
    key_1 = kms.derive_data_key(key_id, commitment)
    key_2 = kms.derive_data_key(key_id, commitment)

    # 3. Validation
    print(f"Derived Key 1: {key_1.hex()}")
    print(f"Derived Key 2: {key_2.hex()}")
    
    assert key_1 == key_2, "Error: KMS is not deterministic!"
    print("Success: KMS derived consistent keys.")

    # 4. Ensure different inputs yield different keys
    different_commitment = b"\xff" * 16
    key_3 = kms.derive_data_key(key_id, different_commitment)
    assert key_1 != key_3, "Error: Different commitments produced the same key!"
    print("Success: KMS produces unique keys for different commitments.")

if __name__ == "__main__":
    test_kms_consistency()
```

Execute the Validation script.

```bash
python3 test_kms.py
```

**Expected Outcome:** When you run the script, you should see the hex-encoded derived keys printed to the console. The two keys for the same input must match exactly, and the script should finish without any `AssertionError`.

**Output Example:**
```text
Derived Key 1: a1b2c3d4...
Derived Key 2: a1b2c3d4...
Success: KMS derived consistent keys.
Success: KMS produces unique keys for different commitments.
```

**Verify Success:**
1. Check Determinism: Verify that calling `derive_data_key` with the same `key_id` and `commitment` always returns the same byte string.
2. Check Blindness: Notice that the `derive_data_key` function never takes the actual file content as an argument—only the `commitment`.
3. Check Security: Ensure the `master_secret` is at least 32 bytes (256 bits) to provide sufficient entropy for the HKDF process.

**⚠️ Common Issues:**
- TypeError (Strings vs Bytes): HKDF requires `bytes`. If you pass a string for the `commitment` or `master_secret`, the code will crash. Always ensure you encode strings (e.g., `key_id.encode()`) before passing them to the `cryptography` library.
- Short Master Secret: If your master secret is too short, the `BlindKMS` constructor will raise a `ValueError`. This is a safety feature to prevent weak encryption.
- Import Errors: Ensure your `PYTHONPATH` includes the current directory, or that you are running the test script from the root of the `blind-substrate-prototype` folder.

---

### Step 3: Building the Hash Store (The Volume Layer)

In the Blind Substrate architecture, the **Hash Store** acts as the "Volume Layer." Unlike traditional file systems that use arbitrary filenames, a Hash Store uses **Content-Addressable Storage (CAS)**.

In CAS, the address of a piece of data is derived directly from the data itself using a cryptographic hash function (SHA-256). This ensures:
1. **Immutability:** If the data changes, the hash changes.
2. **Deduplication:** Identical blobs are only stored once.
3. **Integrity:** Data can be verified by re-hashing.

We will implement a `HashStore` class using Python's `hashlib` and `os` modules to manage a local directory as our storage backend.

Create the HashStore module file.

*Run in: `project_root`*

```bash
touch store/hash_store.py
```

Implement the HashStore class in `store/hash_store.py`.

*Run in: `project_root`*

```python
import hashlib
import os
from typing import Optional

class HashStore:
    def __init__(self, storage_dir: str = "data_store"):
        """
        Initializes the HashStore with a specific directory for file storage.
        """
        self.storage_dir = storage_dir
        # Create the storage directory if it doesn't exist
        if not os.path.exists(self.storage_dir):
            os.makedirs(self.storage_dir)

    def _get_path(self, address: str) -> str:
        """Helper to construct the file path from a hash address."""
        return os.path.join(self.storage_dir, address)

    def store(self, blob: bytes) -> str:
        """
        Stores a blob of data and returns its SHA-256 hash as the address.
        
        Args:
            blob: The raw bytes to be stored (usually encrypted data).
            
        Returns:
            A hex string representing the SHA-256 hash of the blob.
        """
        # 1. Generate the SHA-256 hash of the data
        sha256_hash = hashlib.sha256(blob).hexdigest()
        
        # 2. Determine the file path
        file_path = self._get_path(sha256_hash)
        
        # 3. Write the blob to disk if it doesn't already exist
        if not os.path.exists(file_path):
            with open(file_path, "wb") as f:
                f.write(blob)
        
        return sha256_hash

    def retrieve(self, address: str) -> Optional[bytes]:
        """
        Retrieves data associated with the given hash address.
        
        Args:
            address: The hex SHA-256 hash of the data.
            
        Returns:
            The original bytes if found, otherwise None.
        """
        file_path = self._get_path(address)
        
        if not os.path.exists(file_path):
            return None
            
        with open(file_path, "rb") as f:
            return f.read()
```

Create a test script to verify the Hash Store.

*Run in: `project_root`*

```bash
touch test_store.py
```

Add the test code to `test_store.py`.

*Run in: `project_root`*

```python
from store.hash_store import HashStore

def test_hash_store():
    store = HashStore("test_storage")
    
    # Test Data
    data = b"Hello, Blind Substrate!"
    
    # Action: Store data
    address = store.store(data)
    print(f"Stored Address: {address}")
    
    # Action: Retrieve data
    retrieved_data = store.retrieve(address)
    
    # Validation
    assert retrieved_data == data, "Retrieved data does not match original!"
    
    # Validation: Check if the address is actually the SHA-256 hash
    import hashlib
    expected_hash = hashlib.sha256(data).hexdigest()
    assert address == expected_hash, "Address is not a valid SHA-256 hash!"
    
    print("Success: Data stored and retrieved correctly.")
    print("Success: Address matches SHA-256 content hash.")

if __name__ == "__main__":
    test_hash_store()
```

Run the test script.

*Run in: `project_root`*

```bash
python3 test_store.py
```

**Expected Outcome:** When you run the test script, you should see the hex-encoded SHA-256 hash of the test string. A new directory named `test_storage` will appear in your project folder containing a file named after that hash.

Output Example:
Stored Address: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
Success: Data stored and retrieved correctly.
Success: Address matches SHA-256 content hash.

**Verify Success:**
1. Check File Persistence: Run `ls test_storage/`. You should see a file with the name `7f83b165...`.
2. Check Content: Run `cat test_storage/7f83b165...`. It should display `Hello, Blind Substrate!`.
3. Check Deduplication: If you run the test again, the code should not create a duplicate file; it simply overwrites or skips the write because the hash (the filename) is identical.

**⚠️ Common Issues:**
- Permission Denied: Ensure the script has permission to create directories and write files in the project folder.
- Type Errors: Remember that `hashlib` and file writing in `"wb"` mode require `bytes` objects, not `strings`. If you pass a string to `store()`, you must encode it first (e.g., `data.encode()`).
- Pathing: If you are running the script from a different directory, the `test_storage` folder might be created in an unexpected location. Always run your scripts from the project root.

---

### Step 4: Implementing the Pointer Store (The State Layer)

In the previous step, we built the **Hash Store** (Volume Layer) for immutable data storage. Now, we implement the **Pointer Store** (State Layer). This layer maintains a mapping between a fixed, human-readable name (the pointer) and the current content hash (the address). 

This layer is crucial for:
1. **Mutability via Indirection:** Allowing 'updates' by changing the hash a name points to.
2. **Ownership Simulation:** Implementing basic Role-Based Access Control (RBAC) to ensure only the creator of a pointer can update it.
3. **Decoupling:** Separating the data content from the metadata of who owns it and where it is located.

Create the Pointer Store module to handle name-to-hash mappings and RBAC.

*Run in: ``*

```python
# pointer_store.py

class PointerStore:
    def __init__(self):
        # Maps a name (e.g., "my_document") to a content hash
        self._pointers = {}
        # Maps a name to a user_id to simulate ownership/RBAC
        self._permissions = {}

    def update_pointer(self, name, address, user_id):
        """
        Updates the pointer to a new hash address.
        Only allows the update if the user is the owner or if the pointer is new.
        """
        # Check if the pointer already exists
        if name in self._permissions:
            # RBAC Check: Only the original creator can update
            if self._permissions[name] != user_id:
                raise PermissionError(f"User '{user_id}' does not have permission to update pointer '{name}'.")
        else:
            # If it's a new pointer, assign ownership to this user
            self._permissions[name] = user_id

        # Update the state
        self._pointers[name] = address
        print(f"[PointerStore] Updated '{name}' -> {address[:16]}... (Owner: {user_id})")

    def get_pointer(self, name):
        """
        Retrieves the content hash address associated with a name.
        """
        address = self._pointers.get(name)
        if not address:
            raise KeyError(f"Pointer '{name}' not found.")
        return address

    def get_owner(self, name):
        """
        Helper to check who owns a specific pointer.
        """
        return self._permissions.get(name)
```

Create a validation script to test pointer creation, updates, and permission enforcement.

*Run in: ``*

```python
# test_pointer_store.py
from pointer_store import PointerStore

def test_pointer_logic():
    store = PointerStore()
    
    # Define test data
    user_alice = "alice_dev"
    user_bob = "bob_hacker"
    pointer_name = "project_alpha"
    hash_v1 = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
    hash_v2 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

    print("--- Scenario 1: Alice creates a pointer ---")
    store.update_pointer(pointer_name, hash_v1, user_alice)
    assert store.get_pointer(pointer_name) == hash_v1
    print("Success: Alice created the pointer.")

    print("\n--- Scenario 2: Alice updates her pointer to V2 ---")
    store.update_pointer(pointer_name, hash_v2, user_alice)
    assert store.get_pointer(pointer_name) == hash_v2
    print("Success: Alice updated her own pointer.")

    print("\n--- Scenario 3: Bob tries to hijack Alice's pointer ---")
    try:
        store.update_pointer(pointer_name, "malicious_hash", user_bob)
    except PermissionError as e:
        print(f"Caught expected error: {e}")
        # Verify the pointer still points to Alice's V2 hash
        assert store.get_pointer(pointer_name) == hash_v2
        print("Success: Bob was blocked from updating Alice's pointer.")

if __name__ == "__main__":
    test_pointer_logic()
```

Execute the validation script to verify the logic.

*Run in: ``*

```bash
python3 test_pointer_store.py
```

**Expected Outcome:** The script should output logs confirming three scenarios: 1) Alice successfully creates a pointer, 2) Alice successfully updates her pointer, and 3) Bob catches a PermissionError when trying to update Alice's pointer. The final output should confirm 'Success' for all scenarios.

**⚠️ Common Issues:**
- KeyError: If you try to `get_pointer` for a name that hasn't been created yet, the script will raise a `KeyError`.
- Persistence: Since we are using a Python dictionary, all pointers will be lost when the script finishes. Real implementations would use a database.
- Identity Verification: This simulation trusts the `user_id` passed to the function. Production systems would require cryptographic signatures.

---

### Step 5: Developing the Client Library (The Logic Layer)

In a "Blind Substrate" architecture, the servers are intentionally designed to be "dumb" and "blind." They store bits and manage keys, but they never see the raw data or understand the relationship between keys and content. Therefore, the **Client Library** is the most critical component; it is the "brain" of the operation.

The Client Library is responsible for:
1.  **Encryption/Decryption:** Ensuring data is unreadable before it leaves the device.
2.  **Commitment Generation:** Creating a deterministic "address" (hash) for the data so it can be found later without the server knowing what it is.
3.  **Orchestration:** Managing the sequence of calls between the KMS (Key Management Service), the Hash Store, and the Pointer Store.

Install the required cryptography library for industry-standard AES-GCM encryption.

```bash
pip install cryptography
```

Create a new file named `blind_client.py` containing the `BlindSubstrateClient` class logic.

```python
import hashlib
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class BlindSubstrateClient:
    def __init__(self, kms_proxy, hash_store_proxy, pointer_store_proxy):
        """
        Initialize with proxies to the three main services.
        In a real system, these would be HTTP/gRPC clients.
        """
        self.kms = kms_proxy
        self.hash_store = hash_store_proxy
        self.pointer_store = pointer_store_proxy

    def _generate_salt(self):
        return os.urandom(16)

    def encrypt_data(self, key, plaintext):
        """Encrypts data using AES-GCM."""
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)  # GCM standard nonce length
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
        # Return nonce + ciphertext so we can decrypt it later
        return nonce + ciphertext

    def decrypt_data(self, key, encrypted_blob):
        """Decrypts data using AES-GCM."""
        aesgcm = AESGCM(key)
        nonce = encrypted_blob[:12]
        ciphertext = encrypted_blob[12:]
        return aesgcm.decrypt(nonce, ciphertext, None).decode()

    def create_commitment(self, data, salt):
        """
        Creates a blinded hash of the data. 
        The salt ensures that two users storing the same file 
        don't necessarily result in the same hash (preventing frequency analysis).
        """
        hasher = hashlib.sha256()
        hasher.update(salt)
        hasher.update(data.encode())
        return hasher.hexdigest()

    def store(self, user_id, pointer_name, data):
        """
        The Orchestration Flow:
        1. Get (or create) a key from the KMS.
        2. Encrypt the data.
        3. Generate a commitment (hash).
        4. Upload encrypted data to Hash Store.
        5. Update the Pointer Store to link the name to the hash.
        """
        # 1. Get Key (Simulating KMS interaction)
        key = self.kms.get_key(user_id, pointer_name)
        
        # 2. Encrypt
        encrypted_blob = self.encrypt_data(key, data)
        
        # 3. Generate Commitment
        # For this prototype, we'll use a fixed salt for the pointer 
        # or store the salt alongside the pointer.
        salt = b"static_salt_for_demo" 
        content_hash = self.create_commitment(data, salt)
        
        # 4. Store in Hash Store
        address = self.hash_store.store(encrypted_blob)
        
        # 5. Update Pointer
        self.pointer_store.update_pointer(user_id, pointer_name, address)
        
        return address

    def retrieve(self, user_id, pointer_name):
        """
        The Retrieval Flow:
        1. Get the address from the Pointer Store.
        2. Fetch the encrypted blob from the Hash Store.
        3. Get the key from the KMS.
        4. Decrypt and return.
        """
        # 1. Get Address
        address = self.pointer_store.get_pointer(user_id, pointer_name)
        if not address:
            raise Exception("Pointer not found")
            
        # 2. Fetch Blob
        encrypted_blob = self.hash_store.retrieve(address)
        
        # 3. Get Key
        key = self.kms.get_key(user_id, pointer_name)
        
        # 4. Decrypt
        return self.decrypt_data(key, encrypted_blob)
```

Create a file named `mock_kms.py` to simulate a Key Management Service providing 32-byte keys.

```python
import hashlib

class MockKMS:
    def get_key(self, user_id, pointer_name):
        # In a real KMS, this would return a high-entropy random key
        # stored in a Hardware Security Module (HSM).
        seed = f"{user_id}-{pointer_name}-secret-seed"
        return hashlib.sha256(seed.encode()).digest() # Returns 32 bytes
```

Create a file named `test_client.py` to verify the client can orchestrate the entire flow.

```python
from blind_client import BlindSubstrateClient
from mock_kms import MockKMS
# Import your classes from previous steps
from hash_store import HashStore 
from pointer_store import PointerStore

# 1. Setup the environment
kms = MockKMS()
h_store = HashStore("client_test_hashes")
p_store = PointerStore()
client = BlindSubstrateClient(kms, h_store, p_store)

# 2. Define test data
user = "alice@example.com"
pointer = "my_secret_note"
original_data = "This is a highly sensitive secret message."

print(f"--- Starting Store Flow ---")
address = client.store(user, pointer, original_data)
print(f"Data stored at address: {address}")

print(f"\n--- Starting Retrieval Flow ---")
retrieved_data = client.retrieve(user, pointer)
print(f"Retrieved: {retrieved_data}")

# 3. Validation
assert original_data == retrieved_data
print("\nSuccess: Data integrity maintained through the Blind Substrate!")
```

**Expected Outcome:** When you run `python test_client.py`, the client should generate a key, encrypt the message, update the Pointer Store, and successfully retrieve/decrypt the data. 

Output Example:
```text
--- Starting Store Flow ---
Data stored at address: [SHA256_HASH_STRING]

--- Starting Retrieval Flow ---
Retrieved: This is a highly sensitive secret message.

Success: Data integrity maintained through the Blind Substrate!
```

**Verify Success:**
1. Check Encryption: Open the file inside the `client_test_hashes` folder. If you try to read it in a text editor, it should look like random symbols/binary. This confirms the Hash Store cannot read your data.
2. Check Pointer: Verify that the `p_store` (in memory) correctly maps "alice@example.com" + "my_secret_note" to the hash filename found in the folder.

**⚠️ Common Issues:**
- ModuleNotFoundError: Ensure `hash_store.py` and `pointer_store.py` from Steps 3 and 4 are in the same directory as your client script.
- Key Length: AESGCM requires a key of exactly 16, 24, or 32 bytes. If your Mock KMS returns a string instead of `bytes`, the `cryptography` library will throw a `ValueError`.
- Padding: Unlike older AES modes (like CBC), AES-GCM does not require manual padding, but it does require the `nonce` to be handled correctly. If you lose the first 12 bytes of your stored blob, decryption will fail.

---

### Step 6: Orchestrating the "Blind Put" Operation

In this step, we integrate the individual components (Blind KMS, Hash Store, and Pointer Store) into a cohesive workflow known as the "Blind Put." This ensures that the KMS provides encryption keys based on a data commitment (hash) rather than the data itself, and the storage layer only sees encrypted blobs. The client manages the logic flow: Commitment Generation, Key Acquisition, Local Encryption, Content Addressing, and State Update.

Create the orchestration script `orchestrate_put.py` to simulate the full lifecycle of a data upload.

*Run in: `~/blind-substrate`*

```python
import hashlib
from kms_service import BlindKMS
from hash_store import HashStore
from pointer_store import PointerStore
from client_lib import BlindSubstrateClient

def run_blind_put_demo():
    print("--- Initializing Blind Substrate Components ---")
    # 1. Initialize our simulated distributed services
    kms = BlindKMS()
    hstore = HashStore()
    pstore = PointerStore()
    
    # 2. Initialize the Client Library with access to these services
    client = BlindSubstrateClient(kms_provider=kms, storage_provider=hstore, state_provider=pstore)

    # 3. Define our sensitive data and a pointer name
    user_id = "user_88"
    pointer_name = "financial_report_2023"
    sensitive_data = "CONFIDENTIAL: Revenue was $5M. Profit margin 20%."

    print(f"\n[Client] Preparing to store data for pointer: '{pointer_name}'")
    print(f"[Client] Original Plaintext: {sensitive_data}")

    # 4. Execute the Blind Put
    # This single call triggers the hashing, key fetching, encryption, and storage
    try:
        storage_address = client.put(user_id, pointer_name, sensitive_data)
        
        print("\n--- 'Blind Put' Operation Complete ---")
        print(f"Resulting Storage Address (Hash Store): {storage_address}")
        
        # 5. Verification: Inspecting the "Blindness"
        print("\n--- Security Audit (Verification) ---")
        
        # Verify KMS doesn't have the data
        # In a real system, we'd check KMS logs. Here we check the KMS internal state.
        kms_requests = kms.get_request_logs()
        print(f"KMS Logs: Received request for hash {kms_requests[-1]} (No plaintext seen!)")
        
        # Verify Hash Store only has ciphertext
        stored_blob = hstore.get(storage_address)
        print(f"Hash Store Content: {stored_blob.hex()[:30]}... (Encrypted blob)")
        
        # Verify Pointer Store mapping
        resolved_address = pstore.get(user_id, pointer_name)
        print(f"Pointer Store: '{pointer_name}' maps to {resolved_address}")

    except Exception as e:
        print(f"Operation failed: {e}")

if __name__ == "__main__":
    run_blind_put_demo()
```

Run the script to see the components interacting in real-time.

*Run in: `~/blind-substrate`*

```bash
python3 orchestrate_put.py
```

📸 Capture the terminal output. Highlight the line showing the "KMS Logs" receiving a hash and the "Hash Store Content" showing a hex-encoded encrypted blob to demonstrate that neither service saw the original "CONFIDENTIAL" string.

**Expected Outcome:** Upon execution, the terminal should display a sequence of logs showing the data moving through the system. The plaintext should only appear in the "Client" logs, while "KMS" logs show only hashes and "Hash Store" logs show only encrypted blobs.

**Verify Success:**
1. Data Integrity: Ensure the `storage_address` returned by the `client.put` method matches the address stored in the `Pointer Store`.
2. KMS Blindness: Check that the `kms_requests` log contains a 64-character SHA256 string and NOT the plaintext words.
3. Storage Blindness: Ensure that calling `hstore.get(storage_address)` returns unreadable ciphertext bytes.
4. Pointer Ownership: Modify the script to have a different user attempt to update the pointer to verify `PermissionError` is triggered.

**⚠️ Common Issues:**
- ImportErrors: Ensure `kms_service.py`, `hash_store.py`, `pointer_store.py`, and `client_lib.py` are all in the same directory.
- Encoding Mismatches: Ensure the client converts plaintext strings to bytes (`data.encode()`) before hashing and encrypting.
- KMS Key Consistency: If the Put is run twice with the same data, the KMS must return the same key.

---

### Step 7: Orchestrating the "Blind Get" and Verification

In this step, we implement the retrieval logic. The "Blind Get" is the inverse of the "Blind Put" operation. The architecture ensures the Client orchestrates the flow without revealing raw data to the storage layer or the raw key to the KMS.

The retrieval process relies on **Content Addressing**. The client asks the Pointer Store for the address, the Hash Store for the data at that address, and finally the KMS to re-generate the key using the original commitment.

Create the retrieval script `blind_get.py` to simulate the client orchestration.

*Run in: `project root`*

```python
# blind_get.py
import requests
import base64
from cryptography.fernet import Fernet
import hashlib

# Configuration - matching our previous steps
KMS_URL = "http://localhost:5001/derive"
HASH_STORE_URL = "http://localhost:5002/get"
POINTER_STORE_URL = "http://localhost:5003/pointer"

def blind_get(pointer_id, secret_commitment):
    print(f"--- Initiating Blind Get for Pointer: {pointer_id} ---")

    # 1. Fetch the address from the Pointer Store
    print(f"[1] Querying Pointer Store for ID: {pointer_id}...")
    p_response = requests.get(f"{POINTER_STORE_URL}/{pointer_id}")
    if p_response.status_code != 200:
        print("Error: Pointer not found.")
        return
    
    address = p_response.json()['address']
    print(f"    Found Address: {address}")

    # 2. Retrieve ciphertext from the Hash Store using the address
    print(f"[2] Fetching ciphertext from Hash Store at address: {address}...")
    h_response = requests.get(f"{HASH_STORE_URL}/{address}")
    if h_response.status_code != 200:
        print("Error: Ciphertext not found in Hash Store.")
        return
    
    encrypted_blob = h_response.json()['blob']
    print(f"    Retrieved Encrypted Blob (truncated): {encrypted_blob[:30]}...")

    # 3. Re-derive the key from the KMS
    # We send the commitment. The KMS doesn't know what this key is for.
    print(f"[3] Requesting key re-derivation from KMS...")
    k_response = requests.post(KMS_URL, json={"commitment": secret_commitment})
    if k_response.status_code != 200:
        print("Error: KMS failed to derive key.")
        return
    
    derived_key = k_response.json()['key']
    print(f"    Key successfully re-derived.")

    # 4. Decrypt and Verify
    print(f"[4] Decrypting data...")
    try:
        f = Fernet(derived_key.encode())
        decrypted_data = f.decrypt(encrypted_blob.encode()).decode()
        
        print("\n--- Success! ---")
        print(f"Decrypted Content: {decrypted_data}")
        
        # Verification: In a real system, you might hash the result 
        # to ensure it matches the address (Content Integrity)
        verification_hash = hashlib.sha256(encrypted_blob.encode()).hexdigest()
        if verification_hash == address:
            print("Integrity Verified: Ciphertext matches the Pointer Store address.")
        
    except Exception as e:
        print(f"Decryption Failed: {str(e)}")
        print("Possible cause: Incorrect key or corrupted data.")

if __name__ == "__main__":
    # In a real scenario, these would be passed as arguments or retrieved from a session
    # For this test, use the values generated in Step 6
    import sys
    if len(sys.argv) < 3:
        print("Usage: python blind_get.py <pointer_id> <secret_commitment>")
    else:
        blind_get(sys.argv[1], sys.argv[2])
```

Execute the retrieval script using the ID and commitment hash generated in the previous step.

*Run in: `project root`*

```bash
# Replace <ID> and <HASH> with the actual values from Step 6
python blind_get.py "user_123_profile" "860244735f96756530b5b74895be70e3..."
```

**Expected Outcome:** The terminal should display a step-by-step log of the orchestration. If successful, the original plaintext message will be displayed and integrity verified.

**Verify Success:**
1. Check KMS Logs: Should show a request for key derivation but NO record of the ciphertext or pointer ID.
2. Check Hash Store Logs: Should show a GET request for a hash but NO record of the key or plaintext.
3. Check Pointer Store Logs: Should show a mapping lookup but NO access to the actual data.

**⚠️ Common Issues:**
- Incorrect Commitment: Providing the wrong secret_commitment will cause the KMS to derive the wrong key, resulting in an InvalidToken decryption error.
- Service Timeout: If the script hangs or throws a ConnectionError, ensure all three service files (KMS, Hash Store, Pointer Store) are running.
- Data Persistence: If services were restarted, in-memory data from Step 6 is lost. You must perform a 'Put' again before the 'Get'.

---

## Troubleshooting

### 1. The system fails during HMAC verification or decryption, even though the keys appear correct.

**Symptoms:**
- TypeError: Unicode-objects must be encoded before hashing
- ValueError: Invalid signature
- binascii.Error: Incorrect padding

**Possible Causes:**
- Python 3 strictly separates str (Unicode) and bytes
- Cryptographic functions require bytes, but web APIs often transmit data as JSON strings

**Solutions:**
1. Standardize Encoding: Ensure all data is encoded to utf-8 before hashing
2. Base64 Consistency: Use base64 encoding/decoding for binary data over JSON
3. Check Types: Use isinstance(data, bytes) to verify data types

### 2. One or more services (KMS, Hash Store, or Pointer Store) fail to start.

**Symptoms:**
- OSError: [Errno 98] Address already in use
- RuntimeError: Port 5000 is already in use

**Possible Causes:**
- Running multiple services on the same default port (e.g., Flask defaults to 5000)
- A previous instance of the service didn't shut down correctly

**Solutions:**
1. Assign Unique Ports explicitly (e.g., 5001, 5002, 5003)
2. Kill Ghost Processes using lsof or netstat
3. Use Dynamic Binding (port=0) during testing

### 3. The Client Library fails when attempting to send encrypted chunks to the Hash Store.

**Symptoms:**
- TypeError: Object of type bytes is not JSON serializable

**Possible Causes:**
- Passing raw encrypted bytes directly into a requests.post(json=...) call
- JSON does not support binary data

**Solutions:**
1. Base64 Wrapping: Wrap the encrypted payload in a JSON object
2. Binary Streams: Use the data parameter with Content-Type: application/octet-stream

### 4. The KMS rejects requests even when the user provides a valid API key.

**Symptoms:**
- 403 Forbidden
- {"error": "Invalid Policy"}

**Possible Causes:**
- Client Library calculates the hash differently than the KMS expects (e.g., hashing plaintext instead of ciphertext)
- Mismatch in salt or nonce synchronization

**Solutions:**
1. Verify Hashing Order: Encrypt -> Hash Ciphertext -> Request Key from KMS
2. Check Salt/Nonce synchronization between Client and KMS

### 5. A "Blind Put" operation fails halfway through, leaving data in the Hash Store but no record in the Pointer Store.

**Symptoms:**
- The Hash Store is filling up with data that cannot be retrieved because the Pointer Store has no reference to it

**Possible Causes:**
- Network timeout or client crash occurring after Hash Store upload but before Pointer Store update

**Solutions:**
1. Implement Idempotency so retries do not create duplicates
2. Two-Phase Commit: Use a pending state in the Pointer Store
3. Cleanup Worker: Periodically delete orphaned hashes

### 6. Cryptographic functions behave differently or fail to import.

**Symptoms:**
- AttributeError: module 'os' has no attribute 'urandom'
- ImportError: cannot import name 'Cipher' from 'cryptography.hazmat.primitives.ciphers'

**Possible Causes:**
- Using an outdated version of the cryptography library
- Using a Python version < 3.8

**Solutions:**
1. Always use a Virtual Environment (venv)
2. Create a requirements.txt with specific versions
3. Update Pip before installing dependencies

### 7. Uploading large files to the Hash Store results in a connection drop.

**Symptoms:**
- requests.exceptions.ConnectionError
- ChunkedEncodingError

**Possible Causes:**
- The Hash Store or proxy has a default timeout
- Maximum request body size limit exceeded

**Solutions:**
1. Increase Timeouts in the Client Library
2. Implement data chunking (e.g., 1MB segments)
3. Increase MAX_CONTENT_LENGTH in Server Config

---

## Next Steps

🎉 Congratulations on completing this tutorial!

### Try These Next
- Implement Key Rotation with Re-Blinding
- Add Multi-Factor Blinding (Threshold KMS)
- Build a "Zero-Knowledge" Search Index
- Integrate a Local Cache with Integrity Checks

### Related Resources
- Cloudflare’s OPRF (Oblivious PRF) Documentation
- The Signal Protocol (Private Group Storage)
- Google’s Tink Library Design
- NIST SP 800-57 (Recommendation for Key Management)

### Advanced Topics
- Homomorphic Encryption (HE)
- Post-Quantum Cryptography (PQC)
- Formal Verification of Cryptographic Protocols
- Trusted Execution Environments (TEEs)

