---
layout: page
title: Introduction
summary: 'CHERI is a hardware approach to memory safety that proposes an extension to established ISAs, such as Arm, RISC-V, and x86, that replaces simple (integer) pointers with a tagged capability data type, and adds capability-aware instructions to load, store, and manipulate the capability type.

  For existing software to benefit from the memory-safety and compartmentalization features of CHERI, it must be recompiled for this extended ISA, which may require porting to use pointer types appropriately.'
permalink: /reference/linux-roadmap/intro.html
slug: reference-linux-roadmap-intro
navigation:
  header:
    category: Discover CHERI
    subcategory: Resources
---

## Overview

For most applications, this is a minor adaptation task, although language runtimes can require more work. On the OS side, however, there is significant work required to enable support for capability-extended kernels, process environments, virtual machines, and so on. Extensive research and development activity has gone into porting a version of FreeBSD, called [CheriBSD](https://www.cheribsd.org/), to use CHERI’s features, and in particular explore and evaluate the sizeable design space of potential CHERI integrations with a general-purpose, MMU-based operating system. This work has been highly successful, with memory-safe ports of the FreeBSD kernel and userlevel, and over 10,000 open source packages using a CHERI-adapted LLVM toolchain.

With a clear set of abstractions now defined, and existing prototypes evaluated at scale, it is expected that future OS adaptations will be substantially less work. We hope that efforts, such as CHERI Linux, will be able to benefit from this research, allowing a more engineering-oriented approach in most cases. To date, the work on Linux has been less comprehensive, though the partial ports of the Linux kernel, Busybox, GCC and glibc, and Linux userspace packages have been sufficient to demonstrate feasibility.

We envision that future work would target CHERI support on Arm’s Morello prototype, CHERI-RISC-V-based platforms, and any future CHERI-enabled platforms (e.g., on x86 or possible future Arm implementations of CHERI), with the intention of reproducing the CheriBSD approach of implementing portable abstractions despite underlying architectural differences. We also believe that, generally, programming abstractions (and guarantees) for CHERI should be portable across operating systems, allowing application adaptation burden to be shared, and for CHERI Linux to benefit from existing work in this space. Inevitably there will be some differences around OS-specific APIs and features, but to the extent possible, this should be minimized.
