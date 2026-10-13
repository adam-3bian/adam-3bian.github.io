---
title: Bringing CHERI to your product
permalink: /discover/understand/adapt-products/
summary: What needs to change, and what doesn't.
image_url: null
updated_date: null
parent: /discover/
next_page_url: /build/technology/cheri-and-rust-technical/
related:
  pages:
  - /discover/understand/cheri-and-existing-software/
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

# Bringing CHERI to your product

Adopting CHERI does not mean rebuilding the entire technology stack. One of CHERI’s strengths is that different organisations can contribute at different points in the value chain, allowing the benefits of hardware-enforced memory protection and compartmentalisation to flow from silicon vendors to end products.

## What needs to change?

CHERI is a hardware technology, so it needs to be introduced across the layers of a system:

- Layer: Processor architecture; What changes?: CHERI adds capabilities and associated instructions to the architecture
- Layer: Processor IP; What changes?: Processor cores are modified or designed to implement the CHERI architecture
- Layer: Chips; What changes?: One or more CHERI-enabled processors are integrated into the device
- Layer: Operating systems; What changes?: OS to be recompiled and adapted to add compartmentalisation - Cf CHERI and existing software
- Layer: Development tools; What changes?: Compilers, debuggers, and toolchains are updated to support CHERI
- Layer: Software; What changes?: Applications and firmware are recompiled and, where necessary, adapted - Cf CHERI and existing software
- Layer: Platforms, modules, products; What changes?: CHERI-enabled hardware and software are integrated into final products
- Layer: Users; What changes?: CHERI is not visible to the users, they just see the benefits

Not every layer requires the same level of effort. Much of the complexity is handled by processor vendors, operating system developers, and toolchain providers, allowing many product teams to adopt CHERI incrementally.

## Where are you in the value chain?

![Value chain](/assets/shared/source-assets/42beef82414f-value-chain.webp){: .image-full }

### Processor designers

CHERI starts with the processor. Adding CHERI involves extending the processor with support for capabilities, including:

- Capability-aware registers and instructions
- Hardware enforcement of bounds and permissions
- Secure capability creation and derivation
- Support for compartmentalisation mechanisms

This is the layer where most of the CHERI-specific engineering effort takes place. Fortunately, processor designers do not have to start from scratch. CHERI specifications, reference implementations, open-source designs, and standardisation work such as the RISC-V RVY architecture extension provide a clear path to implementation.

### Chips / SoC designers

If you integrate processor IP into a SoC, adopting CHERI is primarily about selecting or integrating CHERI-enabled processor cores and following some guidelines. Recommendations and best practices to do this are available from the CHERI Alliance.

Integrating CHERI-enabled processor cores into an SoC is broadly similar to integrating any other processor IP, allowing organisations to build on established chip-development processes and expertise.

It is a natural evolution towards more security, and often goes along improved security enhancements such as Post-Quantum crypto support. CHERI is complementary to traditional security technologies, as it fills an important gap by addressing memory safety and enabling fine-grained compartmentalisation.

### Platform developers

For platform and module vendors, adoption often consists primarily of selecting CHERI-enabled silicon and integrating with CHERI-enabled software.

### Device manufacturers and product vendors

Many manufacturers will adopt CHERI simply by selecting CHERI-enabled platforms or modules from their suppliers.

### Users

The underlying capability mechanisms remain largely invisible to end users. They benefit from stronger protection against memory-safety vulnerabilities and greater resilience when vulnerabilities do occur.

## Adoption does not happen all at once

Different organisations can adopt CHERI independently.

A processor vendor may implement CHERI years before a product team fully exploits compartmentalisation. Similarly, software developers may begin by recompiling applications before redesigning parts of their architecture to take advantage of stronger isolation.

This flexibility allows CHERI adoption to follow existing product roadmaps and investment cycles.

## In summary

Bringing CHERI to a product is not a single activity performed by a single organisation. It is a value-chain effort that starts with CHERI-enabled hardware and continues through platforms, operating systems, software, and product integration.

The good news is that every participant except processor designers can adopt CHERI incrementally. As support spreads through the ecosystem, organisations gain access to hardware-enforced memory protection and fine-grained compartmentalisation while continuing to build on existing technologies and software investments.
