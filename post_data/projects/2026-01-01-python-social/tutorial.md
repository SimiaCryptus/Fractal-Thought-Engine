# From Vibe Coding to Engineering: Hardening Python for Production Systems

This tutorial demonstrates how to transform a loose, "vibe-based" Python script—characterized by implicit types, dictionary-heavy data passing, and fragile logic—into a rigorous, type-safe, and verifiable engineering component. You will learn to use modern Python features (3.10+) and industry-standard tools to create code that is resilient to change and optimized for both human collaboration and AI-driven development.

**⏱️ Estimated Time:** 45 minutes

**🎯 Skill Level:** Intermediate

**💻 Platform:** Python 3.10+

---

## What You'll Learn

✓ Implement Static Type Hinting and strict type checking to catch logic errors before runtime.
✓ Utilize Pydantic Models to enforce data integrity at the system boundaries.
✓ Apply Structural Subtyping (Protocols) to create flexible, verifiable interfaces.
✓ Configure Mypy for automated verification of the codebase.
✓ Transition from "Implicit Dictionaries" to "Explicit Schemas" for better IDE and AI assistance.

---

## Prerequisites

### Required

- **Python 3.10 or higher** (software): Required Python version.
- **Code editor** (software): VS Code or PyCharm recommended.
- **Terminal/Command Line access** (software): Access to a shell environment.
- **Intermediate Python** (knowledge): Knowledge of functions, classes, and decorators.
- **Package Management** (knowledge): Basic understanding of pip and virtual environments.
- **Data Structures** (knowledge): Familiarity with JSON-like data structures.
- **Computer** (hardware): Any modern laptop/desktop capable of running Python.

---

## Tutorial Steps

### Step 1: Auditing the "Vibe-Based" Script

In this step, you will establish the baseline for the project by creating a typical "vibe-based" script—one that works under perfect conditions but relies on implicit assumptions about data structures. You will set up a modern Python environment (3.10+), install auditing tools (mypy, pydantic), and write a script that processes user data without validatio## Generation Complete

**Statistics:**
- Total Steps: 5
- Prerequisites: 7
- Word Count: 3658
- Code Blocks: 22
- Total Time: 318.882s

**Completed:** 2026-02-12 14:01:02
ntering realistic, imperfect data.

Create a project directory

```bash
mkdir type-safe-python && cd type-safe-python
```

Create and activate a virtual environment (macOS/Linux)

*Run in: `type-safe-python`*

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install initial dependencies for auditing

*Run in: `type-safe-python`*

```bash
pip install mypy pydantic
```

Create the file `vibe_script.py` to simulate a fragile data processing task

*Run in: `type-safe-python`*

```python
# vibe_script.py

def process_user_data(user_data):
    """
    Processes raw user dictionary data and calculates a loyalty score.
    """
    # Assumption 1: 'name' always exists and is a string
    first_name = user_data["name"]["first"]
    
    # Assumption 2: 'orders' is always a list of dictionaries
    total_spent = 0
    for order in user_data["orders"]:
        # Assumption 3: 'amount' is always a float/int
        total_spent += order["amount"]
    
    # Assumption 4: 'status' is a reliable string
    if user_data["status"] == "premium":
        multiplier = 1.5
    else:
        multiplier = 1.0
        
    return {
        "user": first_name,
        "score": total_spent * multiplier
    }

# --- Simulation of "The Vibe" ---

# 1. The "Happy Path" - This works perfectly
good_data = {
    "name": {"first": "Alice", "last": "Smith"},
    "orders": [{"id": 1, "amount": 100}, {"id": 2, "amount": 50}],
    "status": "premium"
}

print(f"Success Case: {process_user_data(good_data)}")

# 2. The "Real World" - This will crash the script
bad_data = {
    "name": "Bob", # Unexpected structure (string instead of dict)
    "orders": None, # Missing list
    "status": "active"
}

print(f"Failure Case: {process_user_data(bad_data)}")
```

Execute the script to observe the failure

*Run in: `type-safe-python`*

```bash
python vibe_script.py
```

**Expected Outcome:** The script will print the success case and then immediately crash with a `TypeError` (specifically `TypeError: string indices must be integers` or similar), confirming the code's fragility when handling unexpected data structures.

