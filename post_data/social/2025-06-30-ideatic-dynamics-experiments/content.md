While ideatic dynamics—the study of how ideas spread and evolve through agent interactions—has been extensively studied
in dyadic systems and large-scale networks, the intermediate regime of 3-5 agents remains theoretically and empirically
underexplored. This paper proposes that small group configurations exhibit unique dynamical phenomena that cannot be
reduced to simpler or more complex systems. We present a comprehensive experimental framework using large language
model (LLM) agents to investigate three critical phenomena: intransitive belief loops in triadic systems, coalition
formation dynamics in tetradic configurations, and pivot agent emergence in pentadic structures. Our methodology employs
controlled textual communication protocols with quantified belief tracking to demonstrate empirically that the 3-5 agent
regime constitutes a distinct phase in ideatic dynamics, characterized by strategic complexity balanced with cognitive
tractability.

**Keywords**: ideatic dynamics, multi-agent systems, belief evolution, coalition formation, computational social science

---

## 1. Introduction

The emergence of collective intelligence in small groups represents one of the most fascinating phenomena in human
cognition. When individuals with diverse perspectives engage in structured dialogue, the resulting "ideatic dynamics"
—the evolution and interaction of ideas over time—can produce insights that transcend any single participant's
capabilities. This paper presents a novel experimental framework for studying these dynamics using controlled AI-human
collaborative sessions, revealing fundamental patterns in how ideas emerge, compete, combine, and evolve within small
group settings.

This experimental work provides empirical validation for the theoretical frameworks developed across our AI research
program. The [LLM feedback dynamics](../learning/2025-07-06-llm-feedback-dynamics.md) research reveals how individual
cognitive biases create system-level patterns, which directly informs our understanding of small group interactions. The
evolutionary mechanisms described in
our [Hypothesis Breeding[Hypothesis Breeding Grounds](../learning/2025-07-06-hypothesis-breeding-grounds.md)retical foundations for how ideas compete and evolve, while our [evolutionary agents proposal](../consciousness/2025-07-06-evolutionary-agents-proposal.md) might scale [prompt optimization](../portfolio/2025-07-01-prompt-optimization.md)pt optimization](prompt_optimization.md)
work demonstrates p[prompt optimization](../portfolio/2025-07-01-prompt-optimization.md)hms that could
enhan[prompt optimization](../portfolio/2025-07-01-prompt-optimization.md)ies.
Traditional studies of group cognition have been limited by the difficulty of controlling variables, the challenge of
quantifying idea quality, and the inability to systematically vary participant characteristics. By incorporating AI
agents with precisely controllable parameters alongside human participants, we can create reproducible experimental
conditions while maintaining the authentic unpredictability of human creative thought.

The mathematical study of how ideas propagate and evolve through networks of interacting agents—termed ideatic
dynamics—has revealed fundamental insights into collective intelligence, opinion formation, and social coordination (
DeGroot, 1974; Hegselmann & Krause, 2002; Deffuant et al., 2000). However, existing research has predominantly focused
on two limiting cases: dyadic interactions, which permit analytical tractability but limited strategic complexity, and
large-scale networks, which exhibit emergent collective behaviors but obscure individual agency.
This research connects to ou[chaotic dynamics in LLM systems](../learning/2025-07-06-llm-feedback-dynamics.md)
m_feedback_dynamics.md), where we
explore how [chaotic dynamics in LLM systems](../learning/2025-07-06-llm-feedback-dynamics.md)ral patterns that manifest
at both individual and collective levels. The evolutionary approach to theory development
outlined [Hypothesis Breeding Grounds](../learning/2025-07-06-hypothesis-breeding-grounds.md)md) provides complementary
insights into
how[Hypothesis Breeding Grounds](../learning/2025-07-06-hypothesis-breeding-grounds.md) [Hypothesis Breeding Grounds](../learning/2025-07-06-hypothesis-breeding-grounds.md)
d) demonstrates how these small group dynamics might serve
as[evolutionary agents proposal](../consciousness/2025-07-06-evolutionary-agents-proposal.md)ptimization](
prompt_optimization.md) framework offers practical tools for systematically improving the agents used in these
experiments.

