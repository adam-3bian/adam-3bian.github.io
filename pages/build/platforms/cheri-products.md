---
title: CHERI Products
permalink: /build/platforms/cheri-products/
related-pages:
- url: /adopt/assurance-and-adoption/cheri-enabled-products/
  description: Products reviewed under the Alliance's CHERI Enabled programme, with a public record for each certification.
  action: Read this page
- url: /guides/downloads/
  description: Links to the main CHERI toolchains, operating systems, simulators, and platform resources.
  action: Read this page
summary: CHERI products span processor designs, chips, development boards, operating systems, toolchains, and software
  used to explore or build capability-based systems.
layout: products
directory: true
product_entries:
- title: CHERIoT Ibex embedded processor
  category: Processor designs, chips, and boards
  organization_label: Microsoft
  product_type: processor intellectual property
  release_status: released; CHERI Enabled
  description: '[CHERIoT Ibex](https://github.com/microsoft/cheriot-ibex) is a 32-bit RISC-V microcontroller core
    implementing the CHERIoT instruction-set architecture for compartmentalised embedded systems.'
  url: /hardware/cheriot-ibex/
- title: Codasip X730
  category: Processor designs, chips, and boards
  organization_label: Codasip
  product_type: processor intellectual property
  release_status: released; CHERI Enabled
  description: The [X730](https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/)
    is a 64-bit application-processor core implementing CHERI-RISC-V, with pure-capability and hybrid execution
    support.
  url: /hardware/x730/
- title: CHERIoT Kudu
  category: Processor designs, chips, and boards
  organization_label: Microsoft
  product_type: processor intellectual property
  release_status: active development
  description: '[CHERIoT Kudu](https://github.com/microsoft/cheriot-kudu) is part of the CHERIoT embedded ecosystem
    and represents continuing development beyond the Ibex core.'
  url: https://github.com/microsoft/cheriot-kudu
- title: CVA6-CHERI
  category: Processor designs, chips, and boards
  organization_label: Capabilities Limited
  product_type: processor intellectual property
  release_status: released
  description: '[CVA6-CHERI](https://github.com/lowRISC/cva6-cheri) brings CHERI extensions to the open CVA6 application-class
    RISC-V core.'
  url: https://github.com/lowRISC/cva6-cheri
- title: ICENI
  category: Processor designs, chips, and boards
  organization_label: SCI Semiconductor
  product_type: chip
  release_status: released
  description: '[ICENI](https://www.scisemi.com/products/iceni-device-family/) is a CHERI-based semiconductor product
    for embedded and connected systems.'
  url: https://www.scisemi.com/products/iceni-device-family/
- title: Morello
  category: Processor designs, chips, and boards
  organization_label: Arm
  product_type: development board
  release_status: released experimental platform
  description: '[Morello](/hardware/morello/) combines an experimental Arm capability architecture with hardware,
    CheriBSD, and development tools.'
  url: /hardware/morello/
- title: Sonata
  category: Processor designs, chips, and boards
  organization_label: lowRISC
  product_type: development platform
  release_status: released
  description: '[Sonata](/hardware/sonata/) is an FPGA-based CHERIoT platform intended for embedded software and
    hardware exploration.'
  url: /hardware/sonata/
- title: Codasip Prime platform
  category: Processor designs, chips, and boards
  organization_label: Codasip
  product_type: development board
  release_status: released
  description: The [Codasip Prime platform](https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime/)
    is an evaluation and development kit featuring the X730 processor and its associated software environment, available
    for application-class CHERI-RISC-V development.
  url: https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime/
- title: CHERI Linux
  category: Operating systems and runtimes
  description: released Linux work for CHERI-enabled architectures.
  url: /software/cheri-linux/
- title: CheriBSD
  category: Operating systems and runtimes
  description: released FreeBSD-derived operating system with hybrid and pure-capability CHERI support.
  url: /software/cheribsd/
- title: seL4
  category: Operating systems and runtimes
  description: released work combining CHERI with the seL4 microkernel ecosystem.
- title: CHERI FreeRTOS
  category: Operating systems and runtimes
  description: in development for capability-aware microcontroller systems.
- title: CHERIoT RTOS
  category: Operating systems and runtimes
  description: released real-time operating system built around small, mutually distrusting compartments.
- title: CHERI Android for Morello
  category: Operating systems and runtimes
  description: released experimental Android port for the Morello platform.
- title: CHERI Zephyr
  category: Operating systems and runtimes
  description: ongoing work on CHERI memory protection and compartmentalisation in Zephyr.
  url: /software/cheri-zephyr/
- title: U-Boot
  category: Software and development tools
  description: released bootloader support used by CHERI platforms.
- title: OpenSBI
  category: Software and development tools
  description: released RISC-V supervisor binary interface support.
- title: QEMU
  category: Software and development tools
  description: released emulation support for CHERI-RISC-V environments.
  url: /software/simulators/
- title: Morello Fixed Virtual Platform
  category: Software and development tools
  description: released model of the Morello platform.
  url: /software/simulators/
- title: CHERI LLVM
  category: Software and development tools
  description: released compiler and linker support for capability-aware C and C++.
  url: /software/llvm-and-clang/
- title: CHERI GDB
  category: Software and development tools
  description: debugger support under active development.
  url: /software/debugging-tools/
- title: Newlib
  category: Software and development tools
  description: released C-library support used by embedded CHERI environments.
- title: Musl C
  category: Software and development tools
  description: capability-aware C-library work for Linux-oriented environments.
directory_outro: '## Product and certification claims

  {: id="product-and-certification-claims" }


  Inclusion in this directory records a publicly described CHERI product or project. It does not mean that the Alliance
  has certified the product. [CHERI Enabled](/adopt/assurance-and-adoption/about-cheri-enabled/) is the separate
  programme that connects a certification mark to a named product, version, evidence record, and defined scope.

  '
---

CHERI is available in more than one kind of product. A processor core supplies the architectural mechanism; a chip or development board makes that mechanism available in hardware; an operating system and toolchain make it usable by software. The entries below describe those different layers without treating them as interchangeable.

Availability and project status can change. The status shown here reflects the public CHERI Alliance directory in August 2026.