**Verify Success:**
1. Check Files: Ensure `vibe_script.py` exists in your directory.
2. Check Environment: Run `pip show mypy` to ensure the auditing tool is installed.
3. Confirm Failure: Ensure that running the script results in a `TypeError`. This confirms you have successfully reproduced a "fragile" state.

**⚠️ Common Issues:**
- Python Version: If you get a syntax error, ensure you are using Python 3.10 or higher (`python --version`).
- Permissions: If you cannot create the virtual environment, ensure you have write permissions in the current folder.
- Mypy results: If you run `mypy vibe_script.py` now, it might not report many errors because the function arguments are untyped (Any).

---

### Step 2: Implementing Static Type Safety with Mypy

In the previous step, we identified that our script relies on 'vibes'—it assumes data structures are correct without verifying them. To transform this into a production-grade component, we must implement Static Type Safety. Static analysis allows us to catch logical errors before the code ever runs. By using Python 3.10+ type hints and the `mypy` type checker in 'strict' mode, we create a verifiable contract for our functions.

We will proceed by annotating function signatures with Python 3.10+ syntax, initializing a strict Mypy configuration, installing the tool, and resolving the initial type errors exposed by the analyzer.

Update function signatures to use Python 3.10+ type hinting syntax (generics and pipe operator).

```python
# Before: Vibe-based
def get_user_data(user_id):
    # ... logic ...
    return data

# After: Type-safe (Python 3.10+)
from typing import Any

def get_user_data(user_id: int) -> dict[str, Any] | None:
    """
    Fetches user data. Returns a dictionary or None if not found.
    Using 'Any' here temporarily as we haven't defined a schema yet.
    """
    # ... logic ...
    return data

def process_tags(tags: list[str]) -> int:
    """Calculates the total length of all tags."""
    return sum(len(tag) for tag in tags)
```

Create a file named `mypy.ini` in the project root to configure strict mode.

```ini
[mypy]
# Python version requirement
python_version = 3.10

# Enable all optional error checks (the gold standard for production)
strict = True

# Ensure we don't ignore imports that don't have type hints
ignore_missing_imports = False

# Show error codes in output (useful for suppressing specific lines if needed)
show_error_codes = True

# Warn about unreachable code or redundant casts
warn_unreachable = True
warn_redundant_casts = True
```

Install mypy via pip and run it against the script.

```bash
# Install mypy
pip install mypy

# Run mypy on your script
mypy processor.py
```

Fix logic to satisfy the type checker (e.g., explicit None checks).

```python
user = get_user_data(123)

# Mypy will complain if you do: print(user["name"])
# Fix:
if user is not None:
    print(user["name"])
else:
    print("User not found")
```

📸 Screenshot of a terminal showing 'Success: no issues found in 1 source file' in green text

**Expected Outcome:** After resolving the errors, running `mypy processor.py` should yield a clean report: 'Success: no issues found in 1 source file'.

**Verify Success:**
1. Verify Version: Run `python --version` to ensure you are on 3.10 or higher.
2. Check Config: Ensure `mypy.ini` exists in the same folder where you run the command.
3. Trigger a Failure: Temporarily change a function call to pass an incorrect type (e.g., `process_tags(123)`). Run `mypy` again; it should catch the error and point to the exact line.

**⚠️ Common Issues:**
- Missing Type Imports: If you use `Any`, `Sequence`, or `Callable`, ensure you import them from `typing`.
- Third-Party Libraries: If you use libraries like `requests` or `pandas` that don't have built-in types, Mypy might complain about "missing library stubs." You may need to install them (e.g., `pip install types-requests`).
- Circular Imports: Adding type hints sometimes requires importing classes from other files, which can cause circular dependencies. Use `if TYPE_CHECKING:` blocks to handle these cases.

---

### Step 3: Enforcing Boundaries with Pydantic Models

While static type hints protect you during development, they vanish at runtime. If an external API sends invalid data, Python might crash or process it incorrectly. In this step, we move from Type Hinting to Data Validation using Pydantic. We will create a 'hard shell' around your logic to ensure that if data enters your functions, it is guaranteed to be valid, correctly typed, and within logical bounds.

Install Pydantic and the email-validator extension.

*Run in: ``*

```bash
pip install pydantic email-validator
```

