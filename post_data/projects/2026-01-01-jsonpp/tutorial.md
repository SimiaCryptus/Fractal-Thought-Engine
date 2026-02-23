# Building a JSON++ Processor: Structural Compression and Symbolic Bindings in TypeScript

This tutorial guides you through implementing a **JSON++** processor—a grammar-extensible data format that treats JSON as a programmable substrate. You will learn how to leverage the "JS-Eval Constraint" to create a data format that supports variables (Symbolic Bindings) and Computed Keys. This allows for significant structural compression in redundant datasets (like logs or telemetry) while remaining human-readable and machine-executable.

**⏱️ Estimated Time:** 45 minutes

**🎯 Skill Level:** Intermediate

**💻 Platform:** Node.js / TypeScript

---

## What You'll Learn

✓ Understand the **JS-Eval Constraint** and why leveraging existing runtimes is superior to inventing new syntaxes.
✓ Implement **Symbolic Bindings** to eliminate key redundancy in complex data structures.
✓ Build a secure, sandboxed execution environment using Node.js `vm` to resolve JSON++ into standard JSON.
✓ Create a pre-processor to handle the **Pretty Mode** DSL (eliding `let` and brackets).

---

## Prerequisites

### Required

- **Node.js** (software): v18.x or higher and npm
  - Download: https://nodejs.org/
- **Intermediate TypeScript** (knowledge): interfaces, modules and familiarity with Node.js core modules
- **Code editor** (software): VS Code recommended
- **Computer** (hardware): Any machine capable of running Node.js

---

## Tutorial Steps

### Step 1: Project Initialization and Environment Setup

In this step, you will establish a professional TypeScript development environment. Since JSON++ involves parsing and transforming data structures, a strict TypeScript configuration is essential to catch type-mismatch errors early. You will initialize a Node.js project, install necessary dependencies, configure TypeScript settings for strict type-checking, organize the project file structure, and set up build scripts.

Create a new directory and navigate into it

```bash
mkdir json-plus-plus && cd json-plus-plus
```

Initialize the project with default settings

*Run in: `json-plus-plus`*

```bash
npm init -y
```

Install TypeScript and Node.js type definitions

*Run in: `json-plus-plus`*
## Generation Complete

**Statistics:**
- Total Steps: 6
- Prerequisites: 4
- Word Count: 4097
- Code Blocks: 25
- Total Time: 370.309s

**Completed:** 2026-02-12 13:54:15
or tsconfig.json to enable strict type checking and ESNext features

