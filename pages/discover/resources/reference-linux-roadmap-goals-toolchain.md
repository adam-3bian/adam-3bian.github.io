---
layout: page
title: Toolchain - CHERI Roadmap for Linux
summary: Toolchain - CHERI Roadmap for Linux — CHERI Alliance information and resources.
permalink: /reference/linux-roadmap/goals/toolchain.html
slug: reference-linux-roadmap-goals-toolchain
navigation:
  header:
    category: Discover CHERI
    subcategory: Resources
---

## [Toolchain](/reference/linux-roadmap/goals/toolchain.html#toolchain)

| Topic | Type | Description |
| --- | --- | --- |
| LLVM / Clang | Engineering | The existing CHERI and Morello LLVM toolchains can already be used to \[cross-\]compile C/C++ Linux components. LLVM can be used to build Android’s bionic libc, musl libc, and newlib for bare-metal applications. Glibc is now working towards supporting LLVM as a first class citizen and an early version with CHERI support is available for RISC-V. At least the following work needs to take place: Upstream Morello LLVM support to baseline CHERI LLVM. Integrate CHERIoT support into baseline CHERI LLVM \[not required for Linux, but an important engineering TODO for CHERI LLVM on the path to upstreaming to mainstream LLVM\]. Transition from the SRI/Cambridge prototype CHERI-RISC-V ISA to the standardized CHERI-RISC-V ISA as it matures. Upstream CHERI LLVM support to baseline LLVM, optionally with Morello backend support \[subject to Arm’s readiness for this\]. |
| LLVM / Rust | Engineering | Rust is already present in the Linux kernel and although it only currently is available for x86\_64, support is likely to spread to other architectures. Some user space applications on newer Linux distributions also require Rust. There are currently two independently developed CHERI Rust compilers available for Morello. The long term aim should be to get CHERI support upstreamed to the Rust community but again this requires updating the compiler to the latest upstream version. |
| GCC | Engineering | Arm has performed an initial prototype adaptation of GCC to support Morello, but it is of lower overall maturity – albeit promising in that it can already be used to compile glibc. Having more mature GCC support is an important milestone towards the adoption of CHERI in Linux distributions. Ideally Morello GCC would evolve into CHERI GCC over time. |
| CHERI GDB | Engineering | Minor extensions may be required to CHERI GDB to work with CHERI Linux, although it is already believed to work well on Morello Linux as the preferred debugger on that platform. Further adaptation will be required as library compartmentalisation is brought up – which should ideally be shared with GDB support for CheriBSD’s c18n feature. |
| Purecap LLVM | Engineering | At present, LLVM can cross-compile code using CHERI capabilities for all pointers ("purecap"), but it is not itself running using capabilities and instead relies on platforms' support for legacy ("hybrid/integer mode") binaries.The lack of a purecap LLVM JIT likely blocks porting of an appreciable amount of software and the lack of a libclang prevents its inclusion in development tools. (A purecap GCC is eventually also useful, but it is less used as a library). |
