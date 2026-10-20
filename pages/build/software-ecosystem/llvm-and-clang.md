---
layout: page
title: LLVM & Clang
summary: Compile C and C++ software for CHERI-enabled platforms.
permalink: /build/software-ecosystem/llvm-and-clang/
slug: build-software-ecosystem-llvm-and-clang
navigation:
  header:
    category: Build
    subcategory: Software Ecosystem
related:
- type: page
  slug: build-software-ecosystem-rust
  relation: next_step
- type: repository
  slug: cheribsd
  relation: related
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

LLVM and Clang provide the compiler foundation for much of the CHERI software ecosystem. They translate ordinary language-level operations, such as accessing objects through pointers, into code that uses CHERI capabilities and the protection they provide.

Clang is the C and C++ compiler developers interact with, while LLVM provides the underlying compiler infrastructure and code generation.

## What changes when compiling for CHERI?

CHERI hardware uses capabilities to control how software accesses memory. The compiler plays an important role in creating and preserving those capabilities as it translates source code into machine code.

Depending on the target platform, Clang can support:

- capability-based pointers
- hybrid and pure-capability software
- capability bounds and permissions
- CHERI-specific operations and intrinsics
- calling conventions and application binary interfaces (ABIs)
- diagnostics that identify assumptions in existing code that may not work correctly with capabilities

In many cases, existing C and C++ software can be compiled for CHERI with relatively small changes, while code that makes assumptions about pointers, memory layouts or integer conversions may require more attention.

## Hybrid and pure-capability builds

CHERI platforms can support different ways of introducing capabilities into existing software.

In a hybrid environment, conventional pointers can coexist with CHERI capabilities. This can be useful when bringing up platforms and progressively adapting existing software.

In a pure-capability environment, pointers are represented as CHERI capabilities throughout applications and supporting software, providing stronger and more systematic enforcement.

The available models and ABIs depend on the target platform. Morello, application-class CHERI-RISC-V and CHERIoT therefore use toolchains configured for their respective architectures and software environments.

## CHERI toolchain routes

### CheriBSD and CHERI-RISC-V

The `cheribuild` environment brings together a compatible LLVM and Clang toolchain, system headers, linker, QEMU, and CheriBSD image. It supports application-class CHERI-RISC-V work across hybrid and pure-capability software configurations.

### Morello

Morello uses an Arm-based CHERI compiler and ABI together with its corresponding system software and platform support.

The Morello software environment has been widely used to develop and port applications to CHERI and explore the transition between conventional and pure-capability software.

### CHERIoT

The CHERIoT SDK uses a Clang-based toolchain aligned with the CHERIoT instruction set, RTOS, compartment model, linker, and firmware build system.

### Mainline LLVM

Parts of CHERI support are already present in upstream LLVM, while complete target support can still depend on platform-specific branches and releases. A key focus for the CHERI Alliance is bringing this work together, driving convergence across CHERI platforms and helping move towards common, upstream LLVM support.

## Bounds and compatibility

CHERI compilers can use information about objects and allocations to create capabilities with appropriate bounds and permissions.

How tightly those bounds are applied can vary between platforms and configurations, balancing stronger protection with compatibility requirements. As a result, compiler version, target architecture, ABI and software environment all matter when building or comparing CHERI software.

Code that assumes that pointers and integers have the same representation, or relies heavily on particular object layouts or pointer manipulation, may need additional attention when moving to a CHERI target.

## Getting started

For most developers, there is no need to build or understand the CHERI compiler infrastructure itself. Start with the toolchain supplied or recommended for your chosen platform.

For application-class CHERI development, `cheribuild` provides an integrated route to LLVM/Clang, QEMU and CheriBSD. For embedded development, use the toolchain and SDK associated with the target platform, such as CHERIoT.

From there, the next step is to [compile existing software](/guides/port-existing-software/), understand any compatibility warnings or errors, and progressively adapt the code to make effective use of CHERI's protection.


## Project links

- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild)
- [LLVM project](https://llvm.org/)
- [CHERIoT Programmer’s Guide](https://cheriot.org/book/)
