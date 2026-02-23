**Title:** Temporal Asymmetry in Hybrid Cellular Automata: Modeling Neural Substrates via Layered Agents and Life

**Abstract**
This paper explores the dynamics of the "Binary Coded Layered Automata," a computational simulation that hybridizes mobile agents (Langton’s Ants) with cellular automata (Conway’s Game of Life). By separating the simulation into two distinct temporal layers—a slow-moving structural layer governed by agents and a fast-acting state layer governed by neighbor interactions—the system mimics the relationship between biological neural plasticity and electrochemical activity. We discuss the mechanics of the implementation, specifically the binary rule sets, activation masks, and the emergent complexity resulting from the interplay of static topology and dynamic signal propagation.

[See the implementation](../../assets/layered_automata.html)

---

### 1. Introduction

Cellular Automata (CA) have long been used to model complex systems, from fluid dynamics to biological reproduction. Two of the most famous examples represent opposite ends of the simulation spectrum: **Langton’s Ant**, which utilizes a mobile agent to modify a grid sequentially, and **Conway’s Game of Life**, which updates the entire grid state simultaneously based on neighbor interactions.

The "Binary Coded Layered Automata" laboratory merges these two concepts. It proposes a unifying architectural idea: agents (ants) act as the architects of a network, modifying the global state slowly and locally, while "Life" acts instantly upon this field. This duality was inspired by biological neural networks, where the physical growth of neurons (neuroplasticity) occurs over long timescales, while the firing of action potentials occurs in milliseconds.

### 2. System Architecture and Mechanics

The simulation operates on a multi-state grid where two distinct sets of rules apply simultaneously but at different effective "speeds" and layers of abstraction.

#### 2.1 The Substrate Layer: The Architects (Ants)
The foundation of the system is a multi-colored grid (substrate) ranging from 2 to 8 states. One or more "Ants" traverse this grid. Unlike the classic Langton’s Ant which uses a fixed rule set (e.g., RL), this implementation utilizes a **Binary Movement Rule**.

Each color on the grid corresponds to a bit in a binary string (e.g., `0101`). As an ant steps on a color, it reads the corresponding bit:
*   **0:** Turn Left
*   **1:** Turn Right

The ant then changes the color of the cell and moves forward. This process creates the "topology" of the world. With options for up to 8 ants and synchronization modes (Synchronized vs. Independent rules), the ants weave complex, highway-like structures and fractal boundaries. This layer represents the physical structure of a neural network—the axons and dendrites.

#### 2.2 The Interface Layer: The Activation Mask
The critical innovation in this implementation is the **Life Activation Mask**. This is a binary filter (e.g., `1010`) that determines how the substrate colors interact with the Life layer.

*   **Positive Activation (+):** Specific substrate colors allow "Life" to exist and spawn.
*   **Negative Activation / Inhibition (-):** Other colors actively suppress life.

This mask acts as a selective permeability filter. Just as a neuron will only fire if the chemical environment allows it, "Life" in this simulation can only exist where the ants have laid down the correct "conductive" colors.

#### 2.3 The Signal Layer: Advanced Life
On top of the substrate, a modified version of Conway’s Game of Life runs. However, it does not treat all space as equal. Life evolves *only* on marked substrate cells defined by the Activation Mask.

The implementation extends standard CA rules to accommodate the sparse topology created by the ants:
*   **Search Radius:** Unlike the standard Moore neighborhood (radius 1), this system allows for a radius of 2 or more, simulating the long reach of dendritic trees.
*   **Inhibition Decay:** Inhibited cells decay with a 10% probability per generation, introducing a refractory period similar to a neuron resetting after firing.

### 3. Temporal Dynamics: The Unifying Idea

The profound emergent behavior of this system arises from the difference in timescales between the two layers.

**The Slow Layer (Structure):** The ants move one step per tick. They are path-dependent and historical. To build a "highway" across a 500x500 grid, an ant requires thousands of steps. This models the slow process of **synaptogenesis**—the growth and connection of biological structures.

**The Fast Layer (Function):** The Life simulation evaluates the entire grid every generation. A "glider" or signal can traverse the structures built by the ants almost instantly relative to the speed of the ants. This models **neural activity**—the electrical signals traveling through the established network.

### 4. Emergent Complexity and Biological Parallels

The interaction between these layers produces behaviors that neither system could achieve alone.

#### 4.1 Self-Regulating Networks
In standard Conway’s Life, patterns often stabilize into "ash" (static blocks) or "chaos." In this layered system, the ants constantly disrupt static equilibrium. If the Life layer dies out, the ants continue to reconfigure the substrate until a configuration emerges that supports propagation. Conversely, if the substrate becomes too chaotic, the Inhibition rules (negative activation) can dampen the activity, preventing "epileptic" over-saturation of the grid.

#### 4.2 Guided Propagation
Because Life is constrained to the colors laid down by the ants, the ants effectively draw "wires" for the Life signals to travel along. This mimics the way biological signals are constrained to physical neural pathways. The "Randomize All" and "Random Rule" features in the lab demonstrate that even with stochastic starting conditions, the system tends to self-organize into conductive pathways surrounded by inhibitory zones.

### 5. Conclusion

The "Binary Coded Layered Automata" serves as a compelling abstraction of biological complexity. By decoupling the timescale of structure (Ants) from the timescale of function (Life), it successfully models the "Hardware vs. Software" distinction found in neurology. The ants provide the neuroplasticity, rewriting the rules of the grid, while the Life layer provides the computation, processing information through the transient topology. This implementation demonstrates that rich, organic complexity arises not just from complex rules, but from the interaction of simple rules operating at different temporal velocities.