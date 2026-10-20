---
layout: page
title: Hybrid Systems
summary: Hybrid CHERI combines conventional pointers with capabilities, enabling incremental adoption of CHERI protections.
permalink: /build/technology/hybrid-systems/
slug: build-technology-hybrid-systems
navigation:
  header:
    category: Build
    subcategory: Technology
related:
- type: page
  slug: build-technology-pure-capability-systems
  relation: next_step
- type: page
  slug: build-technology-how-cheri-capabilities-work
  relation: related
- type: page
  slug: build-technology-compartmentalisation
  relation: related
---

## Overview

Converting every pointer, library and interface at once is rarely practical. Hybrid systems allow existing C and C++ code to continue using conventional pointers while selected code uses explicit capabilities.

This makes hybrid CHERI useful for migration, experimentation and introducing capability-aware interfaces.

However, hybrid and pure-capability systems provide different levels of protection. In a hybrid system, capability protection applies where capabilities are actually used.

## How hybrid CHERI works

In hybrid software, conventional pointers and capabilities can coexist. This requires hardware that supports hybrid mode.

Existing code can continue using conventional pointers, while capability-aware code can use capabilities with explicit bounds and permissions for selected objects and interfaces.

This allows developers to introduce CHERI **progressively** rather than converting an entire software stack at once.

However, conventional pointer accesses do not automatically gain the object-level bounds associated with capability pointers.

## Why use hybrid mode

Hybrid mode can help teams:

- introduce capability-aware interface incrementally
- build protected handles and service entry points
- experiment with compartment mechanisms
- run conventional libraries while porting selected components
- preserve a familiar ABI during architecture development
- measure and debug capability operations before wider conversion

It can therefore be a useful step between conventional software and a broader pure-capability deployment.

## A staged example

Imagine a conventional service that receives network data. A first hybrid step might explicitly derive a bounded, read-only capability for one packet and pass it to a capability-aware parser.

The parser gains useful protection for accesses through that capability. Other conventional pointers in the service remain governed by the legacy model. If the parser converts back to a conventional pointer or receives a broad default authority, the effective boundary may weaken.

The security claim must therefore identify the protected path:

> The parser accesses packet data only through a read-only capability bounded to the packet.

It should not claim:

> The complete service has pure-capability memory safety.

## ABI compatibility

One reason for using a hybrid model is to preserve compatibility with existing code and interfaces while introducing capabilities selectively.

Capability-aware interfaces still require appropriate types, calling conventions and supporting libraries. Mixing conventional and capability-aware code is platform-specific, so compatibility should not be assumed simply because both forms of code run on the same processor.

## Security coverage

Hybrid mode provides strong enforcement where valid, tightly bounded capabilities are used. It may also support sealed objects and compartment entry mechanisms.

Coverage remains selective:

- ordinary pointers may retain broad address-space authority
- compiler-created object bounds may not cover conventional code
- a component may still hold ambient legacy authority
- conversions between pointer forms require careful review

This makes hybrid mode useful for transition but harder to describe with a single percentage or label.

## Moving towards pure capability

Hybrid CHERI can be a useful way to discover porting issues and introduce capability-aware interfaces before moving more software to a pure-capability ABI.

Typical migration work includes:

- porting dependencies
- removing assumptions that pointers are ordinary integers
- addressing object-bound and allocator issues
- reviewing assembly and foreign-function interfaces
- testing the application under the pure-capability ABI

Not every system needs to migrate everything. Where conventional components remain, developers should understand and document the authority those components retain.

## Key takeaway

Hybrid CHERI provides a practical path to incremental adoption, but its protection is selective. Capabilities can protect specific objects, interfaces and components while existing software continues to run conventionally.

For broader protection of C and C++ pointers throughout an application, the next step is [Pure-Capability Systems](/build/technology/pure-capability-systems/).
