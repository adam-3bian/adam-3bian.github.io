---
title: Morello History
permalink: /discover/history/morello-history/
where-next:
  url: /discover/history/risc-v-and-embedded-development/
related-pages:
- url: /discover/history/early-capability-systems/
  description: A short account of early capability-based computer systems and the ideas that influenced later work.
  action: Read this page
- url: /discover/history/ukri-digital-security-by-design/
  description: An overview of the UK Digital Security by Design programme and its role in the wider CHERI ecosystem.
  action: Read this page
summary: Morello brought CHERI to a high-performance Arm prototype platform and enabled large-scale evaluation by
  industry, academia, and government.
---

FPGA processors are ideal for changing an architecture quickly, but they cannot answer every question about a modern, high-performance system. To evaluate CHERI at application-processor scale, the ecosystem needed prototype silicon, a complete board, and a software stack large enough to run familiar workloads.

The Morello programme created that platform.

## From architecture collaboration to a programme
{: id="from-architecture-collaboration-to-a-programme" }

Arm began collaborating with the University of Cambridge and SRI International during the 2010s. Early work investigated how CHERI concepts could be applied to the 64-bit Arm architecture while retaining the hybrid and pure-capability models developed in the wider project.

In 2019, Arm and UKRI announced Morello as a major part of the UK Digital Security by Design programme. The name covered several related outputs:

- a prototype CHERI-enabled Arm architecture
- a processor and system-on-chip implementation
- a physical development board
- firmware, toolchains, operating systems, and development resources

Keeping these meanings separate is useful. A Morello board is one implementation of the Morello architecture, and Morello is one branch of the wider CHERI ecosystem.

## Real silicon and a full system
{: id="real-silicon-and-a-full-system" }

Arm developed the Morello system-on-chip around a high-performance application-processor design and produced development boards for evaluation. Boards became available to programme partners and other users from 2022.

The platform supported a substantial open-source stack. CHERI LLVM and Clang could build hybrid and pure-capability code. CheriBSD provided a complete operating-system environment. Linux, Android, language runtimes, libraries, and applications were also adapted or evaluated through associated work.

This allowed developers to test more than isolated instructions. They could investigate dynamic linking, system calls, drivers, package ports, browser components, databases, compartment transitions, and realistic performance behaviour.

## What Morello helped the ecosystem learn
{: id="what-morello-helped-the-ecosystem-learn" }

Morello created shared evidence about:

- compatibility of large C and C++ codebases
- the pure-capability application binary interface (ABI) at application-processor scale
- compiler diagnostics and porting patterns
- microarchitectural costs and optimisation opportunities
- compartmentalisation within operating systems and applications
- interactions with safe languages and managed runtimes
- assurance, testing, procurement, and adoption barriers

It also gave organisations a common target for demonstrators and training. That reduced fragmentation during a period when many projects needed to compare results.

## A prototype with lasting value
{: id="a-prototype-with-lasting-value" }

Morello was designed as an evaluation platform, not as a mass-market product architecture. Its instruction details should not be assumed to define every future CHERI-enabled Arm or RISC-V processor.

Its lasting value is the scale of the experiment. Morello showed that capability memory protection and pure-capability software could be integrated into a sophisticated processor, system-on-chip, board, operating system, and application ecosystem.

The lessons now inform work on standards, compilers, operating systems, CHERI-RISC-V platforms, commercial processors, and application compartmentalisation. Developers who want to use the board today should consult the separate [Morello platform page](/hardware/morello/) for current access routes and software guidance.
