---
title: Policy Briefings
image_url: /assets/policies/policy-briefings/placeholder.svg
author: null
---

# Policy Briefings

CHERI gives policy discussions an additional route to memory safety: hardware-enforced protection for low-level and existing software, with finer-grained containment.

Memory safety policy often centres on language change, vulnerability reduction, or secure development practice. CHERI broadens that discussion by protecting memory at the processor and supporting compartments with limited authority.

Its relevance is greatest where established native code will remain in use, where process isolation is too coarse or unavailable, and where one compromised component sits close to more valuable functions.

## Briefing: memory safety has more than one route

Memory-safe languages can prevent broad classes of defects and are an important foundation for new software. CHERI addresses low-level and existing code that may not move to a new language quickly. The two approaches can coexist in one product.

Testing, hardening, process isolation, virtual machines, updates, and vulnerability management also remain necessary. CHERI’s distinctive contribution is that the processor can reject memory access outside a capability’s bounds or permissions, while compartments can limit the authority that remains after compromise.

This makes CHERI relevant to a portfolio of memory-safety measures rather than a universal replacement for them.

## Briefing: adoption depends on an ecosystem

A processor feature becomes useful in products through toolchains, operating systems, libraries, runtimes, debugging, training, test platforms, and assurance. CHERI’s path from research through [Morello](/hardware/morello/), [CheriBSD](/software/cheribsd/), [CHERIoT](/hardware/cheriot/), RISC-V work, and commercial processor intellectual property shows that these surrounding layers are developing together.

Shared specifications, open software, compliance tests, and available development platforms reduce the amount of work repeated by each adopter. Commercial products and public certification records make the technology easier to compare with a real product need.

## Briefing: outcomes matter more than labels

“CHERI-enabled” can describe very different levels of protection. A processor core may implement the architecture correctly, while a complete product may additionally run capability-aware software and use compartments throughout its design.

The meaningful outcome is the scope: which code uses capabilities, what memory and services each component can reach, which paths sit outside normal enforcement, and how the boundary behaves when an access is denied.

This is also why the CHERI Enabled programme is product-specific. Its public records connect the mark to a named version and submitted evidence rather than treating the technology name as a general security certificate.

## Briefing: containment supports resilience

Memory protection can stop an invalid operation. Compartmentalisation can prevent the affected component from reaching unrelated data or functions. Together, these properties can reduce the chance that one software flaw becomes a system-wide event.

For essential services, fault response remains part of the result. A capability fault may lead to restart, failover, degraded operation, or outage depending on the wider architecture. CHERI strengthens an internal boundary; availability and recovery remain system properties.

## Briefing: why CHERI may be a good fit

The strongest policy case appears where four conditions meet:

- memory-unsafe software remains necessary;
- that software processes untrusted data or operates with significant authority;
- replacing it or placing it behind heavyweight isolation is impractical;
- the consequence of compromise extends beyond the component itself.

In those circumstances, CHERI offers a practical bridge between today’s software and stronger secure-by-design expectations. It can preserve valuable low-level code while changing what that code is permitted to access and how far a compromise can travel.

The Alliance provides technical explanation and connects policy organisations with the wider CHERI ecosystem. Legal interpretation remains with the relevant authorities and qualified advisers.
