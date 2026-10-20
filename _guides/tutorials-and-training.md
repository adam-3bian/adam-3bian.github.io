---
layout: details/guide
title: Tutorials & Training
summary: Learn CHERI step by step, from your first build to porting and compartmentalisation.
permalink: /guides/tutorials-and-training/
slug: tutorials-and-training
navigation:
  header:
    category: Build
    subcategory: Software Developers
guide:
  topic: training
related:
- type: guide
  slug: downloads
  relation: next_step
- type: guide
  slug: port-existing-software
  relation: related
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

CHERI spans hardware, compilers, operating systems and software architecture. You do not need to learn everything at once. Start with one platform, get a working environment, and introduce new concepts as you need them.

## Start here

### 1. Understand the fundamentals

Start with:

- [Vulnerabilities in Everyday Technology](/discover/why-cheri/vulnerabilities-in-everyday-technology/)
- [Why Existing Defences Are Not Enough](/discover/why-cheri/why-existing-defences-are-not-enough/)
- [How CHERI Capabilities work](/build/technology/how-cheri-capabilities-work/)

The goal is to understand the core concepts of bounds, permissions, tags and least privilege before worrying about a particular implementation.

### 2. Run a prepared environment

Follow [Run CHERI in Simulation](/guides/run-cheri-in-simulation/) to start with a prepared environment.

Get an existing example running before changing the code. Then deliberately trigger a capability violation and see how the system reports it.

At this point, you should be able to identify the platform and ABI you are using and reproduce a simple capability fault.

### 3. Build and debug your first application

Continue with [Build Your First Application](/guides/build-your-first-application/).

Build a simple application and use the available debugging tools to inspect a capability, including its address, bounds, permissions and tag.

This connects the CHERI concepts you have learned with what actually happens at runtime.

### 4. Port existing software

Next, try a small existing library or application with a good test suite.

Typical issues to look for include pointer-integer conversions, assumptions about pointer representation, object bounds, custom allocation, serialisation, inline assembly, and ABI boundaries.

Rather than simply fixing compiler errors, understanding why each change is necessary will help you identify assumptions in the original software.

### 5. Introduce a compartment

Finally, try moving a small component, such as a parser, behind a capability-protected interface.

Define explicitly:

- what memory it can access
- which services it can call
- what capabilities it receives
- what it must not be able to reach

Then test the boundary by attempting an operation the compartment should not be permitted to perform.

## Maintained technical resources

### CHERI and CheriBSD

- [CHERI Frequently Asked Questions](https://ctsrd-cheri.github.io/cheri-faq/) covers architecture, software, Morello, and CHERI-RISC-V questions
- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild) documents build targets for compilers, QEMU, CheriBSD, software development kits (SDKs), ports, and debugging tools
- [CheriBSD Getting Started](https://www.cheribsd.org/getting-started/) provides versioned guides for installing images, using hardware or emulation, compiling software, and benchmarking
- The [University of Cambridge CHERI project](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/) links architecture reports, programming guides, publications, and source repositories

### CHERIoT

- The [CHERIoT Programmer’s Guide](https://cheriot.org/book/) teaches the platform from architecture concepts through threads, memory management, compartments, drivers, networking, auditing, and board support
- The [CHERIoT getting-started chapter](https://cheriot.org/book/getting_started.html) covers the real-time operating-system (RTOS) repository, development container, simulator, and hardware targets
- The [`cheriot-rtos` repository](https://github.com/CHERIoT-Platform/cheriot-rtos) includes examples, exercises, SDK code, and the issue tracker
- The [CHERIoT project site](https://cheriot.org/) links current releases, community discussions, hardware, and articles

### Linux, Zephyr, and ecosystem projects

- The [CHERI Linux roadmap](/linux-roadmap/) describes the cross-architecture path for kernel and user-space support
- The [CHERI Alliance GitHub organisation](https://github.com/CHERI-Alliance) hosts Linux, Zephyr, QEMU, debugger, and other collaborative repositories
- [CHERI Alliance Working Groups](/alliance/leadership/working-groups/) describe the Alliance’s regular technical collaboration

## Training for teams

A useful team workshop should produce artifacts, not only slides. Ask participants to deliver:

- a reproducible environment description
- one valid program and one controlled fault
- a capability inspection from the debugger
- a short porting log with root-cause categories
- a proposed compartment boundary and authority map
- open questions tied to the intended product

A tutorial demonstrates how CHERI mechanisms work. Product assurance requires deeper consideration of the particular architecture, implementation, software and security requirements.

## Keep tutorials current

CHERI platforms and toolchains continue to evolve, so use documentation that matches the platform and software version you are working with.

When using older tutorials or conference material, check that the architecture (Morello, CHERI-RISC-V, or CHERIoT), toolchain and commands still match your environment.
