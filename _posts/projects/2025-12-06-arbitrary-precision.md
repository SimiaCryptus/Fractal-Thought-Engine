---
title: 'Design Document: Kotlin Exact Real Arithmetic Toolkit'
layout: post
date: '"2025-12-06T00:00:00.000Z"'
last_modified: '"2025-12-06T10:00:00.000Z"'
category: projects
subcategory: Engineering & Formal Systems
tags:
  - Software Engineering
  - Kotlin
  - Algorithms
  - Technical Spec
keywords:
  - Kotlin
  - exact real arithmetic
  - arbitrary precision
  - constructive mathematics
  - lazy evaluation
  - computable functions
  - BigInteger
  - BigDecimal alternative
  - numerical analysis
status: stable
last_thought_date: '"2025-12-06T00:00:00.000Z"'
thought_generation: 1
reading_time_minutes: 8
difficulty_level: advanced
document_type: framework
thinking_style: mathematical
cognitive_load: intense
description: >-
  A design document for a Kotlin library implementing Constructive Real
  Arithmetic, focusing on exactness, lazy evaluation, and arbitrary precision
  for real numbers.
excerpt: >-
  This document outlines the design of a Kotlin library for Constructive Real
  Arithmetic, treating numbers as computable functions. It details the core
  philosophy of exactness and lazy evaluation, the type hierarchy (KInteger,
  KRational, KReal), architectural considerations like the genealogy tree, and
  algorithmic implementations for fundamental and transcendental functions. The
  API specification and roadmap are also covered.
meta_title: Kotlin Exact Real Arithmetic Toolkit Design Document
meta_description: >-
  Explore the design of a Kotlin library for exact real arithmetic, featuring
  lazy evaluation, arbitrary precision, and a computation graph for representing
  real numbers like sqrt(2) and Pi.
og_title: 'Kotlin Exact Real Arithmetic: A Design Overview'
og_description: >-
  Dive into the architectural and algorithmic design of a Kotlin library for
  exact real arithmetic, emphasizing constructive mathematics and lazy
  evaluation.
related_documents:
  - _posts/projects/2025-08-08-spiral-number-system.md
  - _posts/phenomenology/2025-11-20-numeral-evolution-theory.md
  - _posts/projects/2025-11-22-parameric-manifolds.md
---
# Design Document: Kotlin Exact Real Arithmetic Toolkit

## 1. Overview
This library provides a framework for **Constructive Real Arithmetic** in Kotlin. Unlike standard floating-point libraries (IEEE 754) or standard arbitrary-precision libraries (`BigDecimal`), this toolkit treats numbers as **computable functions** rather than static bit patterns.

A Real number is defined not by its value, but by the genealogy of operations that created it. Precision is not decided at creation time; it is decided at **evaluation time**.

## 2. Core Philosophy
1.  **Exactness by Default:** Intermediate operations (addition, multiplication, composition) are symbolic and introduce no rounding errors.
2.  **Lazy Evaluation:** Computation is deferred until a specific precision is requested (e.g., "Give me $\pi$ to 10,000 decimal places").
3.  **Explicit Precision Context:** The user defines the required precision only when extracting data (converting to String or Byte stream).
4.  **No Equality:** Due to the undecidability of the "Zero Determination Problem" in exact arithmetic, strict equality checks (`==`) are not supported for Real numbers.

## 3. Type Hierarchy

The library is built on a strict mathematical hierarchy.

### 3.1 `KInteger` (Exact)
*   **Backing:** Wraps `java.math.BigInteger`.
*   **Precision:** Infinite magnitude, exact precision (scale 0).
*   **Behavior:** Acts as the atomic unit of the system.

### 3.2 `KRational` (Exact)
*   **Backing:** A pair of `KInteger`s (numerator $p$, denominator $q$).
*   **Behavior:** Automatically simplifies fractions ($2/4 \to 1/2$). Handles all basic arithmetic ($+, -, *, /$) exactly without loss of precision.
*   **Role:** The bridge between discrete math and continuous math.

### 3.3 `KReal` (Computed)
*   **Backing:** An Abstract Syntax Tree (AST) / Directed Acyclic Graph (DAG) representing the computation history.
*   **Behavior:** Lazy. Represents values like $\sqrt{2}$, $\pi$, $e$, or $sin(10^{50})$.
*   **Interface:**
    *   `KInteger` and `KRational` implement the `KReal` interface.
    *   Operations on `KReal` return new `KReal` nodes (building the tree).

## 4. Architecture & Memory Model

