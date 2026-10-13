---
title: Tutorials & Training
image_url: /assets/guides/tutorials-and-training/placeholder.svg
repository_urls:
- https://github.com/CTSRD-CHERI/cheribuild
- https://github.com/CHERIoT-Platform/cheriot-rtos
updated_date: null
authors: []
related:
  groups: []
  hardware:
  - cheriot
  - morello
  software:
  - debugging-tools
  - cheri-linux
  - cheribsd
  - zephyr
---

# Tutorials & Training

Follow maintained tutorials that match your platform, then progress from first builds to porting, compartments, debugging, and assurance.

CHERI spans hardware, compilers, operating systems, C and C++ semantics, and security architecture. A staged path connects these layers to practical work without requiring them all in the first exercise. Begin with one maintained platform and add concepts as the experiments need them.

## Recommended learning path

### 1\. Understand the problem

Begin with:

- Vulnerabilities in Everyday Technology
- Why Existing Defences Are Not Enough
- Capabilities

A useful outcome from this stage is the ability to explain bounds, permissions, tags, and least privilege without referring to a particular processor.

### 2\. Run a prepared environment

Use [Run CHERI in Simulation](/guides/run-cheri-in-simulation/) to boot [CheriBSD](/software/cheribsd/) in QEMU or run a [CHERIoT](/hardware/cheriot/) example. Getting a supplied example working first gives later toolchain changes a known reference point.

Success means you can reproduce the build, name the architecture and application binary interface (ABI), and capture one deliberate capability fault.

### 3\. Build and inspect code

Complete [Build Your First Application](/guides/build-your-first-application/). Inspect the binary or firmware image with the target tools. Use the debugger to view a capability and identify its address, bounds, permissions, and tag.

### 4\. Port existing software

Choose a small library with tests. Classify each change rather than patching until it compiles. Typical categories are pointer-integer conversions, object bounds, custom allocation, serialisation, inline assembly, and ABI boundaries.

### 5\. Introduce a compartment

Move a parser or similarly narrow component behind a capability interface. Document what it receives and prove that it cannot reach an unrelated object or service.

## Maintained technical resources

### General CHERI and CheriBSD

[CHERI Frequently Asked Questions](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-faq.html) covers architecture, software, [Morello](/hardware/morello/), and CHERI-RISC-V questions.

cheribuild documents build targets for compilers, QEMU, CheriBSD, software development kits (SDKs), ports, and debugging tools.

CheriBSD Getting Started provides versioned guides for installing images, using hardware or emulation, compiling software, and benchmarking.

The [University of Cambridge](/organisations/university-of-cambridge/) CHERI project links architecture reports, programming guides, publications, and source repositories.

### CHERIoT

The [CHERIoT Programmer’s Guide](https://cheriot.org/book/) teaches the platform from architecture concepts through threads, memory management, compartments, drivers, networking, auditing, and board support.

The [CHERIoT getting-started chapter](https://cheriot.org/book/getting_started.html) covers the real-time operating-system (RTOS) repository, development container, simulator, and hardware targets.

The [cheriot-rtos repository](https://github.com/CHERIoT-Platform/cheriot-rtos) includes examples, exercises, SDK code, and the issue tracker.

The [CHERIoT project site](https://cheriot.org/) links current releases, community discussions, hardware, and articles.

### Linux, Zephyr, and ecosystem projects

The [CHERI Linux](/software/cheri-linux/) roadmap describes the cross-architecture path for kernel and user-space support.

The [CHERI Alliance](/organisations/cheri-alliance/) GitHub organisation hosts Linux, [Zephyr](/software/zephyr/), QEMU, debugger, and other collaborative repositories.

CHERI Alliance Working Groups describe the Alliance’s regular technical collaboration.

## Training for teams

A useful team workshop should produce artifacts, not only slides. Ask participants to deliver:

- a reproducible environment description
- one valid program and one controlled fault
- a capability inspection from the debugger
- a short porting log with root-cause categories
- a proposed compartment boundary and authority map
- open questions tied to the intended product
- Separate introductory learning from product assurance. A tutorial can show the mechanism, while an assurance claim needs a named architecture, implementation, build, workload, and threat model.

## Check material before relying on it

CHERI toolchains and target names evolve. Prefer documentation versioned with the source or release you are using. When following a conference recording or older tutorial:

- note its date and target architecture
- compare commands with the current repository
- avoid mixing Morello, generic CHERI-RISC-V, and CHERIoT flags
- record any changes needed to reproduce the exercise
- That reproduction log is useful learning in its own right and helps improve the documentation for the next developer.
