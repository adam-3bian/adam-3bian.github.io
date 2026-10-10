---
title: Real-Time Operating Systems
---

1. Build
2. Software Ecosystem
3. Real-Time Operating Systems
{: .source-breadcrumbs }

# Real-Time Operating Systems
{: id="page-hero-title" .page-hero-title }

CHERI is being explored across several embedded and real-time software models, from capability-first RTOS designs to ports of established ecosystems.
{: .page-hero-summary }

Embedded systems cover a wide range of timing, memory, power, assurance, device, and compatibility requirements. CHERI appears in this landscape through both new capability-oriented platforms and ports of established real-time operating systems.

## Different routes into embedded CHERI
{: id="different-routes-into-embedded-cheri" }

### CHERIoT
{: id="cheriot" }

CHERIoT co-designs a CHERI instruction-set profile, RTOS, compartment model, linker, allocator, and SDK for small embedded systems. Capability protection is part of the platform’s foundation rather than an extension to a conventional process model.

### Zephyr
{: id="zephyr" }

CHERI-enabled Zephyr brings capability state and memory protection into Zephyr’s existing kernel, APIs, drivers, configuration system, and board ecosystem. Its attraction is continuity with software already built around Zephyr.

### FreeRTOS
{: id="freertos" }

CHERI FreeRTOS work explores capability protection and compartments around a widely deployed real-time kernel and its familiar application interfaces. The Alliance working group provides a forum for common approaches across ports and platforms.

### seL4 and Microkit
{: id="sel4-and-microkit" }

seL4 is a verified microkernel rather than a conventional RTOS, but it is relevant to embedded and real-time systems that need strong isolation and assurance. CHERI work connects architectural memory capabilities with seL4’s existing capability-based kernel model and Microkit components.

## What distinguishes the platforms
{: id="what-distinguishes-the-platforms" }

The projects differ in architecture profile, kernel model, compartment design, existing APIs, device support, toolchain integration, temporal-safety mechanisms, assurance evidence, and relationship with upstream communities.

Those differences reflect distinct product and research goals. They are not interchangeable implementations of one CHERI RTOS specification.

## Alliance collaboration
{: id="alliance-collaboration" }

Related groups include [CHERI FreeRTOS](/groups/cheri-freertos/), [CHERI Zephyr](/groups/cheri-zephyr/), [CHERI for seL4](/groups/cheri-for-sel4/), and [MMU-less Systems](/groups/mmu-less-systems/).

## Where next
{: .where-next-title }

### [LLVM &amp; Clang](/software/llvm-and-clang/)
{: .where-next-card-title }





[LLVM and Clang provide the compiler foundation used by current CHERI embedded environments.](/software/llvm-and-clang/)
{: .where-next-summary }



[Continue](/software/llvm-and-clang/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Zephyr](/software/zephyr/)
{: .related-pages-item-title }





[CHERI capability support within the Zephyr embedded operating-system ecosystem.](/software/zephyr/)
{: .related-pages-item-summary }



[Read this page](/software/zephyr/)
{: .source-card-label }





### [CHERIoT](/hardware/cheriot/)
{: .related-pages-item-title }





[An embedded hardware-software architecture designed around CHERI compartments.](/hardware/cheriot/)
{: .related-pages-item-summary }



[Read this page](/hardware/cheriot/)
{: .source-card-label }





### [MMU-less Systems Working Group](/groups/mmu-less-systems/)
{: .related-pages-item-title }





[Alliance collaboration across shared-address-space and resource-constrained CHERI systems.](/groups/mmu-less-systems/)
{: .related-pages-item-summary }



[Read this page](/groups/mmu-less-systems/)
{: .source-card-label }
