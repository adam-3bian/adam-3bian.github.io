---
title: Defence & Aerospace
layout: source
permalink: /sources/cheri-alliance.github.io/adopt/use-cases/defence-and-aerospace/
---

1. Adopt
2. Use Cases
3. Defence &amp; Aerospace
{: .source-breadcrumbs }

# Defence &amp; Aerospace
{: id="page-hero-title" .page-hero-title }

CHERI can reinforce least authority in mission systems that combine established software, mixed suppliers, long lifecycles, and demanding assurance.
{: .page-hero-summary }

Defence and aerospace systems often bring together software from different decades, suppliers, and assurance levels. They may operate with intermittent connectivity, strict timing and power limits, long hardware lifecycles, and active attempts to compromise them.

In this setting, one exposed component can sit close to mission data, communications, sensors, or control functions. A memory vulnerability in a message parser, driver, or supplier library can therefore create authority far beyond the component’s intended role.

## Why CHERI can fit mission systems
{: id="why-cheri-can-fit-mission-systems" }

CHERI gives the processor a direct role in enforcing least authority. Capabilities limit memory references by range and permission. Compartments can receive access to selected memory, devices, and callable services while remaining unable to reach the rest of the platform.

This is relevant to mission systems for several reasons:

- established C and C++ code may remain necessary for many years;
- software components can come from organisations with different trust relationships;
- full replacement may be constrained by qualification, hardware, or deployment cycles;
- exposed communications code may share a processor with sensitive functions;
- smaller platforms may not support heavyweight isolation for every component.

CHERI can strengthen both existing and new architectures. A legacy parser can gain bounded memory access, while a redesigned platform can use compartments to make authority between components explicit from the outset.

## Prevention and containment
{: id="prevention-and-containment" }

The first benefit is prevention. The processor can stop many out-of-bounds accesses, unauthorised writes, and attempts to execute data when the relevant capability lacks permission.

The second is containment. A component compromised through a logic flaw or another route can retain only the memory and services delegated to it. Communications software, file handlers, drivers, mission applications, and third-party modules can therefore be separated even when they share an address space.

For a mission system, the difference between compromise of one parser and compromise of mission state can be more important than the original vulnerability.

## A contribution to assurance
{: id="a-contribution-to-assurance" }

CHERI supports precise claims. A system can describe that a parser has access to particular buffers and services, or that one supplier component cannot access another component’s state. Those claims can be connected to the processor architecture, software configuration, and test evidence.

This precision is valuable in systems where broad claims such as “secure” or “isolated” are not enough. The exact processor, instruction-set version, toolchain, runtime, compartment mechanism, and software configuration still determine what is enforced.

CHERI does not replace system safety, cryptography, cross-domain controls, secure boot, emissions security, supply-chain assurance, or operational procedures. Export-control and information-handling obligations also remain specific to the product, organisations, information, and jurisdictions involved.

## Where the fit is strongest
{: id="where-the-fit-is-strongest" }

The case is strongest where software is both exposed and close to mission assets, especially when that software cannot be rewritten or separated into a conventional process without unacceptable cost. Timing, power, recovery behaviour, update support, and platform availability remain important constraints.

Within those constraints, CHERI offers a concrete architectural advantage: valuable native software can remain part of the mission system while the processor enforces a much narrower account of what each component is allowed to reach.

## Where next
{: .where-next-title }

### [Safety-Critical Systems](https://cheri-alliance.github.io/adopt/use-cases/safety-critical-systems/)
{: .where-next-card-title }





[Safety-critical systems show how bounded memory and explicit authority can contribute evidence within a wider safety and security case.](https://cheri-alliance.github.io/adopt/use-cases/safety-critical-systems/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/adopt/use-cases/safety-critical-systems/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Automotive](https://cheri-alliance.github.io/adopt/use-cases/automotive/)
{: .related-pages-item-title }





[Connected vehicles combine exposed software, long lifecycles, and components with very different levels of trust.](https://cheri-alliance.github.io/adopt/use-cases/automotive/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/use-cases/automotive/)
{: .source-card-label }





### [Cloud &amp; Data Centre](https://cheri-alliance.github.io/adopt/use-cases/cloud-and-data-centre/)
{: .related-pages-item-title }





[Cloud infrastructure benefits from finer protection inside processes, containers, and virtual machines.](https://cheri-alliance.github.io/adopt/use-cases/cloud-and-data-centre/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/use-cases/cloud-and-data-centre/)
{: .source-card-label }





### [The Business Case](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .source-card-label }
