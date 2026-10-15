---
title: CHERI Products
permalink: /build/platforms/cheri-products/
summary: CHERI products span processor designs, chips, development boards, operating systems, toolchains, and
  software used to explore or build capability-based systems.
image_url: null
updated_date: null
parent: /build/
next_page_url: /build/platforms/platform-comparison/
related:
  pages:
  - /adopt/assurance-and-adoption/cheri-enabled-products/
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides:
  - downloads
  policies: []
navigation:
  header:
    category: Build
    subcategory: Resources
    order: 4
---

# CHERI Products

CHERI is available in more than one kind of product. A processor core supplies the architectural mechanism; a chip or development board makes that mechanism available in hardware; an operating system and toolchain make it usable by software. The entries below describe those different layers without treating them as interchangeable.

Availability and project status can change. The status shown here reflects the public CHERI Alliance directory in August 2026.

## Processor designs, chips, and boards

### CHERIoT Ibex embedded processor

- Organisation: Microsoft
- Type: processor intellectual property
- Status: released; CHERI Enabled

CHERIoT Ibex is a 32-bit RISC-V microcontroller core implementing the CHERIoT instruction-set architecture for compartmentalised embedded systems.

### Codasip X730

- Organisation: Codasip
- Type: processor intellectual property
- Status: released; CHERI Enabled

The X730 is a 64-bit application-processor core implementing CHERI-RISC-V, with pure-capability and hybrid execution support.

### CHERIoT Kudu

- Organisation: Microsoft
- Type: processor intellectual property
- Status: active development

Kudu is part of the CHERIoT embedded ecosystem and represents continuing development beyond the Ibex core.

### CVA6-CHERI

- Organisation: Capabilities Limited
- Type: processor intellectual property
- Status: released

CVA6-CHERI brings CHERI extensions to the open CVA6 application-class RISC-V core.

### ICENI

- Organisation: SCI Semiconductor
- Type: chip
- Status: released

ICENI is a CHERI-based semiconductor product for embedded and connected systems.

### Morello

- Organisation: Arm
- Type: development board
- Status: released experimental platform

Morello combines an experimental Arm capability architecture with hardware, CheriBSD, and development tools.

### Sonata

- Organisation: lowRISC
- Type: development platform
- Status: released

Sonata is an FPGA-based CHERIoT platform intended for embedded software and hardware exploration.

### X730 Evaluation Kit

- Organisation: Codasip
- Type: development board
- Status: released

The evaluation kit makes the X730 processor and its associated software environment available for application-class CHERI-RISC-V development.

## Operating systems and runtimes

- CHERI Linux: released Linux work for CHERI-enabled architectures.
- CheriBSD: released FreeBSD-derived operating system with hybrid and pure-capability CHERI support.
- seL4: released work combining CHERI with the seL4 microkernel ecosystem.
- CHERI FreeRTOS: in development for capability-aware microcontroller systems.
- CHERIoT RTOS: released real-time operating system built around small, mutually distrusting compartments.
- CHERI Android for Morello: released experimental Android port for the Morello platform.
- CHERI Zephyr: ongoing work on CHERI memory protection and compartmentalisation in Zephyr.

## Software and development tools

- U-Boot: released bootloader support used by CHERI platforms.
- OpenSBI: released RISC-V supervisor binary interface support.
- QEMU: released emulation support for CHERI-RISC-V environments.
- Morello Fixed Virtual Platform: released model of the Morello platform.
- CHERI LLVM: released compiler and linker support for capability-aware C and C++.
- CHERI GDB: debugger support under active development.
- Newlib: released C-library support used by embedded CHERI environments.
- Musl C: capability-aware C-library work for Linux-oriented environments.

## Product and certification claims

Inclusion in this directory records a publicly described CHERI product or project. It does not mean that the Alliance has certified the product. CHERI Enabled is the separate programme that connects a certification mark to a named product, version, evidence record, and defined scope.
