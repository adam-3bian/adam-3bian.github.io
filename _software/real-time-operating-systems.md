---
title: Real-Time Operating Systems
image_url: /assets/software/real-time-operating-systems/placeholder.svg
website_url: null
repository_urls: []
type: null
status: null
related:
  organisations: []
  hardware:
  - cheriot
  software:
  - zephyr
---

# Real-Time Operating Systems

CHERI is being explored across several embedded and real-time software models, from capability-first RTOS designs to ports of established ecosystems.

Embedded systems cover a wide range of timing, memory, power, assurance, device, and compatibility requirements. CHERI appears in this landscape through both new capability-oriented platforms and ports of established real-time operating systems.

## Different routes into embedded CHERI

### CHERIoT

[CHERIoT](/hardware/cheriot/) co-designs a CHERI instruction-set profile, RTOS, compartment model, linker, allocator, and SDK for small embedded systems. Capability protection is part of the platform’s foundation rather than an extension to a conventional process model.

### Zephyr

CHERI-enabled [Zephyr](/software/zephyr/) brings capability state and memory protection into Zephyr’s existing kernel, APIs, drivers, configuration system, and board ecosystem. Its attraction is continuity with software already built around Zephyr.

### FreeRTOS

CHERI FreeRTOS work explores capability protection and compartments around a widely deployed real-time kernel and its familiar application interfaces. The Alliance working group provides a forum for common approaches across ports and platforms.

### seL4 and Microkit

seL4 is a verified microkernel rather than a conventional RTOS, but it is relevant to embedded and real-time systems that need strong isolation and assurance. CHERI work connects architectural memory capabilities with seL4’s existing capability-based kernel model and Microkit components.

## What distinguishes the platforms

The projects differ in architecture profile, kernel model, compartment design, existing APIs, device support, toolchain integration, temporal-safety mechanisms, assurance evidence, and relationship with upstream communities.

Those differences reflect distinct product and research goals. They are not interchangeable implementations of one CHERI RTOS specification.

## Alliance collaboration

Related groups include CHERI FreeRTOS, CHERI Zephyr, CHERI for seL4, and MMU-less Systems.
