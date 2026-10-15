---
title: Morello
image_url: /assets/hardware/morello/placeholder.svg
website_url: https://developer.arm.com/Architectures/Morello
repository_urls:
- https://github.com/CTSRD-CHERI/cheribuild
type: null
architecture: null
status: null
related:
  organisations:
  - university-of-cambridge
  - sri
  hardware:
  - cheriot
  software:
  - debugging-tools
  - cheribsd
  - llvm-and-clang
navigation:
  header:
    category: Build
    subcategory: Resources
    parent: development-platforms
    order: 5
---

# Morello

Morello is Arm’s application-class CHERI prototype platform, combining custom silicon, a development board, toolchains, and full operating-system stacks.

Evaluating CHERI on an FPGA answers many architectural questions, but not every question about a high-performance application processor. Morello provides real prototype silicon and a board on which complete operating systems and large applications can use CHERI capabilities.

## What Morello is

Morello is an Arm-developed prototype platform produced through the UK Digital Security by Design programme in collaboration with the [University of Cambridge](/organisations/university-of-cambridge/) and [SRI International](/organisations/sri/).

The name is used for related but distinct elements:

- the Morello prototype architecture, based on AArch64 with CHERI features
- the Morello processor and system-on-chip implementation
- the Morello development board
- firmware and software development resources for that board
- Morello demonstrates one application-class CHERI design. It is not the definition of CHERI and should not be used as a generic name for CHERI-RISC-V or [CHERIoT](/hardware/cheriot/).

## Software environment

The Morello ecosystem includes:

- CHERI-aware LLVM and [Clang](/software/llvm-and-clang/)
- hybrid and pure-capability application binary interfaces (ABIs)
- [CheriBSD](/software/cheribsd/) with a broad Unix user space
- CHERI-related Linux and Android work
- QEMU, debugging tools, libraries, language runtimes, and application ports
- cheribuild is a common open-source route for building Morello LLVM, CheriBSD, disk images, and related tools from compatible source revisions.

## When to choose Morello

Morello remains useful when you need to:

- reproduce or extend an existing Morello project
- evaluate pure-capability software on Arm prototype silicon
- measure real hardware behaviour rather than simulator execution
- investigate Morello-specific ABI or microarchitecture questions
- use a mature CheriBSD application stack developed around the board
- compare earlier Morello evidence with a new platform

For a new commercial product, compare current supplier platforms and lifecycle commitments. Morello was designed as an evaluation platform rather than a mass-market production processor.

## Access routes

Developers may work with:

- an existing physical Morello board
- remote access through a lab or partner facility
- software builds and selected emulation without a local board
- Board availability, remote-lab access, firmware, and supported images change over time. Confirm the current route through Arm, CheriBSD documentation, or the organisation operating the lab.

## Development workflow

1. Identify the required Morello firmware and board revision.
2. Build or obtain a matching Morello software development kit (SDK) and operating-system image.
3. Boot a known example before changing firmware or kernel components.

Confirm whether each binary is conventional, hybrid, or pure capability.

Run functional and capability-fault tests.

Record hardware, firmware, compiler, operating-system, and source revisions.

Measure representative workloads on the board if performance matters.

Do not mix arbitrary firmware, kernel, and user-space releases. Capability ABI and platform support must remain aligned.

## Strengths

- Real application-class CHERI silicon.
- Mature CheriBSD and LLVM/Clang integration.
- Support for substantial existing C and C++ software.
- Extensive public reports and programme evidence.
- A shared target used across many demonstrator and porting projects.

## Constraints

- Morello is a prototype architecture and board.
- Physical boards are less accessible than local simulation.
- Its performance and encoding choices do not predict every future CHERI processor.
- Software built specifically for the Morello ABI is not automatically portable to CHERI-RISC-V.
- Long-term product support must be assessed separately from research and evaluation access.

Use the Arm Morello resources, CheriBSD Getting Started, and cheribuild for current technical instructions. For its place in the wider timeline, read Morello History.
