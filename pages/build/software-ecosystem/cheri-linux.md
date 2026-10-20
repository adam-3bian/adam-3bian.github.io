---
layout: page/standard
title: CHERI Linux
summary: Bring CHERI hardware-enforced protection to Linux-based systems and applications.
permalink: /build/software-ecosystem/cheri-linux/
slug: build-software-ecosystem-cheri-linux
navigation:
  header:
    category: Build
    subcategory: Software Ecosystem
related:
- type: repository
  slug: cheri-zephyr
  relation: next_step
- type: repository
  slug: cheribsd
  relation: related
- type: working_group
  slug: cheri-linux-working-group
  relation: related
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

**Linux** is at the heart of many products, platforms and services. CHERI Linux is the effort to extend CHERI support through the Linux software stack, allowing existing Linux environments to take advantage of capability-based memory protection.

Supporting CHERI involves more than enabling a processor and compiler. Capabilities must work correctly through the kernel, virtual memory, system calls, executable loading, libraries, debugging and the wider user-space environment.

## Why CHERI Linux?

For organisations already building products and services around Linux, CHERI Linux provides a route towards adopting CHERI while retaining the familiar Linux ecosystem.

It is particularly relevant when you want to:

- bring CHERI to an existing Linux-based platform
- develop Linux applications for CHERI processors
- protect both applications and system software with CHERI capabilities
- reuse existing Linux interfaces, drivers and development practices
- evaluate CHERI for future Linux-based products
- contribute to making CHERI support available across the Linux ecosystem

## What needs to change?

CHERI support reaches across the Linux software stack. Areas of development include:

- processor architecture support and boot
- capability register and process state
- virtual memory
- system calls and signals
- executable loading
- tracing and debugging
- device and driver interactions
- C libraries and dynamic loaders
- user-space and root-filesystem environments

Kernel support and pure-capability user space are closely related, but they are distinct areas of development. A kernel capable of running on CHERI hardware does not by itself provide a complete pure-capability Linux environment.

## Development environments

A CHERI Linux development environment can bring together:

- a CHERI compiler and toolchain
- CHERI-enabled Linux kernel sources
- QEMU or another supported simulator
- user-space libraries and a root filesystem
- debugging and development tools
- an FPGA or physical processor platform when required

The exact environment depends on the processor architecture and implementation. Processor suppliers may also provide an integrated SDK containing compatible versions of these components.

## CHERI-RISC-V and other platforms

CHERI Linux development includes work targeting CHERI-RISC-V, alongside experience gained from earlier Linux development for Morello.

Support varies between processor implementations and software configurations, so developers should use the kernel, toolchain, libraries and platform software recommended for their chosen target.

A minimal Linux system that boots on a CHERI processor and a broad pure-capability Linux environment are also different milestones. Application, library, package and driver coverage grows as more of the ecosystem is adapted and tested.

## From kernel support to applications

Ultimately, CHERI Linux is about more than booting Linux on CHERI hardware.

For CHERI protection to extend through real workloads, capabilities need to be supported consistently across the operating system, system libraries, application interfaces and software packages.

This makes CHERI Linux relevant to both kernel and platform developers, who are enabling the underlying architecture, and application developers, who want to build and port software for CHERI-enabled Linux systems.

## Working towards common Linux support

CHERI Linux is a cross-project effort rather than a single processor-specific port. The [CHERI Alliance Linux Working Group](/groups/cheri-linux-working-group/) brings organisations and developers together to coordinate priorities, share implementation experience and help drive convergence across CHERI architectures and platforms.

The longer-term goal is to reduce platform-specific fragmentation and establish common approaches that can support CHERI integration across the wider Linux ecosystem.

## Where CHERI Linux fits

Choose CHERI Linux when Linux APIs, drivers, applications or deployment environments are important to your target system.

Other CHERI operating-system environments serve complementary needs. For example:

- [CheriBSD](/repositories/cheribsd/) provides a mature environment for application-class CHERI research, software porting and pure-capability experimentation, and is a useful reference for bringing CHERI to other operating systems
- [CHERI-Zephyr](/repositories/cheri-zephyr/) provides another route for embedded and RTOS development

CHERI Linux is therefore particularly important for bringing CHERI into the large body of software and products already built around Linux.

## Project links

- [CHERI Roadmap for Linux](/linux-roadmap/)
- [CHERI Linux project documentation](https://cheri-linux.org/)
- [CHERI Alliance repositories](https://github.com/CHERI-Alliance)
- [CHERI Linux Working Group](/groups/cheri-linux-working-group/)