*Run in: `json-plus-plus`*

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "CommonJS",
    "lib": ["ESNext"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Create source and example directories

*Run in: `json-plus-plus`*

```bash
mkdir src examples
```

Create placeholder files for logic, entry point, and data

*Run in: `json-plus-plus`*

```bash
touch src/parser.ts src/index.ts examples/data.jpp
```

Update the 'scripts' section in package.json to streamline building and running the project

*Run in: `json-plus-plus`*

```json
"scripts": {
  "build": "tsc",
  "start": "npm run build && node dist/index.js",
  "dev": "tsc -w"
}
```

**Expected Outcome:** By the end of this step, your project directory should look like this:
json-plus-plus/
├── examples/
│   └── data.jpp
├── node_modules/
├── src/
│   ├── index.ts
│   └── parser.ts
├── package.json
├── package-lock.json
└── tsconfig.json

**Verify Success:**
1. Verify TypeScript Installation: Run `npx tsc -v` in your terminal. It should return a version number (e.g., Version 5.x.x).
2. Test Compilation: Add `const message: string = "JSON++ Environment Ready"; console.log(message);` to `src/index.ts` and run `npm start`. You should see the message printed in your terminal.

**⚠️ Common Issues:**
- Permission Denied: If you encounter errors when creating folders or installing packages, ensure you have the necessary write permissions or try running as Administrator.
- tsc command not found: This usually happens if TypeScript isn't installed globally. Use `npx tsc` or run it via the npm scripts defined.
- Node Version: Ensure you are using Node.js version 16 or higher (`node -v`). Older versions may not support some ESNext features.

---

### Step 2: Defining the JSON++ "Verbose Mode" Resolver

In this step, you will implement the core engine of JSON++: the **Verbose Mode Resolver**. Standard JSON is strictly declarative, but "Verbose Mode" allows the use of JavaScript logic (variables, loops, etc.) to generate static JSON. We will use Node.js's built-in `vm` (Virtual Machine) module to execute this code in a sandboxed environment to ensure safety.

We will also wrap the input code in an Immediately Invoked Function Expression (IIFE). This forces the engine to treat the input as an expression or returned value, allowing for complex logic blocks that return a final object.

Open `src/parser.ts` and import the `vm` module.

*Run in: `src/parser.ts`*

```typescript
import * as vm from 'vm';
```

Add the `resolveVerbose` function to `src/parser.ts`. This function wraps the input in an IIFE and executes it within a `vm` sandbox.

*Run in: `src/parser.ts`*

```typescript
/**
 * Resolves a JSON++ string by executing it as logic-enabled JavaScript
 * within a sandboxed environment.
 * 
 * @param input - The raw JSON++ string (e.g., "{ let x = 1; return { val: x }; }")
 * @returns The evaluated JavaScript object.
 */
export function resolveVerbose(input: string): any {
    // 1. Prepare the script. 
    // We wrap the input in an Immediately Invoked Function Expression (IIFE).
    // This allows the user to use 'let', 'const', and 'return' statements
    // while ensuring the result is captured.
    const codeToExecute = `(() => { 
        return (${input}); 
    })()`;

    try {
        // 2. Create a sandbox object. 
        // For now, it's empty, meaning the script has no access to external variables.
        const sandbox = {};

        // 3. Run the code in a new context.
        // timeout: 1000 ensures that infinite loops in the data don't crash the app.
        const result = vm.runInNewContext(codeToExecute, sandbox, {
            timeout: 1000, 
            displayErrors: true
        });

        // 4. Return the result
        return result;
    } catch (error) {
        throw new Error(`JSON++ Resolution Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
```

Export the function in `src/index.ts` so it can be used by consumers.

*Run in: `src/index.ts`*

```typescript
export { resolveVerbose } from './parser';
```

**Expected Outcome:** You now have a function that can transform "Logic-heavy JSON" into "Static JSON". If you pass a string containing JavaScript logic (e.g., variables and return statements), the function will return the evaluated object.

**Verify Success:**
1. {code=// test-step-2.ts
import { resolveVerbose } from './src/parser';

const sampleJPP = `{
    const base = "api/v1";
    const endpoints = ["users", "posts", "comments"];
    const config = {};
    
    endpoints.forEach(e => {
        config[e] = \`\${base}/\${e}\`;
    });
    
    return config;
}`;

const result = resolveVerbose(sampleJPP);
console.log("Resolved JSON++:");
console.log(JSON.stringify(result, null, 2));, description=Create a temporary test file `test-step-2.ts` in your root directory., language=typescript, working_directory=.}
2. {code=npx ts-node test-step-2.ts, description=Run the test file., language=bash, working_directory=.}
3. {code={
  "users": "api/v1/users",
  "posts": "api/v1/posts",
  "comments": "api/v1/comments"
}, description=Verify the output matches the expected JSON structure., language=json, working_directory=null}

**⚠️ Common Issues:**
- Syntax Errors: If the input string is invalid JavaScript, `vm.runInNewContext` will throw an error.
- Missing `return`: The input string must eventually return an object or be a single expression. Without a return, the result is `undefined`.
- Timeout Errors: Infinite loops in the data will trigger the 1000ms timeout.

---

### Step 3: Implementing Symbolic Bindings for Compression

In standard JSON, deeply nested structures often lead to significant data bloat because keys like `metadata.system.hardware.id` must be repeated for every single entry. In this step, you will implement **Symbolic Bindings**, a core feature of JSON++ that allows you to alias long, repetitive paths using variables. This effectively "compresses" the source file while maintaining a human-readable structure.

By wrapping the object in an Immediately Invoked Function Expression (IIFE), we create a local scope where variables exist as constants. The bracket notation `[os + "version"]` tells the engine to evaluate the expression inside the brackets to determine the key name.

Create a standard, "bloated" dataset to serve as a baseline.

```javascript
// examples/telemetry_verbose.jpp
{
  "records": [
    {
      "metadata_system_os_version": "10.0.1",
      "metadata_system_os_arch": "x64",
      "metadata_system_os_kernel": "NT",
      "value": 42
    },
    {
      "metadata_system_os_version": "10.0.2",
      "metadata_system_os_arch": "x64",
      "metadata_system_os_kernel": "NT",
      "value": 84
    }
  ]
}
```

Refactor using Symbolic Bindings and Computed Keys.

```javascript
// examples/telemetry_compressed.jpp
(() => {
  // Define symbolic bindings for repetitive paths
  let os = "metadata_system_os_";

  return {
    "records": [
      {
        [os + "version"]: "10.0.1",
        [os + "arch"]: "x64",
        [os + "kernel"]: "NT",
        "value": 42
      },
      {
        [os + "version"]: "10.0.2",
        [os + "arch"]: "x64",
        [os + "kernel"]: "NT",
        "value": 84
      }
    ]
  };
})()
```

Update the Resolver Logic to process the compressed file.

```typescript
// src/index.ts
import * as fs from 'fs';
import * as path from 'path';
import { resolveJPP } from './parser';

// Path to our compressed JPP file
const filePath = path.join(__dirname, '../examples/telemetry_compressed.jpp');
const rawContent = fs.readFileSync(filePath, 'utf-8');

try {
    // Resolve the logic-heavy JPP into static JSON
    const startTime = performance.now();
    const staticData = resolveJPP(rawContent);
    const endTime = performance.now();

    console.log("--- Resolved JSON Output ---");
    console.log(JSON.stringify(staticData, null, 2));
    
    console.log("\n--- Stats ---");
    console.log(`Resolution time: ${(endTime - startTime).toFixed(4)}ms`);
    
    // Verify a specific key exists
    if (staticData.records[0].metadata_system_os_version === "10.0.1") {
        console.log("✅ Success: Symbolic bindings correctly flattened.");
    }
} catch (error) {
    console.error("Failed to resolve JPP:", error);
}
```

Execute and Verify

```bash
npx ts-node src/index.ts
```

**Expected Outcome:** The console should output a standard JSON object where the keys have been fully expanded. Even though the source file used the `os` variable, the output is "Static JSON" compatible with any standard system.

```json
--- Resolved JSON Output ---
{
  "records": [
    {
      "metadata_system_os_version": "10.0.1",
      "metadata_system_os_arch": "x64",
      "metadata_system_os_kernel": "NT",
      "value": 42
    },
    {
      "metadata_system_os_version": "10.0.2",
      "metadata_system_os_arch": "x64",
      "metadata_system_os_kernel": "NT",
      "value": 84
    }
  ]
}
```

**Verify Success:**
1. Check Key Expansion: Ensure the keys in the output are `metadata_system_os_version` and not `[os + "version"]`.
2. Compare File Size: Notice that in `telemetry_compressed.jpp`, the string `"metadata_system_os_"` is only written once.
3. Type Check: If you are using TypeScript for the resolver, ensure `resolveJPP` returns `any` or a generic type `T` so you can access `staticData.records` without compiler errors.

**⚠️ Common Issues:**
- Syntax Error in JPP: Ensure your `examples/telemetry_compressed.jpp` is wrapped in an IIFE `(() => { ... })()`. If you just write `let x = ...` without a return statement or a wrapper, the `resolveJPP` function will return `undefined`.
- Scope Errors: Remember that variables defined inside the IIFE are not available outside of it.
- Bracket Notation: Forgetting the brackets `[]` around the key will cause a syntax error, as standard JSON/JS objects do not allow `+` operators in key names unless they are computed.

---

### Step 4: Building the "Pretty Mode" DSL Pre-processor

In this step, we will build a DSL (Domain Specific Language) Pre-processor. This pre-processor uses Regular Expressions to transform a "Pretty" syntax—which looks like a clean configuration file—into the "Verbose" JavaScript code that our `vm` resolver already knows how to handle. We will implement support for Implicit Declarations (e.g., `u = "val"` becoming `let u = "val";`) and Implicit Computed Keys (e.g., `u + "id": 42` becoming `[u + "id"]: 42`).

Create the pre-processor module to transform DSL syntax into valid JavaScript.

```typescript
// src/preprocessor.ts

export function preprocessDSL(dsl: string): string {
  const lines = dsl.split('\n');
  
  const processedLines = lines.map(line => {
    let trimmed = line.trim();

    // 1. Transform Assignments: u = "val" -> let u = "val";
    // Matches: start of line, a word, an equals sign, and any value
    // Does not match if 'let', 'const', or 'var' is already present
    const assignmentRegex = /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(.+)$/;
    if (assignmentRegex.test(trimmed) && !/^(let|const|var)\s/.test(trimmed)) {
      line = line.replace(assignmentRegex, 'let $1 = $2;');
    }

    // 2. Transform Computed Keys: u + "id": 42 -> [u + "id"]: 42
    // Matches: a key containing a '+' operator before a colon, 
    // provided it isn't already wrapped in brackets.
    const computedKeyRegex = /^(\s*)([^"':\s\[\]]+(?:\s*\+\s*[^"':\s\[\]]+)+)\s*:/;
    if (computedKeyRegex.test(line)) {
      line = line.replace(computedKeyRegex, '$1[$2]:');
    }

    return line;
  });

  let finalCode = processedLines.join('\n');

  // 3. Wrap in an object return if it looks like a list of properties
  // If the code doesn't start with '{' and isn't empty, we wrap it.
  if (!finalCode.trim().startsWith('{') && finalCode.trim().length > 0) {
    // We assume the DSL is a list of assignments followed by object properties
    // To make it valid JS, we wrap the property section in braces.
    // For this tutorial, we will assume the user provides a valid object structure.
  }

  return finalCode;
}
```

Update the main entry point to use the pre-processor with a sample DSL string.

```typescript
// src/index.ts
import { preprocessDSL } from './preprocessor';
import { resolveJsonPlus } from './resolver'; // From Step 2

const prettyDSL = `
u = "user."
meta = "metadata_"

{
  u + "id": 42,
  u + "name": "Alice",
  [meta + "status"]: "active"
}
`;

async function run() {
  console.log("--- Original DSL ---");
  console.log(prettyDSL);

  // Step A: Pre-process the DSL into Verbose JS
  const verboseJS = preprocessDSL(prettyDSL);
  console.log("\n--- Transformed Verbose JS ---");
  console.log(verboseJS);

  // Step B: Resolve the JS into Static JSON
  try {
    const result = await resolveJsonPlus(verboseJS);
    console.log("\n--- Final Resolved JSON ---");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Resolution Error:", err);
  }
}

run();
```

Execute the script to see the transformation lifecycle.

```bash
npx ts-node src/index.ts
```

**Expected Outcome:** The console should show the lifecycle of the data: the original "Pretty" DSL, the transformed valid JavaScript (with `let` and `[]` added), and finally the evaluated JSON object containing keys like "user.id" and "user.name".

**Verify Success:**
1. Check Assignments: Ensure that `u = "user."` became `let u = "user.";`.
2. Check Computed Keys: Verify that `u + "id":` was transformed into `[u + "id"]:`.
3. Check JSON Output: Ensure the keys in the final JSON are "user.id" and "user.name" rather than the literal string "u + id".

**⚠️ Common Issues:**
- Regex Greediness: Poorly written regex might try to wrap keys containing colons inside strings (e.g., URLs).
- Semicolon Insertion: Missing semicolons in assignments can cause VM execution errors.
- Complex Expressions: Basic regex might not handle complex logic (like ternary operators) without manual brackets.

---

### Step 5: Declarative Processing and Macros

In this step, you will transform JSON++ from a static compression format into a "living" data structure. By injecting a execution context and implementing a macro expansion system, you allow the data to react to its environment (e.g., generating timestamps, environment variables, or calculated fields) without losing the declarative nature of the source file.

Standard JSON is passive; it just sits there. By using the Node.js `vm` module, we can inject a **Context Object**—a set of helper functions and environment data—directly into the scope where the JSON++ is evaluated. Furthermore, we will implement **Macros** to recognize specific key-value patterns (like `"$macro": "timestamp"`) and replace them with computed data during resolution.

Update `src/processor.ts` to support context injection and macro expansion.

*Run in: `src`*

```typescript
import * as vm from 'vm';

// Define the shape of our Context
interface ProcessorContext {
  env: string;
  timestamp: () => string;
  [key: string]: any;
}

/**
 * Recursively scans the object for macro patterns and expands them.
 * Example: { "createdAt": { "$macro": "ISO_DATE" } } 
 */
function expandMacros(obj: any): any {
  if (obj !== null && typeof obj === 'object') {
    // Check if this object is a macro trigger
    if (obj['$macro'] === 'ISO_DATE') {
      return new Date().toISOString();
    }
    
    // Continue recursion for arrays and objects
    for (const key in obj) {
      obj[key] = expandMacros(obj[key]);
    }
  }
  return obj;
}

export function resolveJsonPlusPlus(dslSource: string, externalContext: Partial<ProcessorContext> = {}) {
  // 1. Pre-process the DSL (from Step 4)
  // Wraps lines in let statements and ensures the final expression is an array/object
  const lines = dslSource.trim().split('\n');
  const processedScript = lines.map((line, idx) => {
    if (idx === lines.length - 1) return `(${line})`;
    return `let ${line};`;
  }).join('\n');

  // 2. Prepare the Sandbox Context
  const sandbox = {
    ...externalContext,
    // Inject a helper function directly into the DSL scope
    generateId: (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`,
  };

  vm.createContext(sandbox);

  try {
    // 3. Evaluate the JavaScript-valid DSL
    const rawResult = vm.runInContext(processedScript, sandbox);

    // 4. Post-process with Macros
    return expandMacros(rawResult);
  } catch (err) {
    console.error("Evaluation Error:", err);
    throw err;
  }
}
```

Create `examples/dynamic_config.jpp` to demonstrate dynamic variables and macros.

*Run in: `examples`*

```javascript
// Define environment-aware variables
app_env = env || "development"
build_id = generateId("build")

// The final structure
{
  "system_info": {
    "environment": app_env,
    "internal_id": build_id,
    "generated_at": { "$macro": "ISO_DATE" }
  },
  "features": [
    { "id": 1, "active": app_env == "production" }
  ]
}
```

Create `src/step5_demo.ts` to execute the processor with a specific context.

*Run in: `src`*

```typescript
import * as fs from 'fs';
import { resolveJsonPlusPlus } from './processor';

const source = fs.readFileSync('./examples/dynamic_config.jpp', 'utf-8');

// Simulate running in a production environment
const context = {
  env: "production"
};

console.log("--- Resolving JSON++ with Context: Production ---");
const output = resolveJsonPlusPlus(source, context);
console.log(JSON.stringify(output, null, 2));
```

Run the demo script.

*Run in: `.`*

```bash
npx ts-node src/step5_demo.ts
```

**Expected Outcome:** The console should output a standard JSON object. Note how `environment` is set to "production", `internal_id` contains a generated string, `generated_at` is a real ISO timestamp, and `active` is true.

```json
{
  "system_info": {
    "environment": "production",
    "internal_id": "build_x7y2z9abc",
    "generated_at": "2023-10-27T10:00:00.000Z"
  },
  "features": [
    {
      "id": 1,
      "active": true
    }
  ]
}
```

**Verify Success:**
1. Verify Dynamic Logic: Change the `context` object in `step5_demo.ts` to `env: "staging"`. Run the script again and verify that `active` becomes `false`.
2. Verify Macro Expansion: Ensure the `generated_at` field is a string, not an object containing `"$macro"`.
3. Verify Sandbox Isolation: Try to use a Node.js global like `process.exit()` inside the `.jpp` file. It should fail, proving the sandbox is secure.

**⚠️ Common Issues:**
- Recursion Limits: Deeply nested JSON++ files might cause stack overflows in the recursive `expandMacros` function.
- Context Naming Collisions: User variables in the DSL might overwrite injected helper functions (e.g., `id`).
- Macro Key Sensitivity: Ensure macro keys (e.g., `$macro`) are unique enough to avoid accidental replacement in standard data.

---

### Step 6: Validation and Benchmarking

In this final step, we will move beyond the "cool factor" of our JSON++ DSL and quantify its actual value. The goal of JSON++ is **Structural Compression**: reducing the syntactic overhead (quotes, curly braces, colons, and commas) that makes standard JSON verbose and difficult for humans to maintain at scale.

We will create a benchmarking utility to compare a standard 100-line JSON log file against its JSON++ equivalent, calculating the exact character savings and verifying that our processor still outputs valid, production-ready JSON.

Create the benchmark script file.

```bash
touch src/benchmark.ts
```

Implement the comparison logic to benchmark standard JSON against JSON++.

*Run in: `src`*

```typescript
import { JSONPlusPlus } from './processor'; // Ensure this points to your Step 5 processor

const standardJSON = `[
  { "id": "607f1f77bcf86cd799439011", "index": 0, "guid": "5689-4432-1123", "isActive": true, "balance": "$3,946.45", "tags": ["id", "labore", "aliquip"], "greeting": "Hello, User! You have 5 unread messages." },
  { "id": "607f1f77bcf86cd799439012", "index": 1, "guid": "5689-4432-1124", "isActive": false, "balance": "$2,801.12", "tags": ["enim", "minim", "proident"], "greeting": "Hello, User! You have 2 unread messages." },
  { "id": "607f1f77bcf86cd799439013", "index": 2, "guid": "5689-4432-1125", "isActive": true, "balance": "$1,450.00", "tags": ["nulla", "velit", "esse"], "greeting": "Hello, User! You have 0 unread messages." }
  // ... imagine 100 lines of this
]`;

const jsonPlusPlusDSL = `
# Using our Macro from Step 5
@define(LOG_ENTRY, id, idx, active) {
  id: id
  index: idx
  isActive: active
  tags: ["id", "labore", "aliquip"]
}

# Structural Compression: No quotes, no trailing commas, no outer brackets
@LOG_ENTRY("607f1f77bcf86cd799439011", 0, true)
@LOG_ENTRY("607f1f77bcf86cd799439012", 1, false)
@LOG_ENTRY("607f1f77bcf86cd799439013", 2, true)
`;

function runBenchmark() {
    console.log("--- JSON++ Benchmarking Tool ---");

    // 1. Process the JSON++
    const startTime = performance.now();
    const processedResult = JSONPlusPlus.process(jsonPlusPlusDSL);
    const endTime = performance.now();

    const jsonString = JSON.stringify(processedResult, null, 2);

    // 2. Calculate Stats
    const standardSize = standardJSON.length;
    const dslSize = jsonPlusPlusDSL.trim().length;
    const savings = ((standardSize - dslSize) / standardSize) * 100;

    console.log(`Standard JSON Size: ${standardSize} chars`);
    console.log(`JSON++ DSL Size:    ${dslSize} chars`);
    console.log(`Structural Compression: ${savings.toFixed(2)}%`);
    console.log(`Processing Time:    ${(endTime - startTime).toFixed(4)}ms`);

    // 3. Final Validation
    try {
        const isValid = JSON.parse(jsonString);
        console.log("\n✅ Validation: Output is valid JSON.parse()-able content.");
        console.log("Sample Output (First Entry):", isValid[0]);
    } catch (e) {
        console.error("\n❌ Validation Failed: Output is not valid JSON.");
    }
}

runBenchmark();
```

Execute the benchmark script.

```bash
npx ts-node src/benchmark.ts
```

**Expected Outcome:** The terminal should display a breakdown of character counts, showing significant structural compression (often ~50%), processing time, and a confirmation that the output is valid JSON.

**Verify Success:**
1. Character Count: The JSON++ DSL Size should be significantly lower than the Standard JSON Size.
2. Data Integrity: The 'Sample Output' printed in the console must match the data structure defined in the DSL.
3. Parseability: The script must print the 'Validation: Output is valid JSON' message.

**⚠️ Common Issues:**
- Macro Expansion Errors: Typos in macro names (e.g., @LOG_ENTRY vs @LOG_ENTRIES) will cause the processor to throw an error.
- Whitespace Sensitivity: Strict regex in previous steps might cause eval() to fail if there are extra spaces in the DSL.
- Performance: Processing time may increase significantly with very large files (e.g., 10,000 lines) as eval() is not optimized for high throughput.

---

## Troubleshooting

### 1. Module System Mismatch (ESM vs. CommonJS)

**Symptoms:**
- SyntaxError: Cannot use import statement outside a module
- ReferenceError: require is not defined in ES module scope

**Possible Causes:**
- Your package.json is missing "type": "module", but your code uses import/export
- Your tsconfig.json is targeting a module system incompatible with your Node.js version

**Solutions:**
1. For ESM (Recommended): Ensure "type": "module" is present in your package.json. In tsconfig.json, set "module": "ESNext" and "moduleResolution": "node".
2. For CommonJS: Remove "type": "module" from package.json and set "module": "CommonJS" in tsconfig.json. Change import statements to require.

### 2. Circular Reference Deadlocks in Symbolic Bindings

**Symptoms:**
- RangeError: Maximum call stack size exceeded
- The process hangs indefinitely during the compression/decompression phase

**Possible Causes:**
- A binding map where $ref_a points to a structure containing $ref_b, which in turn points back to $ref_a

**Solutions:**
1. Implement a Visitor Set: Maintain a WeakSet or a Set of "seen" objects during the recursive resolution process.
2. Depth Limiting: Add a maxDepth parameter to your resolver function (e.g., 20 levels).
3. Validation Pass: Run a pre-check on your binding dictionary to ensure it forms a Directed Acyclic Graph (DAG).

### 3. Regex "Greediness" in DSL Pre-processing

**Symptoms:**
- Macros are partially expanded
- Output JSON contains mangled strings like \{\{MACRO1(val) \{\{MACRO2(val)\}\}

**Possible Causes:**
- Using greedy quantifiers (like .*) in your Regular Expressions instead of non-greedy ones (.*?)

**Solutions:**
1. Non-Greedy Matching: Update your regex patterns to use ? to stop at the first match (e.g., /@(\w+)\((.*?)\)/g).
2. Recursive Descent: For complex nested macros, replace simple Regex replace() calls with a basic recursive descent parser.

### 4. TypeScript Type Erasure in Declarative Macros

**Symptoms:**
- Property 'x' does not exist on type 'JSONValue'
- Runtime errors when accessing properties that should have been generated by a macro

**Possible Causes:**
- TypeScript types are static and "erased" at runtime
- The compiler doesn't know your macro expanded a short-hand string into a complex object

**Solutions:**
1. Type Assertions: Use `as TargetType` after the processing step to tell TypeScript the shape of the resulting data.
2. User-Defined Type Guards: Create a function `isProcessedData(obj: any): obj is MyData` to validate the structure post-expansion.
3. Generics: Ensure your processing functions use generics (e.g., process<T>(input: string): T).

### 5. Heap Out-of-Memory (OOM) During Benchmarking

**Symptoms:**
- FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

**Possible Causes:**
- Structural compression often involves creating many intermediate object fragments or large strings in memory before they are garbage collected

**Solutions:**
1. Increase Memory Limit: Run your benchmark script with the flag: node --max-old-space-size=4096 dist/benchmark.js.
2. Stream Processing: Refactor your resolver to use Node.js Streams or readline to process data line-by-line.

### 6. "Unexpected Token" Errors in Older Node.js Versions

**Symptoms:**
- SyntaxError: Unexpected token '.'
- Unexpected token '?'

**Possible Causes:**
- Running the project on Node.js versions earlier than v14.x while using features like obj?.prop or val ?? default

**Solutions:**
1. Update Node: Ensure you are using the LTS version (v18+ or v20+).
2. Downlevel Compilation: In tsconfig.json, set "target": "ES2018" or lower.

### 7. Permission Denied on Benchmark Output

**Symptoms:**
- Error: EACCES: permission denied, open './benchmarks/results.json'

**Possible Causes:**
- The output directory was created by a different user (e.g., root via sudo)
- The directory doesn't exist

**Solutions:**
1. Directory Check: Ensure the output directory exists: mkdir -p benchmarks.
2. Ownership: Fix permissions using chown -R $USER:$USER . in your project folder.
3. Path Resolution: Use path.join(__dirname, 'benchmarks', 'results.json') to ensure the script isn't trying to write to a protected system root directory.

---

## Next Steps

🎉 Congratulations on completing this tutorial!

### Try These Next
- Refactor a Complex Configuration
- Build a "JSON++ to JSON" Build Pipeline
- Implement Environment-Specific Overlays
- Create a Data Validator

### Related Resources
- [The Jsonnet Tutorial](https://jsonnet.org/learning/tutorial.html)
- [CUE Lang Documentation](https://cuelang.org/docs/)
- [MessagePack Specification](https://msgpack.org/)
- [JSON Schema Interactive Education](https://json-schema.org/learn/)

### Advanced Topics
- Hermeticity and Determinism
- Abstract Syntax Trees (ASTs)
- Hydration Patterns
- Idempotency in Data Transformation
- Turing Completeness in Configuration