### 4.1 The Genealogy Tree
Every operation creates a new node in a computation graph.
*   **Leaf Nodes:** Constants (`KInteger`, `KRational`, Predefined Constants like $\pi$).
*   **Composite Nodes:** Operations (`AddNode`, `MultNode`, `SinNode`, `ExpNode`).

**Example:**
```kotlin
val a = KReal(2)
val b = a.sqrt()
val c = b + KReal.PI
// c is not a number yet; it is a tree: Add(Sqrt(2), PI)
```

### 4.2 Memory Strategy ("Let it Explode")
*   **Current State:** The library does not automatically prune, simplify, or checkpoint the expression tree.
*   **Implication:** Iterative algorithms (loops) will increase tree depth linearly.
*   **User Responsibility:** If the user creates a loop of 1,000,000 iterations, the library will construct a tree 1,000,000 nodes deep. Evaluation may cause a `StackOverflowError` or `OutOfMemoryError`.
*   **Future Optimization:** Explicit `checkpoint()` methods may be added later to force intermediate evaluation and collapse the tree.

## 5. Algorithmic Implementation

To ensure performance at high precision, the library avoids naive Taylor series where possible, favoring quadratically convergent algorithms.

### 5.1 Fundamental Operations
*   **Addition/Subtraction:** Exact for Rationals; propagates precision demand for Reals.
*   **Multiplication:** Karatsuba or Schönhage-Strassen (via underlying BigInt implementation).
*   **Division:** Newton-Raphson iteration (computes $1/x$ and multiplies).

### 5.2 Transcendental Functions
*   **Square Root:** Newton's Method ($x_{n+1} = \frac{1}{2}(x_n + \frac{S}{x_n})$).
*   **Pi ($\pi$):** Chudnovsky Algorithm or Gauss-Legendre (AGM).
*   **Exp / Log:** Arithmetic-Geometric Mean (AGM) based transformations.
*   **Trigonometry:**
    *   **Argument Reduction:** Reduce large inputs using a high-precision $\pi$.
    *   **Calculation:** Taylor series (for small arguments) or Newton iteration on inverse trig functions.
### 5.3 Periodic Precision & Composability
To handle Rationals and similar fields exactly, the library accounts for **periodic precision generation**.
*   **Cycle Detection:** Division operations track remainders to identify repeating decimal cycles (e.g., $1/7 \to \overline{142857}$).
*   **Composability:** Operations between two periodic numbers (Rational + Rational) synthesize a new periodic sequence by computing the LCM of cycle lengths, maintaining exactness without falling back to generic infinite streams.


## 6. API Specification (Kotlin)

### 6.1 Construction
```kotlin
val i = 100.toKInteger()
val r = "1.2345".toKRational() // Parses to 12345/10000
val x = KReal.PI
val y = KReal.E
```

### 6.2 Operations
Standard Kotlin operator overloading is used.
```kotlin
val res = (x * 2) + (y.pow(2)) - (i / 3)
val trig = x.sin() * x.cos()
```

### 6.3 Comparison (The "No Equality" Rule)
The `equals()` / `==` method will throw `UnsupportedOperationException` for `KReal`.

**Supported Comparisons:**
```kotlin
// Check if x > y (may run forever if x is extremely close to y)
if (x > y) { ... }

// Check if x is effectively equal to y within a specific tolerance
if (x.eq(y, precision = 100)) { ... } // Checks 100 bits of precision
```

### 6.4 Evaluation & Output
This is where the work happens.

```kotlin
// 1. Get a string representation to specific decimal places
val str = x.toString(precision = 500) // 500 decimal digits

// 2. Get a standard Double (lossy)
val dbl = x.toDouble()

// 3. Generate an infinite sequence of digits
val digits: Sequence<Int> = x.digitStream()
digits.take(1000).forEach { print(it) }
```

## 7. Internal Representation: The `PrecisionContext`

When `eval()` is called, a `PrecisionContext` is passed down the tree.

1.  **Request:** User asks for `x` to 100 bits.
2.  **Propagation:**
    *   If `x = a + b`, `x` might ask `a` and `b` for 105 bits (guard digits to prevent error accumulation).
    *   If `x = a * b`, precision demands are dynamic based on the magnitude of operands.
3.  **Calculation:** Leaf nodes return `BigFloat` (Mantissa + Exponent) approximations.

## 8. Roadmap & Limitations

1.  **Zero Detection:** Checking if a number is exactly zero is theoretically impossible for general constructive reals. The library assumes non-zero unless proven otherwise within a computation limit.
2.  **Performance:** Deep recursion trees will be slow.
3.  **Caching:** Currently, re-evaluating `x` at a higher precision recalculates from scratch. Future versions will implement memoization to reuse previous lower-precision computations.