This bifurcation has left a critical gap in our understanding of small group dynamics, particularly in the 3-5 agent
regime. We argue that this intermediate scale represents a distinct phase in ideatic systems, characterized by three key
properties: (1) sufficient complexity to generate strategic interdependencies and coalition formation, (2) manageable
cognitive load allowing agents to maintain detailed models of each other's belief states, and (3) preservation of
individual agency in determining collective outcomes.

The theoretical importance of small group ideatic dynamics extends beyond academic interest. Many crucial human
decision-making contexts—from Supreme Court deliberations to startup founding teams to scientific collaboration—involve
precisely this scale of interaction. Understanding the fundamental dynamics at play in these configurations has direct
implications for institutional design, team composition, and collaborative problem-solving.

Recent advances in large language model (LLM) technology provide unprecedented opportunities to study these phenomena
experimentally. Unlike human subjects, LLM agents can maintain consistent personas across extended interactions while
providing full observability of belief evolution. This methodological advancement enables rigorous investigation of
ideatic dynamics with controlled manipulation of agent characteristics, communication protocols, and environmental
constraints.

---

## 2. Theoretical Framework

### 2.1 Ideatic Dynamics: Core Concepts

Ideatic dynamics extends classical opinion dynamics by incorporating the content-dependent nature of belief evolution.
While traditional models assume that agents simply average their opinions with neighbors (DeGroot, 1974), ideatic
systems recognize that the persuasive power of different ideas varies based on their logical structure, empirical
support, and compatibility with existing belief systems (Hegselmann & Krause, 2002).

Formally, we represent an agent's belief state as a vector $\mathbf{b}_i(t) \in \mathbb{R}^n$, where each component
corresponds to confidence in a particular proposition. The evolution of beliefs follows:

$$\frac{d\mathbf{b}_i}{dt} = \sum_{j \neq i} w_{ij}(t) \cdot f(\mathbf{b}_i(t), \mathbf{b}_j(t), \mathbf{m}_{ji}(t))$$

where $w_{ij}(t)$ represents the credibility agent $i$ assigns to agent $j$ at time $t$, $\mathbf{m}_{ji}(t)$ is the
message content from $j$ to $i$, and $f(\cdot)$ is the ideatic influence function that depends on both current beliefs
and message content.

### 2.2 Phase Transitions in Group Size

Our central hypothesis is that ideatic dynamics exhibit qualitative phase transitions as group size increases. In dyadic
systems ($n=2$), interactions are necessarily symmetric in structure, leading to either convergence or persistent
oscillation. Large systems ($n \gg 5$) typically exhibit mean-field behavior where individual agency becomes negligible
relative to collective trends.

The intermediate regime ($3 \leq n \leq 5$) permits three phenomena absent in limiting cases:

**Intransitive Influence Loops**: In triadic systems, agent A may successfully influence B, B may influence C, and C may
influence A, creating stable cycles of belief evolution without equilibrium convergence.

**Coalition Mathematics**: With four or more agents, strategic alliance formation becomes possible, introducing
game-theoretic considerations into belief dynamics. Unlike dyadic negotiations, multi-agent coalitions can form,
dissolve, and reorganize based on changing belief configurations.

**Pivot Agent Dynamics**: In odd-numbered groups, individual agents can achieve disproportionate influence by
positioning themselves as swing votes between competing coalitions, even when they are not the most persuasive or
credible members.

### 2.3 Cognitive Tractability Hypothesis

We propose that the 3-5 agent regime represents a "cognitive sweet spot" where strategic complexity remains within the
computational bounds of individual agents. Drawing from research on working memory capacity (Miller, 1956; Cowan, 2001),
we hypothesize that agents can maintain detailed models of 4±1 other agents' belief states, preferences, and likely
responses to different arguments.

Beyond this threshold, agents must resort to simplified heuristics, categorization schemes, or factional thinking that
qualitatively changes the nature of ideatic interactions. This cognitive limitation creates a natural boundary condition
for the types of strategic behavior observable in small groups.

---

## 3. Experimental Methodology

### 3.1 Agent Architecture

Our experimental framework employs LLM agents instantiated with distinct personas and initial belief configurations.
Each agent is implemented as a persistent conversation system with four core components:

