---
title: Development of CHERI
layout: source
permalink: /sources/cheri-alliance.github.io/discover/history/development-of-cheri/
---

1. Discover
2. History
3. Development of CHERI
{: .source-breadcrumbs }

# Development of CHERI
{: id="page-hero-title" .page-hero-title }

CHERI developed through repeated hardware and software prototypes, moving from a clean-slate security question to multiple working ecosystems.
{: .page-hero-summary }

An architecture cannot improve real software security if it exists only on paper. It needs processor implementations, compilers that understand the pointer model, operating systems that preserve authority, applications that expose compatibility problems, and evidence that the whole stack behaves as intended.

CHERI developed through that cycle of design, implementation, measurement, and revision.

## 2010: the joint project begins
{: id="2010-the-joint-project-begins" }

SRI International and the University of Cambridge began the CTSRD project in 2010 under DARPA’s CRASH programme. The work revisited capability systems for modern processors and software, with the goal of improving memory protection and making fine-grained compartmentalisation practical.

The first architecture extended 64-bit MIPS. Its hybrid model combined capabilities with conventional registers and virtual memory, allowing new protection mechanisms to coexist with familiar operating-system and software structures.

## Early FPGA and software stacks
{: id="early-fpga-and-software-stacks" }

The BERI processor provided an open, FPGA-based platform on which the architecture could run. The team extended LLVM and Clang, adapted FreeBSD to create CheriBSD, built debugging and emulation tools, and began porting applications.

These prototypes answered practical questions. Could C pointers become capabilities? How should capabilities be saved during a context switch? Which permissions were needed by a dynamic linker? What happened when real code treated pointers as integers?

By 2014, published work demonstrated a mature FPGA implementation running FreeBSD and showed how CHERI could enforce language-level protection in hardware while retaining a RISC design.

## From selective use to pure-capability software
{: id="from-selective-use-to-pure-capability-software" }

Early hybrid software used capabilities explicitly in selected parts of a program. This was valuable for staged experimentation, but it did not protect every ordinary pointer.

Work on CheriABI developed a pure-capability process environment in which C and C++ pointers were represented as capabilities throughout the application binary interface (ABI). This made fine-grained memory protection broadly applicable to existing source code and drove large-scale porting of libraries and applications.

Compartmentalisation work also progressed from small demonstrations to operating-system and application components. Experiments included isolating packet-processing code and protecting language runtimes from unsafe native interfaces.

## Expanding to RISC-V and Arm
{: id="expanding-to-risc-v-and-arm" }

CHERI’s concepts were not tied to MIPS. Under DARPA’s SSITH programme, the teams brought CHERI to RISC-V, supported by formal specifications and multiple processor implementations. This opened routes for both application-class and embedded designs.

Arm began collaborating with the project during the 2010s. The Morello programme, announced in 2019, created a prototype CHERI-enabled Arm architecture, system-on-chip, development board, and supporting software stack. Boards distributed from 2022 enabled wider evaluation at application-processor scale.

## Embedded and specialised systems
{: id="embedded-and-specialised-systems" }

CHERI-RISC-V work also led to smaller systems that did not depend on a memory management unit. CHERIoT developed as a 32-bit hardware-software platform for embedded devices, combining capability memory protection, fast compartments, a real-time operating system, a formal instruction-set architecture (ISA) model, toolchains, simulators, FPGA targets, and commercial silicon.

This branch of the ecosystem demonstrates that CHERI concepts can be adapted to different scales rather than imposed as one identical architecture everywhere.

## From prototypes to products
{: id="from-prototypes-to-products" }

Government programmes, open-source communities, and industry investment expanded the available hardware and software. The ecosystem now includes licensable processor designs, commercial chips, development boards, FPGA platforms, operating systems, toolchains, simulators, and certification activity.

The CHERI Alliance formally launched in 2024 to coordinate adoption, alignment, certification, education, and collaborative engineering across this growing ecosystem.

## A continuing architecture and ecosystem
{: id="a-continuing-architecture-and-ecosystem" }

CHERI’s development is best understood as a sequence of working systems, not a single invention date. Each stage broadened the evidence:

- early architecture and FPGA feasibility
- full compiler and operating-system integration
- pure-capability C and C++ at scale
- fine-grained compartments
- portability across MIPS, RISC-V, and Arm designs
- embedded and application-class platforms
- commercial implementations and product assessment

Current work focuses on standards, support in mainline software projects, product deployment, assurance, and the next generation of CHERI-enabled systems.

## Where next
{: .where-next-title }

### [DARPA Programmes](https://cheri-alliance.github.io/discover/history/darpa-programmes/)
{: .where-next-card-title }





[An overview of DARPA programmes that supported CHERI research and related secure hardware work.](https://cheri-alliance.github.io/discover/history/darpa-programmes/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/discover/history/darpa-programmes/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Early Capability Systems](https://cheri-alliance.github.io/discover/history/early-capability-systems/)
{: .related-pages-item-title }





[A short account of early capability-based computer systems and the ideas that influenced later work.](https://cheri-alliance.github.io/discover/history/early-capability-systems/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/discover/history/early-capability-systems/)
{: .source-card-label }





### [Cambridge and SRI](https://cheri-alliance.github.io/discover/history/cambridge-and-sri/)
{: .related-pages-item-title }





[Background on the Cambridge and SRI research collaboration that helped establish CHERI.](https://cheri-alliance.github.io/discover/history/cambridge-and-sri/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/discover/history/cambridge-and-sri/)
{: .source-card-label }
