---
layout: detail
title: CheriBSD
summary: Develop and run complete applications on an operating system adapted for CHERI.
permalink: /repositories/cheribsd/
slug: cheribsd
navigation:
  header:
    category: Build
    subcategory: Software Ecosystem
repository:
  type: operating_system
resources:
- type: repository
  label: CheriBSD source code
  url: https://github.com/CTSRD-CHERI/cheribsd
related:
- type: page
  slug: build-software-ecosystem-llvm-and-clang
  relation: related
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

CheriBSD extends FreeBSD with support for CHERI, providing a complete application-class environment for developing, porting and testing CHERI software on CHERI-RISC-V and Arm Morello.

It brings CHERI capabilities through the operating system and software stack, allowing developers to work with real applications, libraries and services rather than isolated examples.

## Why use CheriBSD?

CheriBSD provides a familiar Unix environment in which developers can explore how existing software behaves when pointers become CHERI capabilities and hardware-enforced memory protection extends across applications and the operating system.

You can use CheriBSD to:

- develop and port applications to CHERI
- experiment with hybrid and pure-capability software
- build and test substantial existing C and C++ codebases
- investigate capability faults and compatibility issues
- work with libraries, networking, filesystems and operating-system services
- develop using QEMU or supported physical hardware

For many developers exploring application-class CHERI, CheriBSD provides the software environment in which the different parts of the CHERI ecosystem come together.

## Hybrid and pure-capability software

CheriBSD supports both hybrid and pure-capability software models.

In a hybrid environment, conventional pointers and CHERI capabilities can coexist, providing a route for progressively adapting existing software.

In a pure-capability environment, language-visible pointers are represented as capabilities, allowing CHERI protection to be applied systematically throughout applications and supporting libraries.

CheriBSD's pure-capability environment, known as CheriABI, has enabled substantial existing software to be ported and tested, providing valuable experience of the compatibility issues that arise when moving existing code to capability-based systems.

## What does CheriBSD include?

CHERI support in a general-purpose operating system goes far beyond the processor and compiler. Capabilities need to work throughout the software stack.

CheriBSD integrates CHERI across areas including:

- the FreeBSD kernel
- hybrid and pure-capability ABIs
- system libraries
- executable loading and dynamic linking
- system calls, signals and faults
- debugging and developer tools
- third-party software packages
- supported simulators and hardware platforms

This provides a complete environment for exploring CHERI at application and system level.

## Development environments

### CHERI-RISC-V and QEMU

`cheribuild` provides an integrated route for building a compatible CHERI toolchain, QEMU, CheriBSD and disk image.

This allows developers to create a complete application-class CHERI development environment without requiring physical hardware, making it a practical starting point for software development and porting.

### Morello

CheriBSD supports Morello's hybrid and pure-capability software environments.

Together with the corresponding CHERI compiler, firmware and platform support, Morello provides a physical application-class platform for developing and evaluating CHERI software.

### Other CHERI-RISC-V platforms

CheriBSD can also run on supported CHERI-RISC-V processor and FPGA platforms where the architecture and system implementation provide the required operating-system support.

Support is platform-specific, so check the processor architecture, CheriBSD version and board configuration before selecting a hardware target.

## Porting software to CheriBSD

One of CheriBSD's most important roles has been providing a realistic environment for understanding how existing software adapts to CHERI.

Many applications compile with relatively small changes, while others expose assumptions about:

- pointer sizes and representations
- converting between pointers and integers
- object bounds
- memory allocation
- application binary interfaces
- interactions with native libraries

These are often exactly the assumptions that need attention when moving existing software towards a pure-capability environment.

## Relationship to FreeBSD

CheriBSD extends FreeBSD rather than defining a completely separate operating system. It retains familiar Unix interfaces, networking, filesystems, build infrastructure and source organisation while adding the architectural and software changes needed for CHERI.

Generally useful changes can be contributed to FreeBSD, while CHERI-specific architecture and ABI development can continue within CheriBSD.

A standard FreeBSD installation should therefore not be confused with a complete CheriBSD environment.

## Choosing CheriBSD

CheriBSD is particularly useful when you want to:

- develop application-class CHERI software
- port substantial existing applications
- explore pure-capability software
- investigate operating-system support for CHERI
- evaluate software on QEMU before moving to hardware
- compare software behaviour across CHERI platforms
- use CheriBSD as a reference for porting other operating systems to CHERI

CheriBSD is primarily a research and development platform for application-class CHERI, rather than a direct replacement for Linux or a single fixed product configuration. Its extensive integration of CHERI across the kernel, ABI, libraries and user space also makes it a useful reference for operating-system developers implementing CHERI support elsewhere.

For developers getting started, the natural route is cheribuild + QEMU + CheriBSD, before moving to an FPGA or physical CHERI platform when hardware-specific behaviour becomes important.

## Project links

- [`cheribuild`](https://github.com/CTSRD-CHERI/cheribuild)
- [CheriBSD source](https://github.com/CTSRD-CHERI/cheribsd)
- [CheriBSD Getting Started](https://www.cheribsd.org/getting-started/)
- [CheriBSD ports](https://github.com/CTSRD-CHERI/cheribsd-ports)


See [/software/freebsd/](/repositories/cheribsd/).