**Persona Management**: Maintains consistent personality traits, values, and reasoning styles across interactions.
Personas are drawn from validated psychological typologies to ensure realistic behavioral diversity.

**Belief State Tracking**: Quantifies agent positions on key issues using standardized scales, enabling measurement of
belief evolution over time.

**Strategic Reasoning Module**: Enables agents to form coalitions, make deals, and engage in sophisticated argumentation
based on their assessment of other agents' positions and likely responses.

**Communication Interface**: Handles message formatting, routing, and timing according to experimental protocols.

### 3.2 Experimental Controls

To ensure rigorous hypothesis testing, we implement several layers of experimental control:

**Baseline Comparisons**: Identical scenarios run with human participants to validate LLM behavior authenticity.

**Ablation Studies**: Systematic removal of capabilities (private communication, memory, coalition formation) to isolate
causal mechanisms.

**Parameter Sweeps**: Variation of agent personality distributions, topic complexity, and communication constraints to
test robustness of observed phenomena.

**Cross-Scale Validation**: Replication of key findings across different group sizes to confirm phase transition
boundaries.

---

## 4. Experimental Designs

### 4.1 Experiment 1: Triadic Intransitive Loops

**Research Question**: Can ideatic systems exhibit stable intransitive influence patterns, and under what conditions do
they emerge?

**Methodology**: Three agents with carefully constructed belief configurations engage in structured circular
communication on educational technology policy. Agent A (Traditionalist) advocates for classical teaching methods, Agent
B (Progressive) promotes AI-enhanced learning, and Agent C (Pragmatist) seeks hybrid approaches.

The circular communication topology (A→B→C→A) ensures that each agent responds to exactly one other agent per round,
creating conditions for intransitive influence to emerge. We measure belief evolution using standardized position
statements after each communication round.

**Predicted Outcomes**: Based on theoretical analysis, we expect to observe: (1) non-convergent belief trajectories
despite continued interaction, (2) periodic or quasi-periodic oscillations in group belief configurations, and (3)
maintenance of system "energy" without equilibrium formation.

### 4.2 Experiment 2: Tetradic Coalition Dynamics

**Research Question**: How do coalition formation opportunities change the nature of ideatic influence, and what factors
determine coalition stability?

**Methodology**: Four agents debate educational assessment policy with positions strategically chosen to enable multiple
coalition configurations. The experimental protocol includes phases for open discussion, private coalition negotiation,
and public position defense.

Critical to this design is the choice of belief configurations that permit both 2-2 splits and 3-1 coalitions, creating
opportunities for "betrayal cascades" where stable partnerships dissolve when agents recognize more advantageous
alliances.

**Predicted Outcomes**: We hypothesize: (1) initial coalition formation based on ideological similarity, (2) strategic
coalition switching when agents recognize pivot opportunities, and (3) emergence of meta-strategic reasoning about
coalition stability.

### 4.3 Experiment 3: Pentadic Pivot Agent Dynamics

**Research Question**: In majority-rule systems, how do individual agents acquire and exercise disproportionate
influence through strategic positioning?

**Methodology**: Five agents deliberate on urban planning decisions requiring majority votes. Agent personas are
distributed to create multiple potential majority coalitions, with no single dominant faction.

The key innovation is presenting multiple sequential decisions that require fresh coalition formation for each vote,
allowing observation of how pivot power transfers between agents and how strategic positioning evolves over time.

**Predicted Outcomes**: We expect to identify: (1) agents who consistently determine outcomes despite not being most
influential in direct persuasion, (2) strategic moderation of positions to maintain coalition flexibility, and (3)
emergence of reputation effects based on coalition reliability.

### 4.4 Cross-Scale Comparative Analysis

**Research Question**: At what group sizes do qualitative transitions in ideatic dynamics occur, and what mechanisms
drive these transitions?

**Methodology**: A standardized climate policy scenario is implemented across group sizes from 2 to 8 agents, with
identical agent persona distributions and communication protocols.

This design enables direct comparison of convergence rates, coalition complexity, consensus quality, and individual
agency across different scales. Statistical analysis will identify inflection points where behavioral patterns undergo
qualitative changes.

---

## 5. Expected Contributions

### 5.1 Theoretical Advances

