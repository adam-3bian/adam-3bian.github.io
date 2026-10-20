---
title: Software Ecosystem
permalink: /build/software-ecosystem/
where-next:
  url: /software/llvm-and-clang/
related-pages:
- url: /guides/choose-a-platform/
  title: Choose a Platform
  description: Compare the available hardware, FPGA, and simulation routes into CHERI development.
  action: Read this page
- url: /build/technology/how-cheri-capabilities-work/
  description: Understand the capability model that underpins CHERI systems and software.
  action: Read this page
summary: The software surrounding CHERI connects capability-aware compilers with operating systems, runtimes, debuggers,
  emulators, and existing application code.
card_sections:
- title: From source code to capabilities
  id: directory-from-source-code-to-capabilities
  groups:
  - entries:
    - url: /software/llvm-and-clang/
      description: The compiler infrastructure behind CheriBSD, Morello, CHERI-RISC-V, and CHERIoT software.
    - url: /software/rust/
      description: How Rust language safety, unsafe native code, platform runtimes, and CHERI hardware protection
        relate.
    intro: Compiler and language work determines how source-level pointers, native interfaces, bounds, permissions,
      and calling conventions reach a CHERI target.
- title: Complete software environments
  id: directory-complete-software-environments
  groups:
  - entries:
    - url: /software/cheribsd/
      description: A FreeBSD-derived full-system environment for CHERI-RISC-V and Morello.
    - url: /software/freebsd/
      description: The upstream operating-system project from which CheriBSD is derived.
    - url: /software/cheri-linux/
      description: Cross-architecture Linux work spanning the kernel, user space, toolchains, and platform SDKs.
    - url: /software/cheri-zephyr/
      description: Capability protection in the Zephyr embedded operating-system ecosystem.
    - url: /software/real-time-operating-systems/
      description: The different RTOS and embedded-system routes being explored across CHERI.
    intro: Operating-system support preserves capability state through processes, virtual memory, system calls,
      executable loading, drivers, faults, and user space.
- title: Making capability state visible
  id: directory-making-capability-state-visible
  groups:
  - entries:
    - url: /software/debugging-tools/
      description: GDB, LLDB, QEMU, operating-system diagnostics, and binary tools with capability-aware extensions.
    - url: /software/porting-status/
      description: Why support is reported by platform, ABI, operating system, package set, and project revision.
    intro: Capability-aware diagnostics and public project information show how individual software environments
      represent, preserve, and report CHERI state.
---
