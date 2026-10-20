---
layout: page
title: Software Ecosystem
summary: The software surrounding CHERI connects capability-aware compilers with operating systems, runtimes, debuggers, emulators, and existing application code.
permalink: /build/software-ecosystem/
slug: build-software-ecosystem
navigation:
  header:
    category: Build
    subcategory: Software Ecosystem
related:
- type: page
  slug: build-software-ecosystem-llvm-and-clang
  relation: next_step
- type: guide
  slug: choose-a-platform
  relation: related
- type: page
  slug: build-technology-how-cheri-capabilities-work
  relation: related
- type: page
  slug: build-software-ecosystem-llvm-and-clang
  relation: From source code to capabilities
- type: page
  slug: build-software-ecosystem-rust
  relation: From source code to capabilities
- type: repository
  slug: cheribsd
  relation: Complete software environments
- type: page
  slug: build-software-ecosystem-cheri-linux
  relation: Complete software environments
- type: repository
  slug: cheri-zephyr
  relation: Complete software environments
- type: page
  slug: build-software-ecosystem-real-time-operating-systems
  relation: Complete software environments
- type: page
  slug: build-software-ecosystem-debugging-tools
  relation: Making capability state visible
- type: page
  slug: build-software-ecosystem-porting-status
  relation: Making capability state visible
---

## Overview

Compiler and language work determines how source-level pointers, native interfaces, bounds, permissions, and calling conventions reach a CHERI target.


See [/software/freebsd/](/repositories/cheribsd/).


Operating-system support preserves capability state through processes, virtual memory, system calls, executable loading, drivers, faults, and user space.


Capability-aware diagnostics and public project information show how individual software environments represent, preserve, and report CHERI state.
