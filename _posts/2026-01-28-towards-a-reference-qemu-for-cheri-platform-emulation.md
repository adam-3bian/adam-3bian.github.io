---
layout: article
title: Towards a reference QEMU for CHERI platform emulation
summary: QEMU is one of the most popular open source machine emulators ([https://www.qemu.org](https://www.qemu.org)), with support for many CPU architectures, including x86\_64, Arm and RISC-V.
permalink: /news/towards-a-reference-qemu-for-cheri-platform-emulation/
slug: towards-a-reference-qemu-for-cheri-platform-emulation
navigation:
  header:
    category: News & Events
    subcategory: News & Analysis
image:
  src: /assets/images/posts/2026-01-28-towards-a-reference-qemu-for-cheri-platform-emulation.webp
  alt: CHERI Alliance Working Groups logo
  width: 752
  height: 423
  fit: contain
date: '2026-01-28T10:00:59+00:00'
post:
  category: cheri-alliance-news
  tags:
  - CHERI Alliance news
  - Working Groups
  authors:
  - person: alfredo-mazzinghi
---

## Overview

The QEMU emulator is critical for systems research and development: it makes it possible to quickly prototype, debug and analyse architectural extensions and OS implementations without the need for dedicated hardware implementations in FPGA or silicon.

QEMU monitoring features, such as instruction-level tracing and GDB integration are particularly important to make system software development easier.

It is important to remember that QEMU is not a system simulator (such as gem5 [https://www.gem5.org](https://www.gem5.org)) and it does not attempt to be cycle-accurate. Instead, it is a functionally accurate emulation of the target platform. This is very useful for systems validation and development, but it is not representative of CHERI systems’ performance.

## QEMU in the CHERI ecosystem

The QEMU emulator maintains a central role in the CHERI software ecosystem. Historically, CHERI support in QEMU dates back to the initial MIPS CHERI prototypes, with both 128-bit compressed and 256-bit uncompressed capabilities, developed at the [University of Cambridge](/organisations/university-of-cambridge/) and [SRI](/organisations/sri/).

The convergence of multiple QEMU CHERI patches into a single reference implementation has been almost a year-long process throughout 2025 that involved contributors from multiple organisations, including the [University of Cambridge](/organisations/university-of-cambridge/), [Capabilities Limited](/organisations/capabilities-limited/), [Codasip](/organisations/codasip/) and [Google](/organisations/google/).

As of January 2026, we are excited to announce that the CHERI Alliance hosts a reference QEMU implementation that supports multiple modern CHERI platforms based on Arm and RISC-V. These include the [Arm Morello platform](/products/morello/), the [CHERI RISC-V standard draft 0.9.3](https://riscv.github.io/riscv-cheri/) and the University of Cambridge RISC-V ISA v9.

The CHERI Alliance reference implementation is an important milestone for future development and integration of CHERI support in QEMU.

Downstream users can now rely on a common implementation and a central repository for tracking issues and submitting CHERI-related patches. This effort is also contributing to the expansion of the CHERI Alliance CI infrastructure, with the goal of both providing stable QEMU images to test third-party software and validating QEMU itself.

The QEMU Working Group has set out three major goals for 2026: integrate CHERI patches on more modern QEMU versions, continue work to support the latest and upcoming iterations of the CHERI RISC-V standard, and improve the QEMU CI infrastructure.

The current CHERI patches are maintained on top of a relatively old QEMU version v7.0.0. This is becoming a substantial limitation for CHERI development, as this version lacks support for some important RISC-V extensions. The reference implementation is expected to reach QEMU v8 in the coming months.

As the CHERI RISC-V standard is finalised, the goal of the QEMU Working Group is committed to facilitate support and refinement for the standard CHERI RISC-V platforms, such as the Codasip X730 application core on the Codasip Prime platform.

Finally, the Working Group is refining the approach for testing and validation of the reference QEMU CHERI. In particular, The Capable Hub is contributing to establish a robust CI infrastructure for QEMU and the wider CHERI Alliance software ecosystem.

## Conclusions

We expect 2026 to be an exciting year for the CHERI Alliance and the CHERI QEMU community as a whole. With no shortage of work in sight, we would like to encourage members of the Alliance and any other organisation interested in CHERI to check out the latest developments at [https://github.com/CHERI-Alliance/qemu](https://github.com/CHERI-Alliance/qemu) and join the monthly QEMU WG meetings by registering to the wg-qemu mailing list [https://lists.cheri-alliance.org](https://lists.cheri-alliance.org).

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
