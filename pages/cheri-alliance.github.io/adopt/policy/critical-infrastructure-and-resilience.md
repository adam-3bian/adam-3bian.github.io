---
title: Critical Infrastructure & Resilience
layout: source
permalink: /sources/cheri-alliance.github.io/adopt/policy/critical-infrastructure-and-resilience/
---

1. Adopt
2. Policy
3. Critical Infrastructure &amp; Resilience
{: .source-breadcrumbs }

# Critical Infrastructure &amp; Resilience
{: id="page-hero-title" .page-hero-title }

CHERI can support infrastructure resilience by preventing or limiting attacks.
{: .page-hero-summary }

Critical infrastructure depends on services that society cannot easily function without. Disruption to energy, water, transport, healthcare, communications, or industrial systems can have consequences far beyond a single organisation.

CHERI cannot provide service resilience by itself, but it can strengthen the technical foundations underneath it.

Cybersecurity frameworks such as European Union’s [NIS2 directive](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive) increasingly emphasise resilience, risk management, and the protection of essential services. These goals align closely with reducing the impact of software vulnerabilities and limiting the consequences of compromise.

The growing importance of memory safety is also reflected in **ETSI TS 104 198 Memory Safety** standard, which defines multiple levels of memory-safety assurance and recognises CHERI as one of the strongest approaches.

## Memory Safety and resilience
{: id="memory-safety-and-resilience" }

Essential systems often contain native code, specialist devices, supplier components, and long replacement cycles. Some software remains in operation for decades. A recurring memory vulnerability can therefore affect systems that are difficult to patch, replace, or take offline.

Conventional mitigations reduce the likelihood of successful exploitation, but they may still allow the invalid access to occur, with potentially damaging and irreversible consequences. CHERI changes that boundary by allowing the processor to enforce what software can access and what it is allowed to do.

This can lead to:

- **Reducing the likelihood** of compromise
- **Limiting the impact** of compromise

The distinction is important in infrastructure. Preventing every attack is unrealistic, while preventing one compromised component from reaching an essential function can still preserve part of the service.

## Where CHERI can fit infrastructure policy
{: id="where-cheri-can-fit-infrastructure-policy" }

CHERI can be relevant to industrial gateways, control systems, communications equipment, remote-management platforms, monitoring infrastructure, update services, and safety-related embedded devices. These components often process untrusted data while holding access to more sensitive systems.

It is also relevant to constrained controllers where conventional process isolation is unavailable, and to consolidated systems where software of different trust levels shares one processor.

Because CHERI can protect existing C and C++ software, it offers a route that aligns with **gradual infrastructure renewal**. Capability-aware components can appear in new equipment while older protocols and neighbouring systems remain in service.

## Resilience beyond containment
{: id="resilience-beyond-containment" }

A capability fault prevents an unauthorised memory operation, but it may stop the affected component. Availability then depends on the wider design: redundancy, restart, failover, safe degradation, logging, and recovery.

Network segmentation, identity, secure configuration, monitoring, backups, incident response, supply-chain assurance, physical protection, and manual alternatives also remain necessary. CHERI adds an internal boundary; it does not replace the layers around it.

## More meaningful security claims
{: id="more-meaningful-security-claims" }

Policy and assurance benefit when a technology claim describes an outcome. “The protocol parser cannot access control state” identifies a boundary that can be represented and tested. “The device uses CHERI” does not reveal how much software is protected or what remains reachable.

As governments and operators place greater emphasis on resilience, the ability to contain failures becomes increasingly important, especially for critical infrastructure. CHERI helps reduce the impact of memory vulnerabilities and strengthens separation between critical functions, supporting more resilient digital infrastructure without requiring complete replacement of existing software.

## Where next
{: .where-next-title }

### [CHERI and Cybersecurity Regulation](https://cheri-alliance.github.io/adopt/policy/cybersecurity-regulation/)
{: .where-next-card-title }





[Regulators increasingly expect security-by-design, resilience and effective risk management – CHERI can support those.](https://cheri-alliance.github.io/adopt/policy/cybersecurity-regulation/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/adopt/policy/cybersecurity-regulation/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Government Guidance](https://cheri-alliance.github.io/adopt/policy/government-guidance/)
{: .related-pages-item-title }





[Public guidance places CHERI alongside memory-safe languages and other routes to more resilient software.](https://cheri-alliance.github.io/adopt/policy/government-guidance/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/policy/government-guidance/)
{: .source-card-label }





### [The Business Case](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .source-card-label }
