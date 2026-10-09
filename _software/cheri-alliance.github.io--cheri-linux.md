---
title: CHERI Linux
layout: source
permalink: /sources/cheri-alliance.github.io/build/software-ecosystem/cheri-linux/
---

1. Build
2. Software Ecosystem
3. CHERI Linux
{: .source-breadcrumbs }

# CHERI Linux
{: id="page-hero-title" .page-hero-title }

CHERI Linux adapts the kernel and user-space foundations so Linux workloads can use capability memory protection across supported processors.
{: .page-hero-summary }

Linux support matters to products and services that already depend on its kernel interfaces, drivers, user space, and package ecosystem. A CHERI processor and compiler are only part of that environment: capability state also passes through boot, scheduling, virtual memory, system calls, signals, executable loading, debugging, and system libraries.

CHERI Linux is the cross-project effort to provide that support across CHERI architectures and implementations.

## Scope of the software stack
{: id="scope-of-the-software-stack" }

Linux enablement reaches architecture boot and exceptions, capability register context, virtual memory, user access, executable loading, system-call ABIs, signals, tracing, core dumps, device interactions, C libraries, dynamic loaders, and root-file-system builds.

These layers form one compatible stack. Kernel capability support and pure-capability user space are related but distinct areas of work.

## Current organisation
{: id="current-organisation" }

The CHERI Alliance Linux Working Group coordinates a cross-architecture roadmap, priorities, public repositories, and contribution routes. Public development includes CHERI-RISC-V kernel and user-space work as well as experience from earlier Morello Linux projects.

CHERI support is not currently a standard feature of a mainline Linux release. Active branches are rebased as the base kernel, architecture specifications, toolchains, and platform software develop.

## Development environments
{: id="development-environments" }

A CHERI Linux environment can combine a cross compiler, kernel source and configuration, QEMU or a supplier simulator, a root-file-system build, C library and dynamic-loader changes, and board or FPGA deployment tools.

Commercial processor platforms may package these components as a tested SDK for a particular architecture and implementation. Academic and community environments may expose more individual branches and build components.

## Where CHERI Linux fits
{: id="where-cheri-linux-fits" }

CHERI Linux is relevant where Linux APIs, drivers, services, or deployment models are central to the intended system. It complements CheriBSD, which has a longer history as a complete pure-capability research environment, and embedded routes such as CHERIoT and CHERI-enabled Zephyr.

Coverage varies by kernel branch, processor, ABI, C library, package set, system-call surface, driver support, and test platform. A small bootable environment and a broad distribution therefore represent different stages of software coverage.

## Project links
{: id="project-links" }

- [CHERI Roadmap for Linux](https://cheri-alliance.github.io/linux-roadmap/)
- [CHERI Linux project documentation](https://cheri-linux.org/)
- [CHERI Alliance repositories](https://github.com/CHERI-Alliance)
- [CHERI Linux Working Group](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-linux-working-group/)

## Where next
{: .where-next-title }

### [Zephyr](https://cheri-alliance.github.io/build/software-ecosystem/zephyr/)
{: .where-next-card-title }





[Zephyr brings CHERI work into a widely used embedded operating-system ecosystem.](https://cheri-alliance.github.io/build/software-ecosystem/zephyr/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/build/software-ecosystem/zephyr/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CheriBSD](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .related-pages-item-title }





[A mature full-system environment for application-class CHERI research and software ports.](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/software-ecosystem/cheribsd/)
{: .source-card-label }





### [CHERI Linux Working Group](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-linux-working-group/)
{: .related-pages-item-title }





[Alliance collaboration around the roadmap, interfaces, and contribution routes for Linux support.](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-linux-working-group/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-linux-working-group/)
{: .source-card-label }





### [Choose a Platform](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-title }





[Compare platforms that provide Linux, CheriBSD, embedded runtimes, or simulation environments.](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .source-card-label }
