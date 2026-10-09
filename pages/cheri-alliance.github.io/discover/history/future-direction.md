---
title: Future Direction
layout: source
permalink: /sources/cheri-alliance.github.io/discover/history/future-direction/
---

1. Discover
2. History
3. Future Direction
{: .source-breadcrumbs }

# Future Direction
{: id="page-hero-title" .page-hero-title }

CHERI’s next phase depends on stable standards, broader products, support in widely used software projects, practical assurance, and evidence from real deployments.
{: .page-hero-summary }

Working prototypes have answered the first question: capability memory protection can be integrated with modern processors, operating systems, compilers, and large C and C++ codebases. Commercial products have answered another: CHERI technology can move into licensable processor designs and silicon.

The next questions concern scale, interoperability, maintenance, and deployment. This page describes active directions, not promises about a particular product roadmap.

## Stable and portable architecture definitions
{: id="stable-and-portable-architecture-definitions" }

An ecosystem needs specifications that different implementers can follow and software can target with confidence. Work continues on CHERI-RISC-V architecture definitions, embedded profiles such as CHERIoT, formal models, compliance tests, and common terminology across instruction sets.

Standardisation must preserve useful security properties while allowing processors at very different scales. A small microcontroller and a server processor may represent capabilities differently or offer different supporting mechanisms, but developers still need predictable language and software behaviour.

## Support in mainline software projects
{: id="support-in-mainline-software-projects" }

Long-term adoption depends on reducing the number of permanent forks. Important directions include:

- integrating CHERI support into mainstream compiler infrastructure
- maintaining cross-architecture Linux support and working towards acceptance in the main Linux project
- extending operating-system and runtime coverage
- improving package, library, debugger, and build-system portability
- strengthening Rust and other memory-safe language support
- providing continuous integration across simulators and hardware

Moving support into mainline projects is not only a technical task. Projects need maintainers, review capacity, test infrastructure, and designs that serve users beyond one demonstration.

## Broader hardware and product choices
{: id="broader-hardware-and-product-choices" }

Current implementations cover embedded cores, FPGA platforms, application-class processors, and commercial devices. Future growth is likely to add different performance, power, safety, virtualisation, and integration points.

Product diversity makes clear comparison more important. Buyers need to know the architecture version, software mode, temporal-safety support, compartment model, toolchain, lifecycle, and evidence attached to each offering.

## Practical compartmentalisation
{: id="practical-compartmentalisation" }

Memory-safe pointers reduce one major vulnerability class. Compartmentalisation addresses the authority that remains when code is buggy or compromised.

Active work includes compartment models for applications, operating systems, real-time systems, language runtimes, virtual machines, drivers, and third-party libraries. The engineering challenge is to make boundaries practical to define, inspect, test, and maintain without unacceptable transition or communication costs.

## Temporal safety
{: id="temporal-safety" }

Capability bounds provide strong spatial protection, but object lifetime requires additional attention. Different systems are exploring allocator integration, revocation, quarantine, schemes that distinguish generations of reused storage, time periods known as epochs, and architecture-specific mechanisms to stop stale capabilities being reused.

Future guidance needs to state these guarantees precisely. The phrase “uses CHERI” does not identify the temporal-safety mechanism or its limits.

## Assurance, safety, and certification
{: id="assurance-safety-and-certification" }

Adopters in automotive, infrastructure, aerospace, medical, and industrial markets need evidence that fits established assurance and safety processes. Useful work includes formal models, processor verification, compiler validation, fault-injection tests, security cases, traceable configuration, and certification criteria.

The CHERI Enabled programme provides one product-focused evidence route. It is expected to evolve as standards, tests, and implementation experience mature.

## Adoption evidence and economics
{: id="adoption-evidence-and-economics" }

Technical demonstrations need repeatable evidence from real workloads. Organisations need to compare:

- vulnerabilities prevented or contained
- porting and training effort
- performance, memory, power, and silicon cost
- update and incident-response burden
- assurance evidence reused across a product line
- supplier availability and long-term support

Publishing both benefits and limitations will help buyers make decisions without treating CHERI as a universal answer.

## A layered future
{: id="a-layered-future" }

CHERI is likely to develop alongside safer programming languages, improved C and C++ practices, formal methods, exploit mitigations, and stronger operational security. These approaches protect different boundaries.

The direction is not “hardware instead of software”. It is a hardware-software foundation in which pointers carry enforceable authority, components receive less privilege, and higher layers can build on stronger guarantees.

The [CHERI Alliance](https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/) and the [University of Cambridge CHERI project](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/) track current work and product announcements. Individual open-source projects and suppliers provide details for their own releases.

## Where next
{: .where-next-title }

### [Specifications](https://cheri-alliance.github.io/discover/resources/specifications/)
{: .where-next-card-title }





[A directory of architecture and related specifications relevant to CHERI.](https://cheri-alliance.github.io/discover/resources/specifications/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/discover/resources/specifications/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Early Capability Systems](https://cheri-alliance.github.io/discover/history/early-capability-systems/)
{: .related-pages-item-title }





[A short account of early capability-based computer systems and the ideas that influenced later work.](https://cheri-alliance.github.io/discover/history/early-capability-systems/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/discover/history/early-capability-systems/)
{: .source-card-label }





### [Formation of the CHERI Alliance](https://cheri-alliance.github.io/discover/history/formation-of-the-cheri-alliance/)
{: .related-pages-item-title }





[Background on why the CHERI Alliance was formed and the role it plays in the ecosystem.](https://cheri-alliance.github.io/discover/history/formation-of-the-cheri-alliance/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/discover/history/formation-of-the-cheri-alliance/)
{: .source-card-label }