Open `processor.py` and update the imports and model definitions to replace loose dictionaries with Pydantic `BaseModel` classes.

*Run in: ``*

```python
from pydantic import BaseModel, Field, EmailStr, PositiveInt, ValidationError
from typing import List

# 1. Define the child model first
class OrderItem(BaseModel):
    product_id: int
    # PositiveInt ensures the value is > 0
    quantity: PositiveInt 
    # Field allows for complex validation like 'greater than' (gt)
    price: float = Field(gt=0, description="The unit price must be a positive number")

# 2. Define the parent model
class Order(BaseModel):
    order_id: int
    customer_email: EmailStr  # Validates actual email format (e.g., 'user@domain.com')
    items: List[OrderItem]    # Nested validation: every item in this list must match OrderItem

    @property
    def total_price(self) -> float:
        return sum(item.quantity * item.price for item in self.items)
```

Update the `process_order` function in `processor.py` to accept the `Order` model. Note the use of dot notation instead of dictionary lookups.

*Run in: ``*

```python
def process_order(order: Order) -> str:
    """
    Processes a validated Order model. 
    Logic is now separated from data validation.
    """
    # We can access attributes directly with dot notation
    # No more order["items"] or manual loops with key checks
    item_count = sum(item.quantity for item in order.items)
    
    return (f"Order {order.order_id} for {order.customer_email} processed. "
            f"Total Items: {item_count}, Total Value: ${order.total_price:.2f}")
```

Update the execution block at the bottom of `processor.py` to implement the validation boundary using a try/except block.

*Run in: ``*

```python
def main():
    # Example 1: Valid Data
    raw_data = {
        "order_id": 123,
        "customer_email": "engineering@example.com",
        "items": [
            {"product_id": 1, "quantity": 2, "price": 49.99},
            {"product_id": 2, "quantity": 1, "price": 10.00}
        ]
    }

    # Example 2: Malformed Data (Invalid email and negative price)
    bad_data = {
        "order_id": 456,
        "customer_email": "not-an-email",
        "items": [{"
            "product_id": 3, "quantity": 1, "price": -5.00}]
    }

    for data in [raw_data, bad_data]:
        try:
            # This is the boundary. Pydantic parses and validates simultaneously.
            validated_order = Order(**data)
            result = process_order(validated_order)
            print(f"SUCCESS: {result}")
        except ValidationError as e:
            print(f"VALIDATION ERROR for Order {data.get('order_id')}:")
            # Pydantic provides a clean JSON-like error report
            print(e.json(indent=2))

if __name__ == "__main__":
    main()
```

Run the script to see the validation in action.

*Run in: ``*

```bash
python processor.py
```

**Expected Outcome:** You should see the first order succeed and the second order fail with a highly descriptive error message detailing the invalid email and negative price.

Output:
SUCCESS: Order 123 for engineering@example.com processed. Total Items: 3, Total Value: $109.98
VALIDATION ERROR for Order 456:
[
  {
    "loc": ["customer_email"],
    "msg": "value is not a valid email address",
    "type": "value_error.email"
  },
  {
    "loc": ["items", 0, "price"],
    "msg": "ensure this value is greater than 0",
    "type": "value_error.number.not_gt",
    "ctx": {"limit_value": 0}
  }
]

**Verify Success:**
1. Verify Runtime Enforcement: Change a `quantity` in `raw_data` to a string that cannot be converted to an integer (e.g., "five"). Run the script and ensure Pydantic catches it.
2. Verify Type Coercion: Change a `price` to a string that *can* be converted (e.g., "19.99"). Notice that Pydantic automatically converts it to a `float`.
3. Check Mypy Compatibility: Run `mypy processor.py`. Mypy understands Pydantic models and ensures valid attribute access.

**⚠️ Common Issues:**
- Missing `email-validator`: If you get an error saying `email-validator` is not installed, ensure you ran the pip install command.
- Positional Arguments: Pydantic models should generally be initialized with keyword arguments or dictionary unpacking (`Order(**data)`).
- Mutable Defaults: Never use `items: List[OrderItem] = []`. Use `Field(default_factory=list)` for optional empty lists.

---

### Step 4: Decoupling with Structural Subtyping (Protocols)

