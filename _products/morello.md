---
layout: detail
title: Morello
summary: Morello is Arm’s application-class CHERI prototype platform, providing real hardware for developing, porting and evaluating CHERI software.
permalink: /products/morello/
slug: morello
navigation:
  header:
    category: Build
    subcategory: Platforms
image:
  src: /assets/images/shared/morello-board.webp
  alt: Arm Morello board
  width: 640
  height: 480
  fit: contain
product:
  type: development_kit
  manufacturer: arm
related:
- type: page
  slug: build-platforms-cheriot
  relation: next_step
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

Developed by Arm in collaboration with the [University of Cambridge](/organisations/university-of-cambridge/) and [SRI International](/organisations/sri/) through the UK Digital Security by Design (DSbD) programme, Morello brings CHERI capabilities to an application-class processor and development board.

It provides developers with a complete environment for exploring CHERI on real high-performance hardware, including operating systems, toolchains and substantial applications.

## What is Morello?

The Morello platform includes:

- a prototype architecture based on AArch64 with CHERI capabilities
- the Morello processor and system-on-chip (SoC)
- the Morello development board
- supporting firmware, operating systems and development tools

Morello is one prototype implementation of CHERI, not CHERI itself. Other CHERI platforms, including CHERI-RISC-V and CHERIoT, use different architectures and software environments.

## Software environment

The Morello ecosystem includes:

- CHERI-aware LLVM and Clang
- hybrid and pure-capability ABIs
- CheriBSD with a broad Unix user space
- CHERI-related Linux and Android work
- QEMU, debugging tools, libraries, language runtimes, and application ports

`cheribuild` is a common open-source route for building Morello LLVM, CheriBSD, disk images, and related tools from compatible source revisions.

## When should I use Morello?

Morello is particularly useful if you want to:

- develop and test CHERI software on real application-class hardware
- port substantial existing software to CHERI
- experiment with pure-capability software
- measure real hardware behaviour rather than simulator execution
- reproduce or extend an existing Morello project
- investigate Morello-specific ABI or architecture behaviour
- compare results across different CHERI environments

Morello was designed for research, development and evaluation rather than as a mass-market production processor. For new commercial products, developers should consider current CHERI platforms and their availability, support and lifecycle.

## Request a Morello board

The [CHERI Alliance](/organisations/cheri-alliance/) has **Morello boards available** for loan to organisations working on projects that can help advance CHERI development and adoption.

Boards are limited, so requests should explain clearly what you plan to do and why access to Morello hardware would be valuable.

### What to include in your request

Tell us about:

- Your project: What do you want to build, port, test or demonstrate?
- Its value: How could the work contribute to CHERI adoption, research, tools, software, demonstrations or the broader ecosystem?
- Why you need Morello: Explain why alternatives such as QEMU or other CHERI development boards are not sufficient for the project.
- Your organisation: Boards are loaned to organisations rather than individuals.
- Your team: Tell us briefly about your expertise, motivation and interest in contributing to the CHERI ecosystem.

[Contact the CHERI Alliance to request a board](/alliance/membership/contact/){: .button }

You can also find further information about the platform from [Arm's Morello page](https://www.arm.com/architecture/cpu/morello).

## Developing on Morello

A typical Morello project starts with a compatible software environment and known working example before moving on to your own software.

You should know whether the binaries you are working with are conventional, hybrid or pure capability, and keep the firmware, operating system, toolchain and ABI versions compatible.

For development, debugging and porting guidance, use the technical documentation associated with the software and platform version you are using.


## Strengths

Morello provides:

- real application-class CHERI hardware
- mature CheriBSD and LLVM/Clang integration
- an environment for porting substantial software
- a widely used platform for CHERI research and experimentation
- experience and evidence that can inform development on other CHERI platforms

## Constraints

- Morello is a prototype architecture and board
- Physical boards are less accessible than local simulation
- Its performance and encoding choices do not predict every future CHERI processor
- Software built specifically for the Morello ABI is not automatically portable to CHERI-RISC-V
- Long-term product support must be assessed separately from research and evaluation access

## A note about performance

The Arm Morello platform is a **research and prototyping system** designed to enable software development, porting, and evaluation of CHERI-based architectures. However, it is not representative of a production-quality CHERI implementation and should therefore not be used as the sole basis for assessing the performance overhead of CHERI.

Performance results obtained on Morello may reflect characteristics of the prototype hardware, development-stage toolchains, and implementation choices specific to the research platform, rather than the intrinsic cost of CHERI itself. Consequently, direct comparisons between Morello and conventional production processors can lead to misleading conclusions regarding CHERI performance overhead.

We recommend using Morello primarily for software development, compatibility testing, and functional evaluation. Once an application has been ported and validated, researchers should seek to corroborate performance results using additional CHERI platforms, implementations, simulators, or published results that better reflect production-oriented designs. Real-world workload measurements across multiple platforms provide a more reliable basis for understanding the true performance impact of CHERI. The CHERI Alliance can provide guidance on available platforms and benchmarking opportunities to support such evaluations.

Use the [Arm Morello resources](https://developer.arm.com/Architectures/Morello), [CheriBSD Getting Started](https://www.cheribsd.org/getting-started/), and [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild) for current technical instructions. For its place in the wider timeline, read [Morello History](/discover/history/morello-history/).
