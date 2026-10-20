---
layout: page
title: CHERI Products
summary: CHERI products span processor designs, chips, development boards, operating systems, toolchains, and software used to explore or build capability-based systems.
permalink: /build/platforms/cheri-products/
slug: build-platforms-cheri-products
navigation:
  header:
    category: Build
    subcategory: Platforms
related:
- type: page
  slug: adopt-assurance-and-adoption-cheri-enabled-products
  relation: related
- type: guide
  slug: downloads
  relation: related
---

## Overview

CHERI is available in more than one kind of product. A processor core supplies the architectural mechanism; a chip or development board makes that mechanism available in hardware; an operating system and toolchain make it usable by software. The entries below describe those different layers without treating them as interchangeable.

Availability and project status can change. The status shown here reflects the public CHERI Alliance directory in August 2026.


## Processor designs, chips, and boards

- **[CHERIoT Ibex embedded processor](/adopt/assurance-and-adoption/cheriot-ibex-certification/)**. [CHERIoT Ibex](https://github.com/microsoft/cheriot-ibex) is a 32-bit RISC-V microcontroller core implementing the CHERIoT instruction-set architecture for compartmentalised embedded systems.
  Organization label: Microsoft.
  Product type: processor intellectual property.
  Release status: released; CHERI Enabled.
- **[Codasip X730](/adopt/assurance-and-adoption/x730-certification/)**. The [X730](https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/) is a 64-bit application-processor core implementing CHERI-RISC-V, with pure-capability and hybrid execution support.
  Organization label: Codasip.
  Product type: processor intellectual property.
  Release status: released; CHERI Enabled.
- **[CHERIoT Kudu](https://github.com/microsoft/cheriot-kudu)**. [CHERIoT Kudu](https://github.com/microsoft/cheriot-kudu) is part of the CHERIoT embedded ecosystem and represents continuing development beyond the Ibex core.
  Organization label: Microsoft.
  Product type: processor intellectual property.
  Release status: active development.
- **[CVA6-CHERI](https://github.com/lowRISC/cva6-cheri)**. [CVA6-CHERI](https://github.com/lowRISC/cva6-cheri) brings CHERI extensions to the open CVA6 application-class RISC-V core.
  Organization label: Capabilities Limited.
  Product type: processor intellectual property.
  Release status: released.
- **[ICENI](https://www.scisemi.com/products/iceni-device-family/)**. [ICENI](https://www.scisemi.com/products/iceni-device-family/) is a CHERI-based semiconductor product for embedded and connected systems.
  Organization label: SCI Semiconductor.
  Product type: chip.
  Release status: released.
- **[Morello](/products/morello/)**. [Morello](/products/morello/) combines an experimental Arm capability architecture with hardware, CheriBSD, and development tools.
  Organization label: Arm.
  Product type: development board.
  Release status: released experimental platform.
- **[Sonata](/products/sonata/)**. [Sonata](/products/sonata/) is an FPGA-based CHERIoT platform intended for embedded software and hardware exploration.
  Organization label: lowRISC.
  Product type: development platform.
  Release status: released.
- **[Codasip Prime platform](https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime/)**. The [Codasip Prime platform](https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime/) is an evaluation and development kit featuring the X730 processor and its associated software environment, available for application-class CHERI-RISC-V development.
  Organization label: Codasip.
  Product type: development board.
  Release status: released.


## Operating systems and runtimes

- **[CHERI Linux](/build/software-ecosystem/cheri-linux/)**. released Linux work for CHERI-enabled architectures.
- **[CheriBSD](/repositories/cheribsd/)**. released FreeBSD-derived operating system with hybrid and pure-capability CHERI support.
- **seL4**. released work combining CHERI with the seL4 microkernel ecosystem.
- **CHERI FreeRTOS**. in development for capability-aware microcontroller systems.
- **CHERIoT RTOS**. released real-time operating system built around small, mutually distrusting compartments.
- **CHERI Android for Morello**. released experimental Android port for the Morello platform.
- **[CHERI Zephyr](/repositories/cheri-zephyr/)**. ongoing work on CHERI memory protection and compartmentalisation in Zephyr.


## Software and development tools

- **U-Boot**. released bootloader support used by CHERI platforms.
- **OpenSBI**. released RISC-V supervisor binary interface support.
- **[QEMU](/build/software-ecosystem/simulators/)**. released emulation support for CHERI-RISC-V environments.
- **[Morello Fixed Virtual Platform](/build/software-ecosystem/simulators/)**. released model of the Morello platform.
- **[CHERI LLVM](/build/software-ecosystem/llvm-and-clang/)**. released compiler and linker support for capability-aware C and C++.
- **[CHERI GDB](/build/software-ecosystem/debugging-tools/)**. debugger support under active development.
- **Newlib**. released C-library support used by embedded CHERI environments.
- **Musl C**. capability-aware C-library work for Linux-oriented environments.


## Product and certification claims

Inclusion in this directory records a publicly described CHERI product or project. It does not mean that the Alliance has certified the product. [CHERI Enabled](/adopt/assurance-and-adoption/about-cheri-enabled/) is the separate programme that connects a certification mark to a named product, version, evidence record, and defined scope.
