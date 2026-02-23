# Computational Ethics: A Field Theory of Moral Operators

## Introduction: The Shift to Moral Physics

Traditional ethical discourse has long been mired in the metaphysical—debating the subjective nature of "good" and "
evil" as if they were ethereal substances. In the era of high-frequency multi-agent systems and autonomous intelligence,
this approach is no longer sufficient. We must transition from moral philosophy to **Moral Systems Engineering**: the
application of rigorous control theory and network dynamics to the problem of value alignment.

Ethics can be rigorously framed as a field theory. In this paradigm, "evil" is not a spooky metaphysical force but a
measurable distortion in a multi-agent reward manifold. By treating moral valence as a structural property of system
architectures, we move toward a "moral physics" that analyzes how harm and benefit propagate through complex social and
computational topologies, governed by definable operators rather than ambiguous intent.

## The Anatomy of the Pathological: Functional Definitions

We define "evil" functionally as a **systematic pattern of structural harm**. It is not merely an event, but a stable
process where a system extracts value from its constituents or environment while suppressing the feedback signals that
would normally inhibit such damage.

This stability is maintained through **Justification Loops**—recursive information structures that normalize pathology.
Whether in a human mind or an algorithmic objective function, a Justification Loop reinterprets harm as necessity,
efficiency, or justice. It acts as a cognitive or computational moat, preventing the system from recognizing the reality
of the damage it inflicts. Thus, the study of evil becomes the study of these loops: how they form, how they decouple
agents from ground truth, and how they can be dismantled.

## The Operator Algebra: Graph-Theoretic Formulation

To move beyond metaphor, we reject the continuous integral formulation in favor of a discrete, graph-theoretic model.
This allows us to capture the specific topology of harm—who hurts whom, and who notices. We model the moral field using
a multi-agent reward manifold defined by four key components.

### 1. The Sparse Relevance Matrix ($W$)

Not all agents matter equally to all others at all times. We define a relevance matrix $W_{ij}(s)$ representing the
weight agent $j$ assigns to agent $i$'s well-being in state $s$. This matrix is typically **sparse** (most agents are
indifferent to distant others) and **dynamic**.

### 2. Perceived Reward Tensors ($\hat{r}$)

Objective reality is filtered through perception. Let $r_i(s)$ be the true reward of agent $i$. We define the perceived
reward tensor $\hat{r}_i^{(j)}(s)$ as agent $j$'s estimate of agent $i$'s reward.

* **Perception Gaps:** $\hat{r}_i^{(j)} \neq r_i$ implies a failure of empathy or information.
* **Justification:** An agent may perceive a harm to another as a benefit or neutral event due to internal distortion
  functions.

### 3. The Local Evil Density ($\epsilon$)

We define the instantaneous "evil" of a state transition $s \to s'$ not as abstract badness, but as the
relevance-weighted sum of perceived negative reward deltas. It is the aggregate "bad news" propagating through the
network:

