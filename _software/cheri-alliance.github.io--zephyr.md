---
title: Zephyr
layout: source
permalink: /sources/cheri-alliance.github.io/build/software-ecosystem/zephyr/
---

1. Build
2. Software Ecosystem
3. Zephyr
{: .source-breadcrumbs }

# Zephyr
{: id="page-hero-title" .page-hero-title }

CHERI-enabled Zephyr brings capability protection to a widely used embedded operating-system ecosystem while platform and feature coverage continue to expand.
{: .page-hero-summary }

Zephyr has an established embedded codebase, driver model, build system, and board ecosystem. CHERI-enabled Zephyr explores how capability memory protection can be introduced while retaining those interfaces and development practices.

## Operating-system integration
{: id="operating-system-integration" }

Protected capability state reaches thread creation and context switching, stacks, memory domains, user-mode transitions, interrupts, exceptions, object interfaces, drivers, compiler configuration, linking, and fault reporting.

The port therefore spans the architecture layer and the operating-system services that move or interpret pointers.

## Current project structure
{: id="current-project-structure" }

Development takes place in a CHERI Alliance repository and is coordinated through the CHERI Zephyr Working Group. The repository carries active source, platform configurations, samples, tests, and contribution history.

This remains an active port rather than a feature present across every mainline Zephyr release and board. Architecture targets, boards, drivers, kernel configurations, and test coverage develop at different rates.

## Zephyr and CHERIoT
{: id="zephyr-and-cheriot" }

Both address embedded systems, but they start from different software models.

|  | CHERI-enabled Zephyr | CHERIoT |
| --- | --- | --- |
| Foundation | The Zephyr RTOS ecosystem | A hardware-software design built around CHERI |
| Existing interfaces | Zephyr APIs, drivers, Kconfig, west, and board support | CHERIoT SDK, RTOS, compartments, and xmake build system |
| Compartment model | Defined by the evolving CHERI Zephyr integration | Central to the platform architecture |
| Main attraction | Continuity with Zephyr software and devices | A security-first embedded model designed around capabilities |

The distinction is architectural rather than a simple maturity ranking. Each route serves a different relationship with existing software, devices, and platform suppliers.

## Project links
{: id="project-links" }

- [CHERI Zephyr source](https://github.com/CHERI-Alliance/CHERI-zephyr)
- [CHERI Zephyr Working Group](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-zephyr/)
- [Zephyr Project documentation](https://docs.zephyrproject.org/)

## Where next
{: .where-next-title }

### [Real-Time Operating Systems](https://cheri-alliance.github.io/build/software-ecosystem/real-time-operating-systems/)
{: .where-next-card-title }





[CHERI work spans several real-time operating systems and embedded software models.](https://cheri-alliance.github.io/build/software-ecosystem/real-time-operating-systems/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/build/software-ecosystem/real-time-operating-systems/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CHERI Zephyr Working Group](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-zephyr/)
{: .related-pages-item-title }





[Alliance collaboration around the Zephyr port, platforms, interfaces, and tooling.](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-zephyr/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/alliance/leadership/working-groups/cheri-zephyr/)
{: .source-card-label }





### [CHERIoT](https://cheri-alliance.github.io/build/platforms/cheriot/)
{: .related-pages-item-title }





[A security-focused embedded architecture and RTOS designed together around CHERI compartments.](https://cheri-alliance.github.io/build/platforms/cheriot/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/platforms/cheriot/)
{: .source-card-label }





### [Choose a Platform](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-title }





[Compare current embedded hardware, FPGA, and simulation routes.](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/developers/choose-a-platform/)
{: .source-card-label }
