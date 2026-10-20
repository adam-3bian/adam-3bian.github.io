---
title: Simulators
where-next:
  url: /software/cheribsd/
related-pages:
- url: /hardware/fpga-platforms/
  description: FPGA platforms put a CHERI processor and system design onto reconfigurable hardware.
  action: Read this page
- url: /guides/choose-a-platform/
  title: Choose a Platform
  description: Choose a platform, prepare an environment and run a first CHERI workload.
  action: Read this page
summary: Develop and test CHERI software and systems without physical hardware.
software_type: Simulation
---

Simulation is often the easiest way to get started with CHERI. It lets you develop, port and test software before you have access to CHERI hardware.

Different simulators serve different purposes. Some run complete operating systems and applications relatively quickly, while others provide detailed models of the CHERI architecture or a particular processor implementation.

## Which simulator do I need?
{: id="which-simulator-do-i-need" }

For most **software developers**, QEMU is a good place to start. It can run complete CHERI software environments and is well suited to application development, porting and automated testing.

For **architecture and hardware developers**, more detailed models are available:

- **Sail models** provide an executable reference for CHERI instruction behaviour and architecture development
- **RTL simulation** runs the processor's hardware design, exposing implementation-level behaviour
- **Compiled hardware models**, using tools such as Verilator, can provide a faster way to simulate some hardware designs
- **Supplier simulators** may provide models tailored to particular commercial processors and development environments

The right choice depends on what you want to learn.

## QEMU for software development
{: id="qemu-for-software-development" }

CHERI-enabled QEMU provides a convenient way to run complete CHERI software environments without physical hardware. `cheribuild` can build QEMU together with matching development tools, operating systems and disk images.

Use QEMU to:

- boot CHERI-enabled operating systems
- develop and test applications
- port software to pure-capability environments
- run automated test suites
- investigate capability faults
- develop without physical CHERI hardware

QEMU models architectural behaviour rather than a particular processor's physical implementation. It should therefore not be used to predict processor performance or hardware characteristics such as detailed cache, speculation or timing behaviour.

## Sail for architecture development
{: id="sail-for-architecture-development" }

**Sail** is a formal model that provides executable descriptions of instruction-set behaviour and is used in CHERI architecture development, reference simulation, test generation and formal reasoning.

It is particularly useful when the question is "What should this CHERI instruction do?" rather than "How quickly will this software run?"

Sail models can also provide an independent reference against which processor implementations can be compared.

When using an executable architecture model, make sure its CHERI instruction-set architecture (ISA) version matches the system or implementation you are testing.

## CHERIoT simulation
{: id="cheriot-simulation" }

The CHERIoT development environment provides simulation routes for both architecture and processor-implementation models.

This allows developers to run compartmentalised firmware in simulation before moving to an FPGA or production hardware, and to test software at different levels of abstraction during development.

## RTL simulation for hardware development
{: id="rtl-simulation-for-hardware-development" }

**Register-transfer-level (RTL)** simulation runs the processor's actual hardware description and is primarily useful to processor and hardware developers.

It can help investigate:

- CHERI instruction implementation
- capability-tag storage and propagation
- caches and memory interfaces
- exceptions and interrupts
- reset and privilege behaviour
- buses and peripheral integration

RTL simulation provides much more implementation detail than QEMU, but is significantly slower. It is therefore generally better suited to focused hardware tests and smaller software workloads than running complete applications and operating systems.

Compiled implementation models, using tools such as **Verilator**, can provide another route for running some hardware designs more quickly while retaining implementation-specific behaviour.

## Choosing the right simulator
{: id="choosing-the-right-simulator" }

Start with the question you are trying to answer:

- Develop or port software? Start with QEMU or the recommended simulator for your target platform
- Check architectural behaviour? Use an executable reference model such as Sail
- Validate a processor implementation? Use RTL simulation or a compiled implementation model
- Evaluate a particular processor? Check whether its supplier provides a simulator and matching SDK
- Need to test hardware integration or peripherals? Consider moving from simulation to an FPGA platform

Whichever route you choose, check that the simulator, CHERI ISA version, compiler and software environment are compatible.

## Moving to hardware
{: id="moving-to-hardware" }

Simulation lets you start developing with CHERI without waiting for physical hardware.

Use [Run CHERI in Simulation](/guides/run-cheri-in-simulation/) for a first practical setup, and move to [FPGA Platforms](/hardware/fpga-platforms/) when the question depends on hardware implementation.
