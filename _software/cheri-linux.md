---
title: CHERI Linux
image_url: null
website_url: https://cheri-linux.org/
repository_urls: []
type: null
status: null
related:
  organisations: []
  hardware: []
  software:
  - cheribsd
---

# CHERI Linux

CHERI Linux adapts the kernel and user-space foundations so Linux workloads can use capability memory protection across supported processors.

Linux support matters to products and services that already depend on its kernel interfaces, drivers, user space, and package ecosystem. A CHERI processor and compiler are only part of that environment: capability state also passes through boot, scheduling, virtual memory, system calls, signals, executable loading, debugging, and system libraries.

CHERI Linux is the cross-project effort to provide that support across CHERI architectures and implementations.

## Scope of the software stack

Linux enablement reaches architecture boot and exceptions, capability register context, virtual memory, user access, executable loading, system-call ABIs, signals, tracing, core dumps, device interactions, C libraries, dynamic loaders, and root-file-system builds.

These layers form one compatible stack. Kernel capability support and pure-capability user space are related but distinct areas of work.

## Current organisation

The CHERI Alliance Linux Working Group coordinates a cross-architecture roadmap, priorities, public repositories, and contribution routes. Public development includes CHERI-RISC-V kernel and user-space work as well as experience from earlier Morello Linux projects.

CHERI support is not currently a standard feature of a mainline Linux release. Active branches are rebased as the base kernel, architecture specifications, toolchains, and platform software develop.

## Development environments

A CHERI Linux environment can combine a cross compiler, kernel source and configuration, QEMU or a supplier simulator, a root-file-system build, C library and dynamic-loader changes, and board or FPGA deployment tools.

Commercial processor platforms may package these components as a tested SDK for a particular architecture and implementation. Academic and community environments may expose more individual branches and build components.

## Where CHERI Linux fits

CHERI Linux is relevant where Linux APIs, drivers, services, or deployment models are central to the intended system. It complements CheriBSD, which has a longer history as a complete pure-capability research environment, and embedded routes such as CHERIoT and CHERI-enabled Zephyr.

Coverage varies by kernel branch, processor, ABI, C library, package set, system-call surface, driver support, and test platform. A small bootable environment and a broad distribution therefore represent different stages of software coverage.

## Project links

CHERI Roadmap for Linux

CHERI Linux project documentation

CHERI Alliance repositories

CHERI Linux Working Group
