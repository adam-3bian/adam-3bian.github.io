---
title: Defence & Aerospace
permalink: /adopt/use-cases/defence-and-aerospace/
summary: CHERI can reinforce least authority in mission systems that combine established software, mixed suppliers,
  long lifecycles, and demanding assurance.
image_url: null
updated_date: null
parent: /adopt/
next_page_url: /adopt/use-cases/safety-critical-systems/
related:
  pages:
  - /adopt/use-cases/automotive/
  - /adopt/use-cases/cloud-and-data-centre/
  - /adopt/business-case/the-business-case/
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

# Defence & Aerospace

Defence and aerospace systems often bring together software from different decades, suppliers, and assurance levels. They may operate with intermittent connectivity, strict timing and power limits, long hardware lifecycles, and active attempts to compromise them.

In this setting, one exposed component can sit close to mission data, communications, sensors, or control functions. A memory vulnerability in a message parser, driver, or supplier library can therefore create authority far beyond the component’s intended role.

## Why CHERI can fit mission systems

CHERI gives the processor a direct role in enforcing least authority. Capabilities limit memory references by range and permission. Compartments can receive access to selected memory, devices, and callable services while remaining unable to reach the rest of the platform.

This is relevant to mission systems for several reasons:

- established C and C++ code may remain necessary for many years;
- software components can come from organisations with different trust relationships;
- full replacement may be constrained by qualification, hardware, or deployment cycles;
- exposed communications code may share a processor with sensitive functions;
- smaller platforms may not support heavyweight isolation for every component.

CHERI can strengthen both existing and new architectures. A legacy parser can gain bounded memory access, while a redesigned platform can use compartments to make authority between components explicit from the outset.

## Prevention and containment

The first benefit is prevention. The processor can stop many out-of-bounds accesses, unauthorised writes, and attempts to execute data when the relevant capability lacks permission.

The second is containment. A component compromised through a logic flaw or another route can retain only the memory and services delegated to it. Communications software, file handlers, drivers, mission applications, and third-party modules can therefore be separated even when they share an address space.

For a mission system, the difference between compromise of one parser and compromise of mission state can be more important than the original vulnerability.

## A contribution to assurance

CHERI supports precise claims. A system can describe that a parser has access to particular buffers and services, or that one supplier component cannot access another component’s state. Those claims can be connected to the processor architecture, software configuration, and test evidence.

This precision is valuable in systems where broad claims such as “secure” or “isolated” are not enough. The exact processor, instruction-set version, toolchain, runtime, compartment mechanism, and software configuration still determine what is enforced.

CHERI does not replace system safety, cryptography, cross-domain controls, secure boot, emissions security, supply-chain assurance, or operational procedures. Export-control and information-handling obligations also remain specific to the product, organisations, information, and jurisdictions involved.

## Where the fit is strongest

The case is strongest where software is both exposed and close to mission assets, especially when that software cannot be rewritten or separated into a conventional process without unacceptable cost. Timing, power, recovery behaviour, update support, and platform availability remain important constraints.

Within those constraints, CHERI offers a concrete architectural advantage: valuable native software can remain part of the mission system while the processor enforces a much narrower account of what each component is allowed to reach.
