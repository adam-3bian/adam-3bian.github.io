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
---

1. Build
2. Software Ecosystem
3. Software Ecosystem
{: .source-breadcrumbs }

# Software Ecosystem
{: id="page-hero-title" .page-hero-title }

The software surrounding CHERI connects capability-aware compilers with operating systems, runtimes, debuggers, emulators, and existing application code.
{: .page-hero-summary }

## From source code to capabilities
{: id="directory-from-source-code-to-capabilities" }

Compiler and language work determines how source-level pointers, native interfaces, bounds, permissions, and calling conventions reach a CHERI target.

### [LLVM &amp; Clang](/software/llvm-and-clang/)
{: .collection-card__title }

The compiler infrastructure behind CheriBSD, Morello, CHERI-RISC-V, and CHERIoT software.
{: .collection-card__summary }

Explore LLVM &amp; Clang
{: .collection-card__link }

### [Rust](/software/rust/)
{: .collection-card__title }

How Rust language safety, unsafe native code, platform runtimes, and CHERI hardware protection relate.
{: .collection-card__summary }

Explore Rust
{: .collection-card__link }

## Complete software environments
{: id="directory-complete-software-environments" }

Operating-system support preserves capability state through processes, virtual memory, system calls, executable loading, drivers, faults, and user space.

### [CheriBSD](/software/cheribsd/)
{: .collection-card__title }

A FreeBSD-derived full-system environment for CHERI-RISC-V and Morello.
{: .collection-card__summary }

Explore CheriBSD
{: .collection-card__link }

### [FreeBSD](/software/freebsd/)
{: .collection-card__title }

The upstream operating-system project from which CheriBSD is derived.
{: .collection-card__summary }

Explore FreeBSD
{: .collection-card__link }

### [CHERI Linux](/software/cheri-linux/)
{: .collection-card__title }

Cross-architecture Linux work spanning the kernel, user space, toolchains, and platform SDKs.
{: .collection-card__summary }

Explore CHERI Linux
{: .collection-card__link }

### [CHERI Zephyr](/software/cheri-zephyr/)
{: .collection-card__title }

Capability protection in the Zephyr embedded operating-system ecosystem.
{: .collection-card__summary }

Explore Zephyr
{: .collection-card__link }

### [Real-Time Operating Systems](/software/real-time-operating-systems/)
{: .collection-card__title }

The different RTOS and embedded-system routes being explored across CHERI.
{: .collection-card__summary }

Explore RTOS work
{: .collection-card__link }

## Making capability state visible
{: id="directory-making-capability-state-visible" }

Capability-aware diagnostics and public project information show how individual software environments represent, preserve, and report CHERI state.

### [Debugging Tools](/software/debugging-tools/)
{: .collection-card__title }

GDB, LLDB, QEMU, operating-system diagnostics, and binary tools with capability-aware extensions.
{: .collection-card__summary }

Explore debugging tools
{: .collection-card__link }

### [Porting Status](/software/porting-status/)
{: .collection-card__title }

Why support is reported by platform, ABI, operating system, package set, and project revision.
{: .collection-card__summary }

Explore porting status
{: .collection-card__link }

## Where next
{: .where-next-title }

### [LLVM &amp; Clang](/software/llvm-and-clang/)
{: .where-next-card-title }





[LLVM and Clang provide the compiler foundation used by much of the CHERI software ecosystem.](/software/llvm-and-clang/)
{: .where-next-summary }



[Continue](/software/llvm-and-clang/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Compare the available hardware, FPGA, and simulation routes into CHERI development.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }






### [Capabilities](/build/technology/capabilities/)
{: .related-pages-item-title }





[Understand the capability model that underpins CHERI systems and software.](/build/technology/capabilities/)
{: .related-pages-item-summary }



[Read this page](/build/technology/capabilities/)
{: .source-card-label }
