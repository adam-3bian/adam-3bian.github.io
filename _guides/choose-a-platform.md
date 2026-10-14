---
title: Choosing a CHERI Development Platform
image_url: /assets/guides/choose-a-platform/placeholder.svg
repository_urls: []
updated_date: null
authors: []
related:
  working-groups: []
  hardware:
  - cheriot
  - morello
  - sonata
  software:
  - cheri-linux
  - simulators
  - cheribsd
  - zephyr
  - llvm-and-clang
---

# Choosing a CHERI Development Platform

Practical guidance for choosing a CHERI development and evaluation environment.

Don’t start by comparing processors. Start by identifying what you want to build, port, or evaluate.

A team porting a Unix service needs a different environment from one developing compartmentalised firmware for a microcontroller. Define the workload and the security property you want to investigate before choosing a platform.

## Do I need CHERI hardware?

Not for most early development work. You can learn CHERI, port applications, and debug capability violations using QEMU or simulation on a standard workstation.

Move to physical hardware when you need realistic performance measurements, hardware integration, peripheral access, or deployment-specific testing.

## Quick comparison

I want to…: Learn CHERI development; Recommendation: Start with [CheriBSD](/software/cheribsd/) on CHERI-RISC-V in QEMU. It runs on a standard workstation and provides a complete CHERI development environment with CheriBSD, CHERI LLVM/Clang, and QEMU.

I want to…: Port an existing C or C++ application; Recommendation: Use CheriBSD on CHERI-RISC-V in QEMU. It provides a mature pure-capability environment and is the most common starting point for porting and debugging capability-related issues.

I want to…: Find memory-safety bugs in my code; Recommendation: Use a pure-capability environment similar to your current system. Recompile the application, run existing test suites, and investigate capability violations and compatibility issues.

I want to…: Develop Linux software with CHERI; Recommendation: Use [CHERI Linux](/software/cheri-linux/) on a supported RISC-V target or emulator. Available kernels, user space, hardware support, and SDKs vary by project and platform.

I want to…: Build compartmentalised embedded firmware; Recommendation: Start with [CHERIoT](/hardware/cheriot/) in simulation. Move to [Sonata](/hardware/sonata/) or another supported board when hardware integration, peripherals, or timing measurements become important.

I want to…: Evaluate performance on real hardware; Recommendation: Use representative CHERI hardware rather than simulation. The appropriate platform depends on the target architecture, operating system, and deployment goals.

I want to…: Build a commercial product; Recommendation: Evaluate supplier SDKs, supported hardware, operating-system options, long-term support arrangements, and product roadmaps. The best learning platform is not always the best production platform.

## Start with the security question

Different experiments need different capabilities:

- To observe object bounds in ordinary C code, use a pure-capability environment
- To compare conventional and capability-aware interfaces, use an environment that supports hybrid builds
- To test least privilege between small components, choose a platform with a documented compartment model
- To investigate use-after-free protection, confirm which temporal-safety mechanism the platform and allocator provide
- To make performance claims, use representative hardware and publish the exact architecture, compiler, application binary interface (ABI), and workload

A simulator is suitable for functional behaviour and early porting. It is rarely suitable for final timing, power, or microarchitectural conclusions.

## Rich OS development

CheriBSD on CHERI-RISC-V is a strong general starting point for developers who want a complete Unix-like system without specialist hardware. The cheribuild tool can build the compiler, operating system, disk image, and CHERI-enabled QEMU target.

[Morello](/hardware/morello/) with CheriBSD provides a mature application-class CHERI stack on Arm’s prototype hardware. It is useful for established Morello projects, hardware measurements, and software that specifically targets the Morello ABI. Morello remains valuable for software development and evaluation. Teams planning future products should also consider current commercial CHERI-RISC-V offerings and supplier roadmaps.

CHERI Linux is appropriate when the Linux kernel and user-space ecosystem are central to the evaluation. Check the CHERI Linux roadmap and repository for current branches, supported processors, and user-space scope.

## Embedded development

CHERIoT is designed for small, connected systems. It combines a CHERI-enabled 32-bit RISC-V architecture with a compartmentalised real-time operating system (RTOS) and a defined software model. The official development container includes the compiler, build tools, auditing tools, and simulators.

Use simulation for the first build. Move to Sonata development board or another supported board when the experiment needs peripherals, physical timing, or hardware integration.

There are also CHERI-RISC-V embedded platforms that can run CHERI-enabled [Zephyr](/software/zephyr/) and other real-time operating-system. This may be the better fit when an existing RTOS ecosystem is a hard requirement. Confirm the current port’s architecture and feature coverage before comparing it with CHERIoT.

## Five practical selection checks

Workload: Can the platform run the operating system, libraries, language, and peripherals you need?

Protection mode: Does the target support pure-capability code, compartments, and any required temporal-safety mechanism?

Access: Can every developer reproduce the environment through simulation, a board, or a remote lab?

Evidence: Are the compiler, architecture version, test suite, and implementation status documented well enough for your claim?

Lifecycle: Is the platform a learning environment, a prototype, an open-source integration target, or a supported commercial product?

## Where to start

If you have no fixed platform requirement and want a more mature environment:

- Choose CheriBSD in QEMU for application-class C and C++
- Choose CHERIoT in its simulator for embedded firmware and compartments

Resist the temptation to start with a large application. First, boot the environment, build a simple program, run it successfully, and deliberately trigger a capability violation. Confirm that the protections you expect are actually active before investing time in larger ports.

Continue with [Run CHERI in Simulation](/guides/run-cheri-in-simulation/) or compare the detailed [Platform Comparison](/build/platforms/platform-comparison/).

## Choosing a platform for product development

If your goal is to evaluate a path to a commercial product, prioritise toolchain maturity, operating-system support, hardware availability, long-term maintenance, and supplier support. The best learning platform is not always the best platform for product development.
