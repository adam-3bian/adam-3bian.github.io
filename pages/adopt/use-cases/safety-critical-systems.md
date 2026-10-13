---
title: Safety-Critical Systems
permalink: /adopt/use-cases/safety-critical-systems/
summary: CHERI can make memory access and component authority more explicit, adding hardware-enforced evidence
  to a wider safety and security case.
image_url: null
updated_date: null
parent: /adopt/
next_page_url: /adopt/assurance-and-adoption/case-studies/
related:
  pages:
  - /adopt/use-cases/automotive/
  - /adopt/use-cases/defence-and-aerospace/
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

# Safety-Critical Systems

Safety-critical systems depend on software behaving within defined limits. Connectivity adds another concern: a security compromise in a communications or diagnostic component can influence functions whose failure could cause physical harm.

Memory safety matters because an invalid read or write can bypass the structure that the software design intended. If components share memory or broad privileges, one defect can also cross an assumed boundary between functions of different criticality.

## Why CHERI can fit safety-related designs

CHERI makes part of that boundary enforceable by the processor. Capabilities limit memory access by range and permission. Compartments can restrict lower-trust or lower-assurance components to selected data, devices, and services.

These mechanisms can support properties such as:

- spatial memory safety, keeping capability-mediated access within the intended object;
- access permissions such as read-only, write-only, or non-executable;
- separation between components with different criticality or provenance;
- restricted authority for diagnostics, communications, and third-party code;
- detection of invalid access at the operation that caused it.

A diagnostics component, for example, can receive read-only access to selected measurements without authority over actuator state. A parser can handle an incoming message inside bounded buffers without direct access to the control loop.

## Stronger evidence, narrower claims

Safety and security cases depend on evidence about a specific system. CHERI can make some claims more concrete because bounds, permissions, and compartment interfaces are represented in the running architecture rather than existing only in design documentation.

The resulting claim remains precise. CHERI does not establish that an entire system is memory safe. The base architecture primarily addresses spatial memory safety and pointer integrity. Temporal safety, which concerns access after an object’s valid lifetime has ended, depends on suitable allocation and revocation mechanisms. Logic errors, concurrency, unsafe assembly, direct-memory-access devices, hardware faults, and availability hazards remain separate concerns.

## Faults and safe behaviour

Stopping an invalid access prevents memory corruption, but the resulting capability fault can interrupt a component. The wider system determines whether that event is contained, reported, restarted, tolerated through redundancy, or followed by a safe degraded state.

This makes CHERI relevant to both prevention and fault handling. A clear failure at the point of access may be easier to diagnose than silent corruption, while compartmentalisation can reduce the number of functions affected by that failure.

Worst-case timing, memory use, diagnostic coverage, determinism, recovery, and resource limits remain properties of the complete platform and workload. CHERI’s value lies in adding enforceable memory and authority properties within those constraints.

## Relationship to certification

Certification remains specific to a sector, product, claim, lifecycle, and authority. A CHERI-capable processor does not certify the system that contains it. It can, however, provide architectural and test evidence for claims about memory access, separation, and the authority retained after a component fails or is compromised.

That makes CHERI a potential fit where native software remains necessary and a safety or security argument depends on keeping one component’s failure away from more critical functions. It contributes a stronger boundary; the wider engineering and assurance case explains how that boundary supports safe operation.
