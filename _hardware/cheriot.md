---
title: CHERIoT
image_url: /assets/hardware/cheriot/placeholder.svg
website_url: null
repository_urls: []
type: null
architecture: null
status: null
related:
  organisations: []
  hardware:
  - morello
  - fpga-platforms
  - cheriot-ibex
  - sonata
  software:
  - debugging-tools
navigation:
  header:
    category: Build
    subcategory: Resources
    parent: development-platforms
    order: 1
---

# CHERIoT

CHERIoT combines a compact CHERI-RISC-V architecture, processor cores, a real-time operating system, compartments, tooling, simulation, and embedded hardware targets.

Small connected devices often run many components in one address space: network stacks, parsers, drivers, third-party libraries, update code, and application logic. A fault in one can reach everything. Conventional process isolation may be unavailable or too heavy for the device.

CHERIoT is a CHERI-based hardware-software platform designed for this embedded environment.

## A coordinated platform

CHERIoT includes:

- a 32-bit CHERI-enabled RISC-V instruction set for embedded processors
- open processor-core implementations, including [CHERIoT Ibex](/hardware/cheriot-ibex/)
- an executable Sail model and reference simulator
- a privilege-separated real-time operating system
- a Clang-based C and C++ toolchain
- a build system and board descriptions
- fine-grained firmware compartments
- temporal-safety support integrated with memory allocation
- firmware auditing and debugging tools
- simulator, FPGA, and silicon targets

These parts are designed together. CHERIoT is therefore more than a generic RISC-V core with capability instructions added.

## The software model

Firmware is divided into compartments and libraries. The build description identifies components, dependencies, threads, entry points, stacks, and board configuration. The real-time operating system (RTOS) creates protected transitions and controls authority between compartments.

A network component can receive a capability for one packet and selected services without receiving authority for the complete firmware image. Capability bounds and permissions protect object access, while the compartment model limits the objects and services available to the component.

CHERIoT also provides mechanisms for temporal safety, helping prevent stale capabilities accessing storage after it has been reused.

## Getting started

The project provides a development container with the toolchain, simulator, and supporting tools.

```bash
git clone --recursive https://github.com/CHERIoT-Platform/cheriot-rtos.git
cd cheriot-rtos
```

Open the repository in a development-container compatible editor, select a supplied example, and use the documented simulator board. A typical build uses:

```bash
xmake config --sdk=/cheriot-tools --board=<supported-board>
xmake
xmake run
```

Use the current getting-started guide for exact board names and prerequisites.

## Hardware choices

Developers can begin without hardware using the formal-model simulator or implementation simulation. For physical development, supported targets include FPGA platforms such as [Sonata](/hardware/sonata/) and other boards listed by the project.

The ecosystem also includes commercial silicon and licensable processor designs. The CHERI product directory records the current platform landscape; suppliers retain responsibility for device, software development kit (SDK), and lifecycle information.

## When CHERIoT is a good fit

Microcontroller and Internet of Things firmware.

Systems that need predictable, fine-grained compartments.

Long-lived devices with third-party or network-facing code.

Embedded teams that want C and C++ compatibility with hardware-enforced memory protection.

Prototypes that need a route from simulator to FPGA and silicon.

Security architectures that need both spatial and temporal memory-safety mechanisms.

## Constraints and decisions

- CHERIoT is a specific embedded platform, not a drop-in target for every RISC-V binary.
- The RTOS and compartment model differ from POSIX processes and full Unix systems.
- Available memory, peripherals, real-time requirements, and board support must match the product.
- C and C++ ports may need changes for pointer assumptions, custom allocators, and unsupported libraries.
- Assurance claims must name the core, instruction-set architecture (ISA) version, RTOS, build, board or chip, and configuration.

## Current maturity

CHERIoT has a stable 1.0 architecture and RTOS line, released open-source implementations, development platforms, commercial silicon activity, and CHERI Enabled certification for the CHERIoT Ibex product. Individual repositories continue to evolve, so pin releases for reproducible product work.

The [CHERIoT Programmer’s Guide](https://cheriot.org/book/) is the best starting point for architecture, compartments, memory management, drivers, auditing, and practical examples.