In this step, we will implement **Structural Subtyping** using `typing.Protocol` to decouple business logic from specific implementations. Unlike standard inheritance, a Protocol defines a contract based on methods rather than class hierarchy (Static Duck Typing). We will define an `OrderRepository` interface, create a concrete `PostgresOrderRepository`, refactor the `process_order` function to depend on the protocol, and demonstrate testing flexibility with a `MockRepository`.

Open `processor.py` and add the `OrderRepository` protocol definition at the top of the file.

```python
from typing import Protocol, runtime_checkable
from models import Order  # Assuming your Pydantic model is in models.py

@runtime_checkable
class OrderRepository(Protocol):
    """
    A structural contract defining how orders should be persisted.
    Any class with a 'save' method matching this signature satisfies this protocol.
    """
    def save(self, order: Order) -> bool:
        ...

    def get_status(self, order_id: int) -> str:
        ...
```

Add a concrete implementation class `PostgresOrderRepository` to `processor.py`. Note that it does not need to explicitly inherit from the Protocol.

```python
class PostgresOrderRepository:
    """A concrete implementation (e.g., for a production database)."""
    def save(self, order: Order) -> bool:
        print(f"--- [DB] Saving Order {order.order_id} to PostgreSQL ---")
        return True

    def get_status(self, order_id: int) -> str:
        return "stored"
```

Update the `process_order` function signature in `processor.py` to accept any object satisfying the `OrderRepository` protocol.

```python
def process_order(order: Order, repo: OrderRepository) -> None:
    """
    This function is now decoupled. It doesn't know about Postgres;
    it only knows that 'repo' has a .save() method.
    """
    if repo.save(order):
        print(f"SUCCESS: Order {order.order_id} processed and persisted.")
    else:
        print(f"FAILURE: Could not save Order {order.order_id}.")
```

Add a `MockRepository` class and the execution logic to the bottom of `processor.py` to demonstrate swapping implementations.

```python
class MockRepository:
    """A lightweight mock for unit testing or AI-driven simulation."""
    def save(self, order: Order) -> bool:
        return True  # Always succeed for tests

    def get_status(self, order_id: int) -> str:
        return "mock_success"

# --- Execution ---
if __name__ == "__main__":
    from models import Order # Ensure your Pydantic model is imported

    valid_order = Order(
        order_id=123,
        customer_email="engineering@example.com",
        items=[{"item_id": 1, "price": 50.0, "quantity": 1}]
    )

    # We can pass the real DB...
    real_db = PostgresOrderRepository()
    process_order(valid_order, real_db)

    # ...or the Mock DB. Mypy validates both because they follow the Protocol.
    mock_db = MockRepository()
    process_order(valid_order, mock_db)
```

Run Mypy to verify that both the concrete and mock implementations satisfy the Protocol contract.

```bash
mypy processor.py
```

**Expected Outcome:** Mypy should return: `Success: no issues found in 1 source file`.

**Verify Success:**
1. Modify `MockRepository` in `processor.py` by changing the method name from `save` to `persist`.
2. Run `mypy processor.py` again.
3. Verify that Mypy reports an error: `Argument 2 to "process_order" has incompatible type "MockRepository"; expected "OrderRepository"`.

**⚠️ Common Issues:**
- Missing `...` (Ellipsis): In the Protocol definition, methods must have an empty body using `...`, not `pass`.
- Signature Mismatch: The method signatures in the concrete class must match the Protocol exactly (e.g., argument types and names).
- Python Version: Ensure Python 3.10+ is used, or import `Protocol` from `typing_extensions`.

---

### Step 5: The Verifiable Workflow (Final Integration)

In this final step, we move from "it seems to work" to "it is proven to work." We will consolidate the Pydantic models and Protocols into a production-ready module and establish a verification pipeline. This pipeline ensures that any future changes to the code must satisfy both the static type checker (Mypy) and the functional test suite (Pytest).

Create a file named `order_processor.py` containing the hardened data models, protocol, and business logic.

*Run in: `.`*

