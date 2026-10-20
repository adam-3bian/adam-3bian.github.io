---
layout: detail
title: CHERI Zephyr
summary: Bring CHERI hardware-enforced protection to Zephyr-based embedded systems.
permalink: /repositories/cheri-zephyr/
slug: cheri-zephyr
navigation:
  header:
    category: Build
    subcategory: Software Ecosystem
repository:
  type: operating_system
resources:
- type: repository
  label: CHERI Zephyr source code
  url: https://github.com/CHERI-Alliance/CHERI-zephyr
related:
- type: page
  slug: build-software-ecosystem-real-time-operating-systems
  relation: next_step
- type: working_group
  slug: cheri-zephyr
  relation: related
- type: page
  slug: build-platforms-cheriot
  relation: related
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

CHERI Zephyr brings capability-based memory protection to the Zephyr ecosystem, providing a route for developers who want to explore CHERI while retaining familiar Zephyr APIs, drivers, build tools and development practices.

Supporting CHERI involves more than enabling a processor and compiler. Capability protection also needs to work across the operating system, including threads, memory, interrupts, drivers and interactions between application and kernel code.

## Why CHERI Zephyr?

Zephyr is already used as the software foundation for many embedded systems. CHERI-enabled Zephyr explores how these existing software environments can benefit from hardware-enforced memory protection without adopting an entirely different operating-system model.

It is particularly relevant when you want to:

- bring CHERI to an existing Zephyr-based project
- port existing embedded applications to CHERI
- retain familiar Zephyr APIs, drivers and development tools
- explore stronger isolation between software components
- evaluate CHERI for future embedded products
- contribute to CHERI support in the wider Zephyr ecosystem

## What needs to change?

CHERI protection extends beyond the processor into parts of the operating system that create, store or use pointers and capabilities.

This includes areas such as:

- thread creation and context switching
- stacks and memory management
- user and kernel transitions
- interrupts and exceptions
- kernel objects and system interfaces
- drivers
- compiler and linker configuration
- capability faults and diagnostics

Together, these changes allow Zephyr software to make use of CHERI's hardware-enforced memory protection.

## Development environment

CHERI Zephyr development brings together the CHERI processor architecture, compiler and toolchain, Zephyr kernel, board configurations, drivers, samples and tests.

Support is progressing at different pace depending on architectures, processors, boards, drivers and Zephyr configurations, so developers should use the software and platform combination recommended for their chosen CHERI target.

As support develops, the goal is not simply to boot Zephyr on a CHERI processor, but to extend meaningful capability protection through applications and the wider operating-system environment.

## Zephyr and CHERIoT

Both CHERI-enabled Zephyr and CHERIoT address embedded systems, but they provide different routes to adopting CHERI.

|  | CHERI-enabled Zephyr | CHERIoT |
| --- | --- | --- |
| Foundation | The Zephyr RTOS ecosystem | A hardware-software design built around CHERI |
| Existing interfaces | Zephyr APIs, drivers, Kconfig, west, and board support | CHERIoT SDK, RTOS, compartments, and xmake build system |
| Compartment model | Defined by the evolving CHERI Zephyr integration | Central to the platform architecture |
| Main attraction | Continuity with Zephyr software and devices | A security-first embedded model designed around capabilities |

The choice is therefore not simply about which platform is more mature. It depends on whether your priority is bringing CHERI to an existing embedded software ecosystem or adopting a platform designed around CHERI from the outset.

## Working towards broader Zephyr support

The [CHERI Alliance Zephyr Working Group](/groups/cheri-zephyr/) coordinates collaboration around CHERI Zephyr, bringing together implementation work, platform support, testing and contributions.

A key objective is to reduce fragmentation between individual CHERI implementations and build common approaches that can support CHERI across the broader Zephyr ecosystem.

## Choosing CHERI Zephyr

CHERI Zephyr is particularly useful when you want to:

- retain the Zephyr programming and development model
- investigate CHERI protection in an RTOS environment
- bring existing Zephyr applications and drivers to CHERI
- evaluate CHERI for embedded products
- use the Zephyr port as a reference for bringing CHERI to other RTOS environments
- contribute to common CHERI support for embedded software

For projects that instead want an embedded hardware and software platform designed around capability-based compartmentalisation from the outset, CHERIoT provides a complementary route.

## Project links

- [CHERI Zephyr source](https://github.com/CHERI-Alliance/CHERI-zephyr)
- [CHERI Zephyr Working Group](/groups/cheri-zephyr/)
- [Zephyr Project documentation](https://docs.zephyrproject.org/)
