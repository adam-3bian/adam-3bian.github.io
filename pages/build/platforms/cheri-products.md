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
---

1. Build
2. Platforms
3. CHERI Products
{: .source-breadcrumbs }

# CHERI Products
{: id="page-hero-title" .page-hero-title }

CHERI products span processor designs, chips, development boards, operating systems, toolchains, and software used to explore or build capability-based systems.
{: .page-hero-summary }

CHERI is available in more than one kind of product. A processor core supplies the architectural mechanism; a chip or development board makes that mechanism available in hardware; an operating system and toolchain make it usable by software. The entries below describe those different layers without treating them as interchangeable.

Availability and project status can change. The status shown here reflects the public CHERI Alliance directory in August 2026.

## Processor designs, chips, and boards
{: id="processor-designs-chips-and-boards" }

### CHERIoT Ibex embedded processor
{: id="cheriot-ibex-embedded-processor" }

- **Organisation:** Microsoft
- **Type:** processor intellectual property
- **Status:** released; [CHERI Enabled](/hardware/cheriot-ibex/)

[CHERIoT Ibex](https://github.com/microsoft/cheriot-ibex) is a 32-bit RISC-V microcontroller core implementing the CHERIoT instruction-set architecture for compartmentalised embedded systems.

### Codasip X730
{: id="codasip-x730" }

- **Organisation:** Codasip
- **Type:** processor intellectual property
- **Status:** released; [CHERI Enabled](/hardware/x730/)

The [X730](https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/) is a 64-bit application-processor core implementing CHERI-RISC-V, with pure-capability and hybrid execution support.

### CHERIoT Kudu
{: id="cheriot-kudu" }

- **Organisation:** Microsoft
- **Type:** processor intellectual property
- **Status:** active development

[CHERIoT Kudu](https://github.com/microsoft/cheriot-kudu) is part of the CHERIoT embedded ecosystem and represents continuing development beyond the Ibex core.

### CVA6-CHERI
{: id="cva6-cheri" }

- **Organisation:** Capabilities Limited
- **Type:** processor intellectual property
- **Status:** released

[CVA6-CHERI](https://github.com/lowRISC/cva6-cheri) brings CHERI extensions to the open CVA6 application-class RISC-V core.

### ICENI
{: id="iceni" }

- **Organisation:** SCI Semiconductor
- **Type:** chip
- **Status:** released

[ICENI](https://www.scisemi.com/products/iceni-device-family/) is a CHERI-based semiconductor product for embedded and connected systems.

### Morello
{: id="morello" }

- **Organisation:** Arm
- **Type:** development board
- **Status:** released experimental platform

[Morello](/hardware/morello/) combines an experimental Arm capability architecture with hardware, CheriBSD, and development tools.

### Sonata
{: id="sonata" }

- **Organisation:** lowRISC
- **Type:** development platform
- **Status:** released

[Sonata](/hardware/sonata/) is an FPGA-based CHERIoT platform intended for embedded software and hardware exploration.

### Codasip Prime platform
{: id="codasip-prime-platform" }

- **Organisation:** Codasip
- **Type:** development board
- **Status:** released

The [Codasip Prime platform](https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime/) is an evaluation and development kit featuring the X730 processor and its associated software environment, available for application-class CHERI-RISC-V development.

## Operating systems and runtimes
{: id="operating-systems-and-runtimes" }

- **[CHERI Linux](/software/cheri-linux/):** released Linux work for CHERI-enabled architectures.
- **[CheriBSD](/software/cheribsd/):** released FreeBSD-derived operating system with hybrid and pure-capability CHERI support.
- **seL4:** released work combining CHERI with the seL4 microkernel ecosystem.
- **CHERI FreeRTOS:** in development for capability-aware microcontroller systems.
- **CHERIoT RTOS:** released real-time operating system built around small, mutually distrusting compartments.
- **CHERI Android for Morello:** released experimental Android port for the Morello platform.
- **[CHERI Zephyr](/software/cheri-zephyr/):** ongoing work on CHERI memory protection and compartmentalisation in Zephyr.

## Software and development tools
{: id="software-and-development-tools" }

- **U-Boot:** released bootloader support used by CHERI platforms.
- **OpenSBI:** released RISC-V supervisor binary interface support.
- **[QEMU](/software/simulators/):** released emulation support for CHERI-RISC-V environments.
- **[Morello Fixed Virtual Platform](/software/simulators/):** released model of the Morello platform.
- **[CHERI LLVM](/software/llvm-and-clang/):** released compiler and linker support for capability-aware C and C++.
- **[CHERI GDB](/software/debugging-tools/):** debugger support under active development.
- **Newlib:** released C-library support used by embedded CHERI environments.
- **Musl C:** capability-aware C-library work for Linux-oriented environments.

## Product and certification claims
{: id="product-and-certification-claims" }

Inclusion in this directory records a publicly described CHERI product or project. It does not mean that the Alliance has certified the product. [CHERI Enabled](/adopt/assurance-and-adoption/about-cheri-enabled/) is the separate programme that connects a certification mark to a named product, version, evidence record, and defined scope.


## Related content
{: .related-pages-title }

### [CHERI Enabled Products](/adopt/assurance-and-adoption/cheri-enabled-products/)
{: .related-pages-item-title }





[Products reviewed under the Alliance's CHERI Enabled programme, with a public record for each certification.](/adopt/assurance-and-adoption/cheri-enabled-products/)
{: .related-pages-item-summary }



[Read this page](/adopt/assurance-and-adoption/cheri-enabled-products/)
{: .source-card-label }





### [Downloads](/guides/downloads/)
{: .related-pages-item-title }





[Links to the main CHERI toolchains, operating systems, simulators, and platform resources.](/guides/downloads/)
{: .related-pages-item-summary }



[Read this page](/guides/downloads/)
{: .source-card-label }
