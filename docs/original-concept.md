# Living Evolution Simulator

I want to build a visually impressive evolution simulator centered around high-quality, living 3D creatures rather than the typical evolution game with dots, sprites, or tiny organisms moving around.

The initial creature can be thought of as a high-definition "gremlin": a strange, expressive, believable little creature that looks alive. However, the system should be designed from the beginning to support many independently created creatures and species.

## Core Experience

The creature itself should be the star of the application.

Rather than primarily watching hundreds of tiny creatures from above, I want to be able to closely observe a detailed creature living in a simulated environment.

A creature should feel alive through behaviors and animation such as:

* Breathing
* Blinking
* Looking around
* Walking and exploring
* Eating
* Sleeping
* Scratching or grooming
* Reacting to objects
* Showing fear or curiosity
* Interacting with other creatures
* Reproducing

The visual quality of the creature is more important initially than building an extremely sophisticated biological simulation.

I should be able to zoom in, rotate around a creature, follow it, and simply enjoy watching it exist.

## Evolution

Creatures have genomes containing inheritable traits.

Example physical traits:

* Body size
* Head size
* Eye size
* Ear size
* Arm length
* Leg length
* Tail length
* Jaw size
* Tooth size
* Fur length
* Fur density
* Fur/skin color
* Patterns or markings

Example functional traits:

* Speed
* Vision
* Strength
* Metabolism
* Energy efficiency
* Lifespan
* Reproduction rate
* Temperature tolerance
* Hunger
* Fear/aggression
* Curiosity

These genes should affect both the creature's visible appearance and its ability to survive and reproduce.

Offspring inherit traits from their parents with variation and mutation.

Evolution should therefore emerge from reproduction, mutation, environmental pressure, and survival rather than simply changing a creature's appearance randomly.

## Evolution Speed

A major feature should be the ability to dramatically accelerate the simulation.

For example:

**1x | 10x | 100x | 1,000x | 10,000x**

At 1x, I should be able to closely watch individual creatures live and behave.

At very high speeds, thousands of generations should be able to pass so I can observe long-term evolutionary changes.

Controls should include:

* Pause
* Resume
* Simulation speed slider
* Step forward
* Possibly step one generation
* Reset

The architecture should separate the biological simulation from rendering so extremely fast evolution does not require visually rendering every moment of every creature's life.

## Environments and Selection Pressure

Different environments should create different evolutionary pressures.

Possible environments include:

* Forest
* Desert
* Tundra
* Volcanic environment
* Other environments added later

Variables such as temperature, food abundance, predators, water availability and terrain should affect survival.

For example, moving a population into an extremely cold environment might eventually favor larger creatures with thicker fur.

The user should be able to modify environmental variables and then accelerate time to observe what evolves.

## Species and Creature Scalability

This is an important architectural requirement.

**Do not design the application specifically around one gremlin model or one species.**

The gremlin should be the first creature implemented using a general creature framework.

I eventually want to be able to create entirely new creatures separately and plug them into the simulation without rewriting the evolution engine.

For example, the project might eventually contain:

```text
Creatures/
    Gremlin/
        model
        skeleton
        animations
        genome-definition
        phenotype-mapping
        behaviors
        configuration

    Creature_B/
        model
        skeleton
        animations
        genome-definition
        phenotype-mapping
        behaviors
        configuration

    Creature_C/
        ...
```

The exact implementation does not need to follow this directory structure, but the conceptual separation is important.

Each creature/species should define how its genome maps to its particular body.

For example:

`earSize = 0.8`

might make the gremlin's ears larger, while another species might not even possess ears.

Therefore, the central simulation engine should understand abstract genomes, inheritance, mutation, reproduction, survival and environmental interaction without containing gremlin-specific assumptions.

Ideally, adding a new creature becomes primarily a matter of providing:

1. 3D assets
2. Rig/skeleton
3. Animation set
4. Genome definition
5. Genome-to-appearance mappings
6. Species-specific behaviors/configuration

The common simulation infrastructure handles the rest.

## Multiple Species

Eventually I want different independently developed species to coexist.

For example:

**Gremlins + another herbivore + predator species**

could all occupy the same environment and influence one another's evolution.

This could create predator/prey evolutionary arms races and entirely new ecological dynamics.

This does not need to exist in the first version, but architectural decisions should avoid making it difficult later.

## Creature Inspection

Selecting a creature should bring up information such as:

* Name/ID
* Species
* Generation
* Age
* Parents
* Children
* Genome
* Physical traits
* Behavioral traits
* Fitness/survival statistics

The user should be able to closely inspect the creature in 3D.

## Evolutionary History

The simulation should preserve meaningful evolutionary history.

I'd like to eventually inspect lineage:

**Generation 1 → Generation 100 → Generation 1,000 → Generation 10,000**

A family/evolutionary tree could allow me to select ancestors and render what those creatures looked like.

This would make it possible to visually compare an ancient ancestor with its highly evolved descendant.

Important historical specimens could potentially be stored while unimportant individuals are discarded so simulation history does not grow without bounds.

## AI Scientist

A later feature could be an AI scientist/observer that analyzes the simulation.

For example:

> "Average fur density has increased 37% over the last 600 generations. The change appears correlated with the temperature reduction introduced at generation 4,200."

I could ask questions such as:

* Why did this species get larger?
* When did these ears evolve?
* Why did this lineage go extinct?
* Which environmental change caused this?
* Compare this creature with its ancestor 5,000 generations ago.

This is a later feature rather than a requirement for the initial prototype.

## UI Concept

The majority of the screen should showcase the 3D creature/environment.

A smaller interface could display:

**Species:** Gremlin
**Generation:** 4,821
**Population:** 183

**Genetics**

* Speed
* Vision
* Metabolism
* Fur density
* Size
* etc.

**Evolution Speed**
1x ─────────●──── 10,000x

**Controls**
Pause | Step | Reset

The interface should feel more like observing a strange living biological experiment than playing a conventional strategy game.

## Development Philosophy

Build this incrementally.

A reasonable progression might be:

**Phase 1:** High-quality 3D gremlin displayed in a convincing environment.

**Phase 2:** Idle animations and basic autonomous behavior so the creature feels alive.

**Phase 3:** Procedural physical traits so genome values can visibly modify the creature.

**Phase 4:** General genome, inheritance and mutation system.

**Phase 5:** Reproduction and generations.

**Phase 6:** Environment, resources and selection pressure.

**Phase 7:** Accelerated/headless evolution simulation.

**Phase 8:** Evolutionary history and lineage inspection.

**Phase 9:** Multiple independently defined species sharing the same simulation.

**Phase 10:** AI scientist and more sophisticated emergent ecosystems.

## Initial Technical Goal

Before writing a large amount of implementation code, help me plan an architecture for this project.

In particular, I want to determine:

* Appropriate engine/technology stack
* How to achieve a genuinely high-quality creature visually
* How creature assets should be structured
* How genomes should be represented
* How genotype maps to visible phenotype
* How animation works when body proportions change
* How to separate rendering from high-speed simulation
* How species plugins/definitions should work
* How simulation state/history should be stored
* How to eventually support multiple species
* Which pieces should be implemented in the first prototype versus deferred

The architecture should prioritize **visual creature quality, extensibility, and the ability to run evolution extremely quickly**.

Do not immediately over-engineer the entire system. Help me identify the smallest prototype that proves the most technically difficult parts first.
