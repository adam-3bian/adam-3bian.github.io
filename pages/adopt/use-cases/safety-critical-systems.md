---
title: Safety-Critical Systems
permalink: /adopt/use-cases/safety-critical-systems/
---

1. Adopt
2. Use Cases
3. Safety-Critical Systems
{: .source-breadcrumbs }

# Safety-Critical Systems
{: id="page-hero-title" .page-hero-title }

CHERI can make memory access and component authority more explicit, adding hardware-enforced evidence to a wider safety and security case.
{: .page-hero-summary }

Safety-critical systems depend on software behaving within defined limits. Connectivity adds another concern: a security compromise in a communications or diagnostic component can influence functions whose failure could cause physical harm.

Memory safety matters because an invalid read or write can bypass the structure that the software design intended. If components share memory or broad privileges, one defect can also cross an assumed boundary between functions of different criticality.

## Why CHERI can fit safety-related designs
{: id="why-cheri-can-fit-safety-related-designs" }

CHERI makes part of that boundary enforceable by the processor. Capabilities limit memory access by range and permission. Compartments can restrict lower-trust or lower-assurance components to selected data, devices, and services.

These mechanisms can support properties such as:

- spatial memory safety, keeping capability-mediated access within the intended object;
- access permissions such as read-only, write-only, or non-executable;
- separation between components with different criticality or provenance;
- restricted authority for diagnostics, communications, and third-party code;
- detection of invalid access at the operation that caused it.

A diagnostics component, for example, can receive read-only access to selected measurements without authority over actuator state. A parser can handle an incoming message inside bounded buffers without direct access to the control loop.

## Stronger evidence, narrower claims
{: id="stronger-evidence-narrower-claims" }

Safety and security cases depend on evidence about a specific system. CHERI can make some claims more concrete because bounds, permissions, and compartment interfaces are represented in the running architecture rather than existing only in design documentation.

The resulting claim remains precise. CHERI does not establish that an entire system is memory safe. The base architecture primarily addresses spatial memory safety and pointer integrity. Temporal safety, which concerns access after an object’s valid lifetime has ended, depends on suitable allocation and revocation mechanisms. Logic errors, concurrency, unsafe assembly, direct-memory-access devices, hardware faults, and availability hazards remain separate concerns.

## Faults and safe behaviour
{: id="faults-and-safe-behaviour" }

Stopping an invalid access prevents memory corruption, but the resulting capability fault can interrupt a component. The wider system determines whether that event is contained, reported, restarted, tolerated through redundancy, or followed by a safe degraded state.

This makes CHERI relevant to both prevention and fault handling. A clear failure at the point of access may be easier to diagnose than silent corruption, while compartmentalisation can reduce the number of functions affected by that failure.

Worst-case timing, memory use, diagnostic coverage, determinism, recovery, and resource limits remain properties of the complete platform and workload. CHERI’s value lies in adding enforceable memory and authority properties within those constraints.

## Relationship to certification
{: id="relationship-to-certification" }

Certification remains specific to a sector, product, claim, lifecycle, and authority. A CHERI-capable processor does not certify the system that contains it. It can, however, provide architectural and test evidence for claims about memory access, separation, and the authority retained after a component fails or is compromised.

That makes CHERI a potential fit where native software remains necessary and a safety or security argument depends on keeping one component’s failure away from more critical functions. It contributes a stronger boundary; the wider engineering and assurance case explains how that boundary supports safe operation.

## Where next
{: .where-next-title }

### [Case Studies](/adopt/assurance-and-adoption/case-studies/)
{: .where-next-card-title }





[Case studies show how CHERI has moved from research into operating systems, embedded platforms, software ports, and processor products.](/adopt/assurance-and-adoption/case-studies/)
{: .where-next-summary }



[Continue](/adopt/assurance-and-adoption/case-studies/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Automotive](/adopt/use-cases/automotive/)
{: .related-pages-item-title }





[Connected vehicles combine exposed software, long lifecycles, and components with very different levels of trust.](/adopt/use-cases/automotive/)
{: .related-pages-item-summary }



[Read this page](/adopt/use-cases/automotive/)
{: .source-card-label }





### [Defence &amp; Aerospace](/adopt/use-cases/defence-and-aerospace/)
{: .related-pages-item-title }





[Mission systems combine active threats, long lifecycles, mixed suppliers, and demanding assurance.](/adopt/use-cases/defence-and-aerospace/)
{: .related-pages-item-summary }



[Read this page](/adopt/use-cases/defence-and-aerospace/)
{: .source-card-label }





### [The Business Case](/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](/adopt/business-case/the-business-case/)
{: .source-card-label }