```python
# order_processor.py
from typing import Protocol, runtime_checkable
from pydantic import BaseModel, EmailStr, Field, PositiveFloat

# 1. Hardened Data Models
class OrderItem(BaseModel):
    name: str
    price: PositiveFloat
    quantity: int = Field(gt=0)

class Order(BaseModel):
    order_id: int
    customer_email: EmailStr
    items: list[OrderItem]

    @property
    def total_price(self) -> float:
        return sum(item.price * item.quantity for item in self.items)

# 2. Structural Boundary (Protocol)
@runtime_checkable
class OrderStorage(Protocol):
    def save(self, order: Order) -> bool:
        """Save the order to a persistent store."""
        ...

# 3. Business Logic
def process_order(order_data: dict, storage: OrderStorage) -> str:
    """
    Validates, calculates, and persists an order.
    This function is now fully type-safe and verifiable.
    """
    # Validation happens at the constructor level
    validated_order = Order(**order_data)
    
    if storage.save(validated_order):
        return f"Order {validated_order.order_id} processed. Total: ${validated_order.total_price:.2f}"
    
    raise RuntimeError("Storage failure")
```

Create a file named `test_order_processor.py` containing the automated test suite.

*Run in: `.`*

```python
# test_order_processor.py
import pytest
from pydantic import ValidationError
from order_processor import Order, process_order

# A Mock storage class that satisfies the OrderStorage Protocol
class MockDatabase:
    def save(self, order: Order) -> bool:
        return True

def test_successful_order_processing():
    valid_data = {
        "order_id": 101,
        "customer_email": "dev@example.com",
        "items": [{"name": "Mechanical Keyboard", "price": 150.0, "quantity": 1}]
    }
    db = MockDatabase()
    result = process_order(valid_data, db)
    assert "processed" in result
    assert "150.00" in result

def test_invalid_email_fails():
    invalid_data = {
        "order_id": 102,
        "customer_email": "not-an-email",
        "items": [{"name": "Mouse", "price": 50.0, "quantity": 1}]
    }
    db = MockDatabase()
    with pytest.raises(ValidationError) as excinfo:
        process_order(invalid_data, db)
    
    # Verify the specific error is caught
    assert "customer_email" in str(excinfo.value)

def test_negative_price_fails():
    invalid_data = {
        "order_id": 103,
        "customer_email": "tester@test.com",
        "items": [{"name": "Freebie", "price": -10.0, "quantity": 1}]
    }
    db = MockDatabase()
    with pytest.raises(ValidationError):
        process_order(invalid_data, db)
```

Install pytest and run the final verification pass (Mypy and Pytest).

*Run in: `.`*

```bash
# Install pytest if you haven't already
pip install pytest

# Stage 1: Static Analysis
mypy order_processor.py

# Stage 2: Functional Testing
pytest test_order_processor.py
```

📸 Terminal window showing the green '3 passed' pytest output and the 'Success' mypy output side-by-side.

**Expected Outcome:** You should see a clean bill of health from both tools. Mypy should output 'Success: no issues found in 1 source file', and Pytest should indicate that 3 tests passed.

**Verify Success:**
1. Break the Types: In `order_processor.py`, change the `process_order` function to return an `int` instead of a `str`. Run `mypy`. It will catch the type mismatch.
2. Break the Logic: In `order_processor.py`, change the `total_price` calculation to use `+` instead of `*`. Run `pytest`. The tests will fail because the math no longer adds up.

**⚠️ Common Issues:**
- Missing `email-validator`: If Pydantic throws an error saying `email-validator` is not installed, run `pip install "pydantic[email]"`.
- Mypy Path Issues: If Mypy can't find your imports, ensure you are running the command from the root directory where your files are located.
- Protocol Errors: If Mypy complains that `MockDatabase` is incompatible with `OrderStorage`, ensure the method signature in `MockDatabase.save` exactly matches the Protocol (including the type hints).

---

## Troubleshooting

### 1. Mypy: "Library stubs not installed"

**Symptoms:**
- error: Library stubs not installed for "requests" (or incompatible with Python 3.10)
- error: Skipping analyzing "yaml": module is installed, but missing library stubs or py.typed marker

**Possible Causes:**
- Many older or smaller libraries do not include a `py.typed` file, meaning Mypy doesn't know how to validate their types.

**Solutions:**
1. Install missing stubs: Run `mypy --install-types` in your terminal to identify and install community-maintained stubs.
2. Manual Install: Install specific stubs via pip (e.g., `pip install types-requests types-PyYAML`).
3. Ignore specific imports: Add `# type: ignore` to the import line or configure `pyproject.toml` to ignore missing imports for specific modules.

