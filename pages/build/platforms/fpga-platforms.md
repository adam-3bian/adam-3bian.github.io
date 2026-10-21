---
layout: page
title: FPGA Platforms
summary: Run CHERI on real, reconfigurable hardware before moving to silicon.
permalink: /build/platforms/fpga-platforms/
slug: build-platforms-fpga-platforms
navigation:
  header:
    category: Build
    subcategory: Platforms
image:
  src: /assets/images/shared/codasip-prime-kit.webp
  alt: Codasip Prime FPGA board
  width: 526
  height: 439
  fit: contain
related:
- type: page
  slug: build-software-ecosystem-simulators
  relation: next_step
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

[FPGA](/discover/resources/glossary/#glossary-f) platforms provide a practical step between software simulation and production silicon. They let developers run CHERI processor and system designs on physical hardware, test software and peripherals, and modify the underlying hardware design without fabricating a chip.

Unlike a software simulator, an FPGA can implement the processor together with caches, memory, buses, interrupts and peripherals, allowing developers to test more of the complete system.

## Do I need an FPGA?

Usually not when you are getting started. Most developers can begin learning CHERI, porting software and investigating capability violations using simulation or QEMU.

An FPGA becomes useful when you need to test a processor or complete system design on physical hardware, measure performance, integrate peripherals, create demonstrations, or develop software before production silicon is available.

## What makes up an FPGA platform?

An FPGA is a chip that can be configured to contain a processor and other digital hardware. To run CHERI, you generally need a complete hardware and software environment, including:

- an FPGA board
- an image, or bitstream, to program the FPGA chip, containing
  - a CHERI-capable processor design
  - support for capability tags throughout the memory system
  - caches, buses, interrupts, timers and peripherals
  - a system design adapted to the FPGA board
- boot firmware and a software development kit (SDK)
- a compatible operating system, real-time operating system (RTOS), or bare-metal environment

## Ways to run CHERI on an FPGA

### Purpose-built CHERIoT platforms

[Sonata](/products/sonata/) provides an integrated development environment for CHERIoT software and physical peripherals. It is a good choice for developers who want to work with real hardware without building their own FPGA system.

### Commercial FPGA boards

CHERI processor designs can also run on supported commercial FPGA development boards. The [Digilent Genesys 2](https://digilent.com/shop/genesys-2-amd-kintex-7-fpga-development-board/) and [AMD/Xilinx VCU118](https://www.amd.com/en/products/adaptive-socs-and-fpgas/evaluation-boards/vcu118.html) have both been used extensively as FPGA platforms for CHERI-related processor and system development, and provide useful reference points for teams building or evaluating their own systems.

These platforms provide greater flexibility, particularly when you need more FPGA resources, memory or interfaces, but require more hardware-integration work than a purpose-built platform such as Sonata.

The processor, system design, board configuration and SDK must all be compatible. A bitstream built for one board cannot normally be used directly on another.

### Application-class CHERI-RISC-V

Application-class CHERI-RISC-V processors are larger, more complex designs, typically requiring more capable FPGA boards with greater logic, memory and system resources.

These platforms can support 64-bit CHERI-RISC-V systems suitable for operating-system and processor development. They are particularly useful when simulation such as QEMU is too abstract, but production silicon is not yet available or selected.

### Supplier evaluation images

Processor-IP suppliers may provide FPGA images and SDKs for evaluating their CHERI-enabled processors. These can provide a supported route to product evaluation, although availability, licensing, supported peripherals and redistribution terms vary by supplier.

## What can you learn from an FPGA?

FPGA platforms are useful to both hardware and software teams, but for different reasons.

For **hardware teams**, they provide a way to:

- validate CHERI processor and tagged-memory integration
- test caches, buses, interrupts and peripherals
- exercise capability handling throughout the system
- build and refine estimates of final silicon performance
- validate complete system designs before committing to silicon

For **software teams**, they provide real hardware on which to:

- boot and test an operating system, RTOS or bare-metal software
- develop and test drivers and peripherals
- exercise CHERI compartments and capability behaviour
- develop and validate software before production silicon is available
- run hardware-in-the-loop testing and continuous integration

An FPGA can also help build and validate estimates of final silicon performance, particularly by providing cycle-level measurements and allowing hardware and software to be exercised together. However, FPGA measurements do not directly represent final silicon: clock frequency, power consumption, chip area and memory performance will depend on the eventual implementation.

## Choosing an FPGA platform

Before selecting a platform, check:

1. **Architecture**: Which CHERI instruction-set architecture and version does it implement?
2. **Software**: Which compilers, ABIs, operating systems and examples are supported?
3. **Capacity**: Does the FPGA have enough logic and memory for the required processor and system?
4. **Peripherals**: Are the interfaces you need available and supported by drivers?
5. **Debug**: What hardware debug, serial console, trace and fault diagnostics are available?
6. **Licence**: Can you use, modify and redistribute the RTL, bitstream and software as required?
7. **Lifecycle**: Is it an experimental platform, a maintained development environment or part of a supplier's product route?

## Reproducible hardware builds

For reproducible development, record the RTL revision, FPGA tool version, synthesis settings, board configuration, bitstream, firmware and SDK used. FPGA build results can vary between tool versions, so the build environment is part of the platform configuration.

## Find a platform

The [CHERI product directory](/build/platforms/cheri-products/) describes current cores, chips, boards, operating systems, and tools.
