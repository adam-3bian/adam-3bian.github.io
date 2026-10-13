---
title: Zephyr
image_url: /assets/software/zephyr/placeholder.svg
website_url: https://docs.zephyrproject.org/
repository_urls:
- https://github.com/CHERI-Alliance/CHERI-zephyr
type: null
status: null
related:
  organisations:
  - cheri-alliance
  hardware:
  - cheriot
  software: []
---

# Zephyr

CHERI-enabled Zephyr brings capability protection to a widely used embedded operating-system ecosystem while platform and feature coverage continue to expand.

Zephyr has an established embedded codebase, driver model, build system, and board ecosystem. CHERI-enabled Zephyr explores how capability memory protection can be introduced while retaining those interfaces and development practices.

## Operating-system integration

Protected capability state reaches thread creation and context switching, stacks, memory domains, user-mode transitions, interrupts, exceptions, object interfaces, drivers, compiler configuration, linking, and fault reporting.

The port therefore spans the architecture layer and the operating-system services that move or interpret pointers.

## Current project structure

Development takes place in a [CHERI Alliance](/organisations/cheri-alliance/) repository and is coordinated through the [CHERI Zephyr Working Group](/groups/cheri-zephyr/). The repository carries active source, platform configurations, samples, tests, and contribution history.

This remains an active port rather than a feature present across every mainline Zephyr release and board. Architecture targets, boards, drivers, kernel configurations, and test coverage develop at different rates.

## Zephyr and CHERIoT

Both address embedded systems, but they start from different software models.

Foundation; CHERI-enabled Zephyr: The Zephyr RTOS ecosystem; [CHERIoT](/hardware/cheriot/): A hardware-software design built around CHERI

Existing interfaces; CHERI-enabled Zephyr: Zephyr APIs, drivers, Kconfig, west, and board support; CHERIoT: CHERIoT SDK, RTOS, compartments, and xmake build system

Compartment model; CHERI-enabled Zephyr: Defined by the evolving CHERI Zephyr integration; CHERIoT: Central to the platform architecture

Main attraction; CHERI-enabled Zephyr: Continuity with Zephyr software and devices; CHERIoT: A security-first embedded model designed around capabilities

The distinction is architectural rather than a simple maturity ranking. Each route serves a different relationship with existing software, devices, and platform suppliers.

## Project links

- [CHERI Zephyr source](https://github.com/CHERI-Alliance/CHERI-zephyr)
- [CHERI Zephyr Working Group](/groups/cheri-zephyr/)
- [Zephyr Project documentation](https://docs.zephyrproject.org/latest/)
