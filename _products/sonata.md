---
layout: detail
title: Sonata
summary: Sonata is an accessible FPGA development platform for running CHERIoT firmware with real peripherals before moving to production silicon.
permalink: /products/sonata/
slug: sonata
navigation:
  header:
    category: Build
    subcategory: Platforms
image:
  src: /assets/images/common/996577fc-645cc3b9a905-sonata-cheriot.webp
  alt: CHERIoT processor on a Sonata board
  width: 640
  height: 384
  fit: contain
product:
  type: fpga_board
  manufacturer: lowrisc
related:
- type: page
  slug: build-platforms-fpga-platforms
  relation: next_step
- type: page
  slug: build-platforms-cheriot
  relation: related
- type: guide
  slug: choose-a-platform
  relation: related
---

## Overview

Simulation is the quickest way to build a first CHERIoT application, but embedded development soon needs physical input and output. Developers must test timers, UARTs, storage, sensors, displays, and fault behaviour on hardware.

Sonata provides a purpose-built FPGA platform for that stage.

## What Sonata provides

Developed by [lowRISC](/organisations/lowrisc/), Sonata combines an FPGA implementation of a CHERIoT-capable system with a board and peripherals intended for embedded prototyping. It gives software developers a more direct route than assembling a processor core, system-on-chip design, and generic FPGA board themselves.

The platform is open and works with the CHERIoT real-time operating system (RTOS), software development kit (SDK), examples, and build flow. The CHERIoT project also provides a Sonata simulation route, allowing software to move between simulated and physical versions of a closely related platform.

## Typical workflow

1. Clone the CHERIoT RTOS and its submodules.
2. Open the project’s development container.
3. Build a supplied example for the Sonata simulator.
4. Run its tests and capture expected output.
5. Change the board target to the documented Sonata hardware configuration.
6. Connect the board and deploy using the SDK’s run command.
7. Add peripherals and application compartments one at a time.

The exact board identifiers and deployment scripts follow the current RTOS and Sonata releases. Use the maintained documentation rather than an older copied command.

## What to prototype

Sonata is well suited to:

- compartmentalised network or protocol stacks
- secure update and boot workflows
- sensor and actuator control
- third-party library isolation
- key and credential services
- peripheral drivers
- fault containment and recovery demonstrations
- firmware-size and FPGA resource measurements

Its physical interfaces let developers test the parts that an instruction-set simulator cannot represent realistically.

## Simulator and board parity

Starting with the Sonata simulator offers several advantages:

- no device access is needed for continuous integration
- faults and logs are easier to capture automatically
- every developer can reproduce the same baseline
- software changes can be separated from cable, flash, and peripheral issues

Repeat timing-sensitive and hardware-integration tests on the board. Simulation speed is not a processor performance measurement.

## Strengths

- Purpose-built for CHERIoT prototyping.
- Accessible development workflow through the CHERIoT SDK.
- Physical peripherals for realistic embedded experiments.
- Open platform resources and a corresponding simulation route.
- A bridge between software-only learning and commercial device integration.

## Constraints

- FPGA timing, power, and area differ from production silicon.
- The board’s peripheral set may not match the final product.
- A prototype bitstream or RTOS branch may change independently of a stable release.
- Product assurance must use the final core, system-on-chip, firmware, and hardware configuration.
- A successful Sonata prototype does not by itself establish supplier lifecycle or production-volume availability.

## Record the complete configuration

For every result, capture:

- Sonata board and revision
- FPGA bitstream or system revision
- CHERIoT instruction-set architecture (ISA) and RTOS release
- SDK container and compiler version
- board configuration file
- firmware source revision
- connected peripherals and clock settings

Visit the [Sonata project documentation](https://lowrisc.github.io/sonata-system/) and the [CHERIoT getting-started guide](https://cheriot.org/book/getting_started.html) for current hardware and software instructions.
