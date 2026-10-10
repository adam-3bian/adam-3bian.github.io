---
title: Commercialisation
permalink: /discover/history/commercialisation/
---

1. Discover
2. History
3. Commercialisation
{: .source-breadcrumbs }

# Commercialisation
{: id="page-hero-title" .page-hero-title }

CHERI commercialisation turns architecture and open-source evidence into licensable processors, silicon, tools, platforms, services, and certified products.
{: .page-hero-summary }

A secure architecture cannot improve deployed systems until organisations can buy, license, integrate, support, and assure it. That transition needs more than working processor prototypes. It needs stable specifications, product roadmaps, toolchains, operating systems, developer skills, supply chains, and evidence that customers can evaluate.

CHERI commercialisation developed by connecting each of those pieces.

## Building confidence through prototypes
{: id="building-confidence-through-prototypes" }

The early FPGA and CheriBSD stacks established that CHERI could run substantial C and C++ software. Morello then provided prototype silicon and a shared application-class platform for industrial evaluation. CHERI-RISC-V and CHERIoT broadened the range to configurable processors and embedded systems.

Public specifications, formal models, open-source compilers, operating systems, and simulators lowered the cost of entry. Organisations could begin software and assurance work before committing to a particular production device.

## What counts as a commercial ecosystem
{: id="what-counts-as-a-commercial-ecosystem" }

Commercialisation is not only the sale of a chip. Different organisations provide different layers:

- licensable processor intellectual property
- system-on-chip and microcontroller silicon
- FPGA development platforms and evaluation boards
- compilers, debuggers, simulators, and software development kits
- operating systems and runtime support
- porting, integration, verification, and assurance services
- training and developer support
- end products that incorporate CHERI-enabled components

An adopter may buy several of these layers from different suppliers. Interoperability and common software expectations therefore matter alongside individual product features.

## From CHERIoT to silicon
{: id="from-cheriot-to-silicon" }

CHERIoT moved from processor and real-time operating-system (RTOS) development into an open platform supported by multiple organisations. The ecosystem now includes released processor-core designs, the Sonata development platform, commercial devices, and a stable CHERIoT 1.0 instruction-set architecture (ISA) and RTOS line.

This provides a route from simulation and FPGA prototyping to embedded product development while retaining a common compartment and software model.

## Application-class products
{: id="application-class-products" }

Commercial CHERI-RISC-V development includes 64-bit application processors, evaluation kits, Linux and CheriBSD software, and supporting development tools. These products target workloads that need a memory management unit, richer operating systems, and larger software stacks.

The public product landscape changes quickly. The [CHERI Products directory](/build/platforms/cheri-products/) records the current mix of processor designs, hardware, operating systems, and tools.

## Certification and product claims
{: id="certification-and-product-claims" }

As products became available, adopters needed a clearer way to distinguish a genuine CHERI implementation from a loose marketing claim. The CHERI Alliance developed the CHERI Enabled programme to assess defined products against published criteria and evidence.

In March 2026, the programme listed its first certified products, CHERIoT Ibex and Codasip’s X730. Certification is scoped to the named product and version. It does not guarantee the security of every system built with that product.

## Remaining adoption work
{: id="remaining-adoption-work" }

Commercial availability does not remove integration risk. Product teams still need to answer:

- Which CHERI architecture and software application binary interface (ABI) does the product support?
- Can the required operating system, libraries, and language runtimes run on it?
- What source changes are needed for the workload?
- How are temporal safety and compartmentalisation implemented?
- What performance, area, power, and memory costs apply?
- What supplier support and lifecycle commitments are available?
- Which evidence can be reused in the product’s assurance case?

These questions are normal signs of an emerging technology market becoming an engineering and procurement discipline.

## From one project to many suppliers
{: id="from-one-project-to-many-suppliers" }

Commercialisation changes the centre of gravity. Universities and public programmes remain important sources of architecture, evidence, and open-source work, but products depend on suppliers, integrators, software communities, customers, and standards organisations.

The formation of the CHERI Alliance gave that wider group a neutral place to coordinate adoption, certification, technical alignment, and ecosystem development.

## Where next
{: .where-next-title }

### [Formation of the CHERI Alliance](/discover/history/formation-of-the-cheri-alliance/)
{: .where-next-card-title }





[Background on why the CHERI Alliance was formed and the role it plays in the ecosystem.](/discover/history/formation-of-the-cheri-alliance/)
{: .where-next-summary }



[Continue](/discover/history/formation-of-the-cheri-alliance/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Early Capability Systems](/discover/history/early-capability-systems/)
{: .related-pages-item-title }





[A short account of early capability-based computer systems and the ideas that influenced later work.](/discover/history/early-capability-systems/)
{: .related-pages-item-summary }



[Read this page](/discover/history/early-capability-systems/)
{: .source-card-label }





### [RISC-V and Embedded Development](/discover/history/risc-v-and-embedded-development/)
{: .related-pages-item-title }





[An overview of CHERI work for RISC-V and embedded systems.](/discover/history/risc-v-and-embedded-development/)
{: .related-pages-item-summary }



[Read this page](/discover/history/risc-v-and-embedded-development/)
{: .source-card-label }