This research program promises several theoretical contributions to ideatic dynamics. First, empirical demonstration of
intransitive influence loops would establish that ideatic systems can exhibit fundamentally different stability
properties than classical opinion dynamics models. Second, quantification of coalition formation patterns would provide
the first systematic analysis of how strategic considerations modify belief evolution. Third, identification of
cognitive load boundaries would establish principled limits on the complexity of ideatic interactions.

### 5.2 Methodological Innovations

The use of LLM agents for ideatic dynamics research represents a significant methodological advance. Unlike human
subjects, LLM agents provide perfect reproducibility, complete observability of internal states, and unlimited
availability for extended interaction protocols. This methodology could establish a new standard for computational
social science research.

### 5.3 Practical Applications

Understanding small group ideatic dynamics has immediate applications for institutional design. Supreme Court dynamics,
corporate board deliberations, scientific peer review panels, and policy committees all operate in the 3-5 agent regime.
Insights from this research could inform optimal group composition, communication protocols, and decision-making
procedures.

---

## 6. Limitations and Future Directions

### 6.1 LLM Agent Validity

While LLM agents offer significant experimental advantages, questions remain about their psychological realism. Future
work should include extensive validation studies comparing LLM behavior to human participants across diverse cultural
and educational backgrounds.

### 6.2 Temporal Dynamics

The proposed experiments focus on short-term belief evolution within single interaction sessions. Long-term studies
examining how ideatic dynamics evolve over weeks or months of interaction would provide crucial insights into
persistence and adaptation effects.

### 6.3 Cultural and Contextual Factors

Our experimental framework primarily examines Western, educated populations through the lens of policy debates familiar
to such groups. Extension to diverse cultural contexts and different types of belief systems would strengthen the
generalizability of findings.

---

## 7. Conclusion

The 3-5 agent regime in ideatic dynamics represents a critical but understudied phase in collective intelligence. Our
proposed experimental framework provides the first systematic approach to investigating the unique phenomena that emerge
at this scale: intransitive influence loops, coalition formation dynamics, and pivot agent effects.

These findings have direct implications across our broader AI research program. The chaotic dynamics we observe in [LLM
feedback sys[LLM feedback systems](../learning/2025-07-06-llm-feedback-dynamics.md)ntly in multi-agent configurations,
where small group effects can either amplify or dampen
individu[LLM feedback systems](../learning/2025-07-06-llm-feedback-dynamics.md) presented
in [Hypothesis Breeding Grounds](
hypothe[Hypothesis Breeding Grounds](../learning/2025-07-06-hypothesis-breeding-grounds.md)nsights from small group
dynamics to better model theoretical competition and selection. Most significantly, these empirical findings directly
inform the design of cognitive ecosystems in our [evolutionary agents proposal](
evolutionary_agents_propos[evolutionary agents proposal](../consciousness/2025-07-06-evolutionary-agents-proposal.md)
lized roles and collective intelligence is crucial for predicting
civilization-scale[evolutionary agents proposal](../consciousness/2025-07-06-evolutionary-agents-proposal.md)te
controlled, reproducible experiments, this research program promises to establish empirical foundations for small group
ideatic theory while providing practical insights for institutional design. The theoretical prediction that cognitive
tractability creates natural boundaries for strategic complexity offers a unifying framework for understanding when and
why different types of collective behavior emerge.

As human society increasingly relies on small group decision-making in complex technical and policy domains,
understanding the fundamental dynamics of ideatic evolution in these configurations becomes not merely an academic
curiosity, but a practical necessity for effective governance and collaboration.

---

## References

Cowan, N. (2001). The magical number 4 in short-term memory: A reconsideration of mental storage capacity. *Behavioral
and Brain Sciences*, 24(1), 87-114.

Deffuant, G., Neau, D., Amblard, F., & Weisbuch, G. (2000). Mixing beliefs among interacting agents. *Advances in
Complex Systems*, 3(01n04), 87-98.

DeGroot, M. H. (1974). Reaching a consensus. *Journal of the American Statistical Association*, 69(345), 118-121.

Hegselmann, R., & Krause, U. (2002). Opinion dynamics and bounded confidence models, analysis, and simulation. *Journal
of Artificial Societies and Social Simulation*, 5(3).

Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing
information. *Psychological Review*, 63(2), 81-97.