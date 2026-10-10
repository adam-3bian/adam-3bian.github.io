---
title: Zephyr
where-next:
  url: /software/real-time-operating-systems/
related-pages:
- url: /groups/cheri-zephyr/
  title: CHERI Zephyr Working Group
  description: Alliance collaboration around the Zephyr port, platforms, interfaces, and tooling.
  action: Read this page
- url: /hardware/cheriot/
  description: A security-focused embedded architecture and RTOS designed together around CHERI compartments.
  action: Read this page
- url: /guides/choose-a-platform/
  title: Choose a Platform
  description: Compare current embedded hardware, FPGA, and simulation routes.
  action: Read this page
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
- [CHERI Zephyr Working Group](/groups/cheri-zephyr/)
- [Zephyr Project documentation](https://docs.zephyrproject.org/)

## Where next
{: .where-next-title }

### [Real-Time Operating Systems](/software/real-time-operating-systems/)
{: .where-next-card-title }





[CHERI work spans several real-time operating systems and embedded software models.](/software/real-time-operating-systems/)
{: .where-next-summary }



[Continue](/software/real-time-operating-systems/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CHERI Zephyr Working Group](/groups/cheri-zephyr/)
{: .related-pages-item-title }





[Alliance collaboration around the Zephyr port, platforms, interfaces, and tooling.](/groups/cheri-zephyr/)
{: .related-pages-item-summary }



[Read this page](/groups/cheri-zephyr/)
{: .source-card-label }





### [CHERIoT](/hardware/cheriot/)
{: .related-pages-item-title }





[A security-focused embedded architecture and RTOS designed together around CHERI compartments.](/hardware/cheriot/)
{: .related-pages-item-summary }



[Read this page](/hardware/cheriot/)
{: .source-card-label }





### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Compare current embedded hardware, FPGA, and simulation routes.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
