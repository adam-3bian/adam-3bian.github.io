---
title: RISC-V and Embedded Development
permalink: /discover/history/risc-v-and-embedded-development/
summary: CHERI-RISC-V opened the architecture to configurable processors, embedded platforms, formal models,
  FPGA boards, and commercial product development.
image_url: null
updated_date: null
parent: /discover/
next_page_url: /discover/history/commercialisation/
related:
  pages:
  - /discover/history/early-capability-systems/
  - /discover/history/morello-history/
  people: []
  organisations: []
  groups: []
  news: []
  events: []
  papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

# RISC-V and Embedded Development

Many connected devices do not look like a Morello-class computer. They may have a small processor, limited memory, no memory management unit, strict real-time deadlines, and firmware expected to remain deployed for years. Moving CHERI into this space required designs suited to a different scale.

RISC-V provided an open and extensible foundation for that work.

## Moving beyond the first architecture

Early CHERI prototypes extended MIPS. Under DARPA’s SSITH programme, SRI International and the University of Cambridge brought CHERI concepts to RISC-V from 2017 onwards.

This demonstrated architectural portability and enabled multiple processor implementations. The ecosystem developed prose specifications, executable Sail models, simulators, FPGA cores, compiler targets, and operating-system ports around CHERI-RISC-V.

RISC-V’s modular instruction-set approach also made it possible to explore CHERI at different performance and resource points rather than depend on one processor design.

## From embedded experiments to CHERIoT

Early embedded work included compartmentalised real-time systems and CHERI-enabled microcontroller designs. These efforts helped establish a key requirement: small devices needed memory safety and least privilege without assuming heavyweight virtual memory or process isolation.

CHERIoT developed into a complete 32-bit hardware-software platform for this environment. Its design co-ordinates:

a compact CHERI-enabled RISC-V instruction set

tagged-memory processor cores

a privilege-separated real-time operating system

fast, fine-grained software compartments

a C and C++ toolchain and language extensions

temporal-safety mechanisms integrated with allocation

a formal instruction-set architecture (ISA) model and generated simulator

auditing and firmware-development tools

The platform treats security as a property of the whole embedded stack rather than one processor feature.

## FPGA platforms and accessible development

FPGA boards let developers run changing processor designs before or alongside production silicon. CHERI-RISC-V cores have run on general development boards as well as purpose-built platforms.

Sonata, developed by lowRISC, made CHERIoT prototyping more accessible by combining a CHERIoT-capable FPGA design with peripherals suited to embedded experiments. The same software can also be exercised through simulators, reducing the barrier for developers without hardware.

## Application-class RISC-V

CHERI-RISC-V is not limited to microcontrollers. Work also covers 64-bit processors with memory management units, CheriBSD and Linux environments, virtualisation, and application-class software.

Licensable processor designs and evaluation platforms now extend this route. The ecosystem includes released cores and products from multiple organisations, including CHERI Enabled implementations. Exact architecture versions and features differ, so software and assurance claims must name the target rather than refer only to “CHERI-RISC-V”.

## Why the embedded path matters

Embedded software often combines a large attack surface with limited update and isolation options. A network stack, parser, third-party library, and device-control logic may all share one address space. CHERI bounds can stop invalid object access, while compartments can limit the authority inherited by vulnerable code.

The RISC-V and embedded work also broadened commercial routes. Open models, configurable processor designs, FPGA platforms, operating systems, and toolchains let suppliers choose a path that fits their device class.

For current platform choices, compare CHERIoT, Sonata, FPGA Platforms, and Simulators.
