---
title: Policy Briefings
layout: source
permalink: /sources/cheri-alliance.github.io/adopt/policy/policy-briefings/
---

1. Adopt
2. Policy
3. Policy Briefings
{: .source-breadcrumbs }

# Policy Briefings
{: id="page-hero-title" .page-hero-title }

CHERI gives policy discussions an additional route to memory safety: hardware-enforced protection for low-level and existing software, with finer-grained containment.
{: .page-hero-summary }

Memory safety policy often centres on language change, vulnerability reduction, or secure development practice. CHERI broadens that discussion by protecting memory at the processor and supporting compartments with limited authority.

Its relevance is greatest where established native code will remain in use, where process isolation is too coarse or unavailable, and where one compromised component sits close to more valuable functions.

## Briefing: memory safety has more than one route
{: id="briefing-memory-safety-has-more-than-one-route" }

Memory-safe languages can prevent broad classes of defects and are an important foundation for new software. CHERI addresses low-level and existing code that may not move to a new language quickly. The two approaches can coexist in one product.

Testing, hardening, process isolation, virtual machines, updates, and vulnerability management also remain necessary. CHERI’s distinctive contribution is that the processor can reject memory access outside a capability’s bounds or permissions, while compartments can limit the authority that remains after compromise.

This makes CHERI relevant to a portfolio of memory-safety measures rather than a universal replacement for them.

## Briefing: adoption depends on an ecosystem
{: id="briefing-adoption-depends-on-an-ecosystem" }

A processor feature becomes useful in products through toolchains, operating systems, libraries, runtimes, debugging, training, test platforms, and assurance. CHERI’s path from research through Morello, CheriBSD, CHERIoT, RISC-V work, and commercial processor intellectual property shows that these surrounding layers are developing together.

Shared specifications, open software, compliance tests, and available development platforms reduce the amount of work repeated by each adopter. Commercial products and public certification records make the technology easier to compare with a real product need.

## Briefing: outcomes matter more than labels
{: id="briefing-outcomes-matter-more-than-labels" }

“CHERI-enabled” can describe very different levels of protection. A processor core may implement the architecture correctly, while a complete product may additionally run capability-aware software and use compartments throughout its design.

The meaningful outcome is the scope: which code uses capabilities, what memory and services each component can reach, which paths sit outside normal enforcement, and how the boundary behaves when an access is denied.

This is also why the CHERI Enabled programme is product-specific. Its public records connect the mark to a named version and submitted evidence rather than treating the technology name as a general security certificate.

## Briefing: containment supports resilience
{: id="briefing-containment-supports-resilience" }

Memory protection can stop an invalid operation. Compartmentalisation can prevent the affected component from reaching unrelated data or functions. Together, these properties can reduce the chance that one software flaw becomes a system-wide event.

For essential services, fault response remains part of the result. A capability fault may lead to restart, failover, degraded operation, or outage depending on the wider architecture. CHERI strengthens an internal boundary; availability and recovery remain system properties.

## Briefing: why CHERI may be a good fit
{: id="briefing-why-cheri-may-be-a-good-fit" }

The strongest policy case appears where four conditions meet:

- memory-unsafe software remains necessary;
- that software processes untrusted data or operates with significant authority;
- replacing it or placing it behind heavyweight isolation is impractical;
- the consequence of compromise extends beyond the component itself.

In those circumstances, CHERI offers a practical bridge between today’s software and stronger secure-by-design expectations. It can preserve valuable low-level code while changing what that code is permitted to access and how far a compromise can travel.

The Alliance provides technical explanation and connects policy organisations with the wider CHERI ecosystem. Legal interpretation remains with the relevant authorities and qualified advisers.

## Where next
{: .where-next-title }

### [About the CHERI Alliance](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/)
{: .where-next-card-title }





[The CHERI Alliance connects organisations working across architecture, processors, software, assurance, policy, and adoption.](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Government Guidance](https://cheri-alliance.github.io/adopt/policy/government-guidance/)
{: .related-pages-item-title }





[Public guidance places CHERI alongside memory-safe languages and other routes to more resilient software.](https://cheri-alliance.github.io/adopt/policy/government-guidance/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/policy/government-guidance/)
{: .source-card-label }





### [Critical Infrastructure &amp; Resilience](https://cheri-alliance.github.io/adopt/policy/critical-infrastructure-and-resilience/)
{: .related-pages-item-title }





[CHERI can contribute prevention and containment within the wider resilience of an essential service.](https://cheri-alliance.github.io/adopt/policy/critical-infrastructure-and-resilience/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/policy/critical-infrastructure-and-resilience/)
{: .source-card-label }





### [The Business Case](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .source-card-label }