$$\epsilon(s \to s') = \sum_{j=1}^N \sum_{i=1}^N W_{ij}(s) \cdot \text{ReLU}\left( - \Delta \hat{r}_i^{(j)} \right)$$

Where $\Delta \hat{r}_i^{(j)} = \hat{r}_i^{(j)}(s') - \hat{r}_i^{(j)}(s)$. The ReLU function $(x)_+$ ensures we only
count negative deviations (harm), consistent with the asymmetry of suffering.

### 4. The Trajectory Functional ($E[\pi]$)

The total moral cost of a policy or history $\pi$ is the discounted sum of local evil density over time. This
functional $E[\pi]$ represents the system's accumulated structural harm:

$$E[\pi] = \sum_{t=0}^{T-1} \gamma^t \epsilon(s_t \to s_{t+1})$$

Minimizing $E[\pi]$ is the primary objective of a morally aligned system, distinct from maximizing total global reward (
which can be achieved by utility monsters).

## Topological Dynamics: Graphs and Substrates

The moral field does not exist on a regular grid; it operates on a dual-layer topology.

### 1. Sparse Relevance Graphs

Most agents are morally "blind" to one another due to structural limitations. The relevance matrix $W$ is sparse,
meaning harm is produced and experienced in local, dense subgraphs. However, the **Moral Graph Laplacian** ($L = D - W$)
allows us to model how local distortions ripple outward through the network.

### 2. The Continuous Media Substrate

Overlaying the sparse graph is a continuous media substrate $M(t, \phi)$. Mass media provides low-frequency coupling
that fills gaps in the sparse graph. We decompose the perceived reward $\hat{r}_i^{(j)}$ into direct signals and
media-filtered signals:

$$\hat{r}_i^{(j)} = \beta_{ij} r_i + (1-\beta_{ij}) \int K_{ij} M d\phi$$

Here, $\beta_{ij}$ represents direct visibility. When $\beta_{ij} \to 0$, perception is dominated by the media
kernel $K_{ij}$, allowing the substrate to overwrite local reality.

### 3. Moral Resonance

The most dangerous systemic failures occur at the point of **Moral Resonance**. We formalize this as the projection of
substrate modes onto the eigenvectors $v_k$ of the Moral Graph Laplacian. Resonance occurs when:

$$\langle M(\phi), v_k \rangle \gg 0$$

This alignment between a global narrative $M(\phi)$ and a structural eigenvector $v_k$ (a vulnerable social cluster)
means small media inputs produce outsized, localized harm cascades, effectively "tuning" the population to a specific
frequency of justification or dehumanization.

## The Asymmetry Principle: Hysteresis and Repair

A critical error in early computational ethics was the assumption of symmetry between good and evil—that a unit of harm
is merely the negative of a unit of benefit. In reality, they are governed by distinct operators with fundamentally
different scaling laws and temporal dynamics.

### 1. Asymmetric Kernels

We model the impact of a stimulus $x$ using two distinct kernels:

* **Convex Harm ($\ell_-$):** The harm kernel is convex, meaning damage scales superlinearly with intensity. A single
  catastrophic event is worse than the sum of many minor inconveniences.
  $$ \ell_-(x) \propto x^k \quad (k > 1) $$
* **Diminishing Benefit ($\ell_+$):** The benefit kernel is concave or saturating. Positive utility faces diminishing
  returns; doubling resources does not double well-being.
  $$ \ell_+(x) \propto \log(1+x) $$

### 2. The Damage State ($D$)

Harm is not instantaneous; it leaves a residue. We define a persistent **Damage State** $D_i(t)$ for each agent, which
evolves according to a hysteresis-dominated equation:

$$ \frac{dD_i}{dt} = \ell_-(\text{Harm}_i) - \lambda D_i - R_i(t) $$

Here, $\lambda$ is typically small, representing the slow natural healing of trauma or structural degradation. The
term $\ell_-(\text{Harm}_i)$ drives the state up rapidly, creating a "fast-in, slow-out" dynamic characteristic of
hysteresis.

### 3. The Repair Operator ($R$)

Crucially, the cessation of harm ($\text{Harm}_i \to 0$) does not reset $D_i$ to zero. It merely halts the accumulation.
To reduce the damage state significantly, a distinct **Repair Operator** $R$ must be applied.

* **Active Cost:** Unlike the passive cessation of evil, repair requires active energy expenditure (apology,
  reconstruction, compensation).
* **Friction:** The efficiency of $R$ is often low ($R < \text{Harm}$ for equivalent energy), reflecting the
  thermodynamic reality that it is easier to break a complex system than to fix it.

## Engineering the Moral Field: Applications

This field theory provides a foundation for **Moral Systems Engineering**, transforming ethical constraints into
concrete design requirements. We identify four high-value application domains:

1. **Harm Detection (Spectral Analysis of $W$):**
   By computing the eigenvalues of the Moral Graph Laplacian ($L = D - W$), we can identify structural vulnerabilities.
   Small eigenvalues correspond to "moral blind spots"—clusters of agents weakly connected to the broader empathy
   network, where harm can accumulate undetected by the collective.

2. **Policy Stress-Testing (Simulating $\Delta H$ and $\Delta D$):**
   Policies are simulated to measure their impact on the Damage State ($D$). Unlike standard cost-benefit analysis, this
   accounts for hysteresis. A policy is rejected if it triggers a "fast-in" harm spike that exceeds the system's repair
   capacity ($R$), regardless of long-term utility.

3. **Moral Resonance Detection (Predicting Cascades):**
   We predict dangerous cascades by monitoring the alignment between media substrate signals $M(\phi)$ and the network's
   eigenvectors. When a narrative aligns with a structural fault line (eigenvector $v_k$), the system enters resonance.
   Intervention involves "detuning" the network by increasing cross-cluster relevance weights.

4. **Algorithmic Governance (Optimizing for Net Valence):**
   Governance is framed as an optimization problem: maximize net valence subject to the constraint that local evil
   density $\epsilon$ never exceeds a critical threshold $\epsilon_{crit}$. This prevents "utility monster" scenarios
   where minority suffering is justified by aggregate majority pleasure.

The goal of computational ethics is not to enforce a specific morality, but to design architectures that are
structurally resistant to the formation of pathological justification loops. We must stop treating ethics as a set of
rules and start treating it as the engineering of a stable, low-distortion reward topology.