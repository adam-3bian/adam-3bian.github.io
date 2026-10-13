---
title: Adoption Costs & Migration
permalink: /adopt/business-case/adoption-costs-and-migration/
summary: CHERI adoption can range from protecting one exposed component to moving a complete platform, allowing
  cost and benefit to follow the scope of change.
image_url: null
updated_date: null
parent: /adopt/
next_page_url: /adopt/business-case/return-on-security-investment/
related:
  pages:
  - /adopt/business-case/the-business-case/
  - /adopt/business-case/cost-of-memory-unsafety/
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

# Adoption Costs & Migration

Adopting CHERI does not imply rewriting an entire product. The scope can range from one library or service to an operating system and full software stack. This matters because the cost of migration can be matched to the part of a system where memory protection or containment has the greatest value.

## Different forms of adoption

CHERI supports more than one transition model:

- Targeted compartments place selected components behind restricted interfaces, limiting their access to the rest of a system.
- Hybrid systems allow conventional pointers and capabilities to coexist, which supports gradual change and compatibility with software that has not yet moved.
- Pure-capability systems represent pointers as capabilities throughout the protected environment, providing broader and more consistent enforcement.
- New CHERI-native designs build capability boundaries into a platform from the outset, as seen in embedded systems such as CHERIoT.

These models offer different levels of coverage. A narrower change can reduce initial disruption, while a pure-capability environment exposes more unsafe assumptions and places more software under hardware enforcement.

## Where migration work appears

Much existing C and C++ code compiles with limited change. Work tends to concentrate in areas that treat pointers as unstructured numbers or depend on a specific pointer layout. Examples include custom allocators, hand-written assembly, device interfaces, serialisation code, and programs that store flags in unused pointer bits.

Costs can arise across several parts of a product:

- processor intellectual property, hardware, boards, simulators, and operating-system support;
- toolchains, build systems, continuous integration, debuggers, and analysis tools;
- source changes, third-party dependencies, assembly, and compartment interfaces;
- performance, memory, power, timing, and compatibility testing;
- training, documentation, assurance, supplier support, and long-term maintenance.

The shape of those costs is highly product-specific. A self-contained parser may be a modest port, while a low-level runtime or large codebase with unusual memory handling may require deeper work.

## Why incremental migration can fit

CHERI protection can be introduced at natural product boundaries: a new processor generation, an updated gateway, a replaceable service, or a component already due for substantial change. A representative component can reveal toolchain maturity, porting effort, and platform overhead before the same approach appears elsewhere in a product family.

This staged characteristic is important for long-lived and safety-related products. Existing releases can remain supported while new variants gain capability protection, and evidence can accumulate without making a whole estate depend on one migration event.

## Existing software remains part of the value

CHERI is unusual among memory-safety approaches because it can protect low-level software while retaining its language, algorithms, and much of its structure. That does not remove all porting work, but it changes the choice from “keep the code or gain stronger protection” to a broader set of options.

Third-party software remains an important factor. An upstream CHERI port can spread maintenance across a community, while a private patch, replacement component, or compartment boundary creates a different cost profile. The relevant question is not only whether the code runs, but how its protected form will be maintained across the product lifetime.

## Cost in context

Migration cost is best understood beside the cost of the risk it addresses. Products with little native code, short lives, or strong existing isolation may see limited benefit. Products that combine exposed C or C++ code, valuable assets, broad component authority, and many years of support can present a much stronger fit.

The porting overview describes the technical patterns that influence effort, and Choose a Platform explains the available execution environments.
