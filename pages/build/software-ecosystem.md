---
title: Software Ecosystem
permalink: /build/software-ecosystem/
summary: The software surrounding CHERI connects capability-aware compilers with operating systems, runtimes,
  debuggers, emulators, and existing application code.
image_url: null
updated_date: null
parent: /build/
next_page_url: /software/llvm-and-clang/
related:
  pages:
  - /build/platforms/platform-comparison/
  - /build/technology/capabilities/
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides:
  - choose-a-platform
  policies: []
navigation:
  header:
    category: Build
    subcategory: Resources
    order: 3
    heading: software-ecosystem
---

# Software Ecosystem

## From source code to capabilities

Compiler and language work determines how source-level pointers, native interfaces, bounds, permissions, and calling conventions reach a CHERI target.

### LLVM & Clang

The compiler infrastructure behind CheriBSD, Morello, CHERI-RISC-V, and CHERIoT software.

### Rust

How Rust language safety, unsafe native code, platform runtimes, and CHERI hardware protection relate.

## Complete software environments

Operating-system support preserves capability state through processes, virtual memory, system calls, executable loading, drivers, faults, and user space.

### CheriBSD

A FreeBSD-derived full-system environment for CHERI-RISC-V and Morello.

### FreeBSD

The upstream operating-system project from which CheriBSD is derived.

### CHERI Linux

Cross-architecture Linux work spanning the kernel, user space, toolchains, and platform SDKs.

### Zephyr

Capability protection in the Zephyr embedded operating-system ecosystem.

### Real-Time Operating Systems

The different RTOS and embedded-system routes being explored across CHERI.

## Making capability state visible

Capability-aware diagnostics and public project information show how individual software environments represent, preserve, and report CHERI state.

### Debugging Tools

GDB, LLDB, QEMU, operating-system diagnostics, and binary tools with capability-aware extensions.

### Porting Status

Why support is reported by platform, ABI, operating system, package set, and project revision.