### 2. Pydantic: `AttributeError` when using `.dict()` or `.json()`

**Symptoms:**
- AttributeError: 'MyModel' object has no attribute 'dict'
- AttributeError: 'MyModel' object has no attribute 'json'

**Possible Causes:**
- You are likely using Pydantic V2 (standard in modern environments), which renamed these methods to align with Python's naming conventions.

**Solutions:**
1. Update Method Names: Replace `.dict()` with `.model_dump()`.
2. Update JSON Export: Replace `.json()` with `.model_dump_json()`.
3. Check Version: Run `pip show pydantic` to confirm you are on 2.x. If V1 is required, import from `pydantic.v1`.

### 3. Circular Import Errors during Type Hinting

**Symptoms:**
- ImportError: cannot import name 'User' from partially initialized module 'models' (most likely due to a circular import)

**Possible Causes:**
- Python executes imports at runtime. If two files reference each other's classes for type hints, they create a deadlock.

**Solutions:**
1. Use Postponed Evaluation: Add `from __future__ import annotations` at the very top of your file.
2. Use `TYPE_CHECKING` block: Import `TYPE_CHECKING` from `typing` and place circular imports inside an `if TYPE_CHECKING:` block, using string forward references if necessary.

### 4. Protocol Runtime Failures

**Symptoms:**
- TypeError: Instance and class checks can only be used with @runtime_checkable protocols

**Possible Causes:**
- By default, Protocols are for static analysis (Mypy) only and do not exist as "real" classes that `isinstance()` can understand at runtime.

**Solutions:**
1. Add the Decorator: Import `runtime_checkable` from `typing` and apply it to your Protocol class definition.
2. Note: Be aware this adds a small performance overhead as Python must check for the existence of methods at runtime.

### 5. Syntax Errors with the Pipe Operator (`|`)

**Symptoms:**
- SyntaxError: invalid syntax pointing at the `|` character in a type hint

**Possible Causes:**
- You are likely running the script in a Python environment version < 3.10 (e.g., 3.9 or 3.8), or your IDE is configured to an older language server.

**Solutions:**
1. Verify Environment: Run `python --version` in your terminal.
2. Update Environment: Ensure your virtual environment is created with 3.10+ (`python3.10 -m venv venv`).
3. Compatibility Fallback: If you must support older versions, use `from typing import Union` and `Union[int, str]`.

### 6. Mypy "Incompatible return value type" with Protocols

**Symptoms:**
- error: Return type "User" of "get_user" incompatible with return type "BaseUser" in supertype "Repository"

**Possible Causes:**
- This is usually a covariance/contravariance issue. If your Protocol defines a return type, the implementation must return that exact type or a subtype, but Mypy is strict about mutable collections.

**Solutions:**
1. Check Signatures: Ensure the implementation's arguments are exactly the same or more general, and the return type is the same or more specific.
2. Use `Sequence` instead of `List`: If your Protocol returns a `list[str]`, use `typing.Sequence` for read-only data flexibility.

### 7. Pydantic Validation Errors in Production

**Symptoms:**
- pydantic_core._pydantic_core.ValidationError: 1 validation error for MyModel

**Possible Causes:**
- The "vibe-based" script used to ignore extra fields or null values; Pydantic is now enforcing strictness.

**Solutions:**
1. Allow Extra Fields: Configure the model to ignore extra data via `model_config = {"extra": "ignore"}`.
2. Use `Optional` or Defaults: If fields are sometimes missing, ensure they have defaults (e.g., `name: str | None = None`).
3. Graceful Handling: Wrap model instantiation in a `try/except ValidationError` block to log errors instead of crashing.

---

## Next Steps

🎉 Congratulations on completing this tutorial!

### Try These Next
- Wrap your component in a FastAPI service
- Implement 'Property-Based Testing' with Hypothesis
- Add a 'Dry Run' mode with Logging
- Create a 'Gold Dataset' for Evaluation

### Related Resources
- Pydantic V2 Documentation
- The Hypermodern Python Tooling Guide
- Refactoring by Martin Fowler (Python Edition)
- Instructor Library (GitHub)

### Advanced Topics
- Static Analysis with Mypy or Pyright
- Dependency Injection Patterns
- Design by Contract (DbC)
- CI/CD Pipeline Integration

