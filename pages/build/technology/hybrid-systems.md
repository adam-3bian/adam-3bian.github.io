---
title: Hybrid Systems
permalink: /build/technology/hybrid-systems/
summary: Hybrid CHERI systems combine conventional pointers with explicit capabilities, supporting staged adoption while leaving some accesses outside capability protection.
parent: /build/
next_page_url: /build/technology/pure-capability-systems/
related:
  pages:
  - /build/technology/capabilities/
  - /build/technology/compartmentalisation/
---

# Hybrid Systems

Replacing every pointer and binary interface at once is rarely practical. CHERI therefore supports hybrid systems, where conventional address-based software coexists with capability-aware code.

Hybrid operation is a migration and experimentation tool. It is not the same security property as a pure-capability application.

## What “hybrid” can mean

The precise model depends on the architecture and application binary interface (ABI), but hybrid software commonly has:

- conventional language-visible pointers for ordinary C and C++ code
- explicit capability-qualified pointer types for selected objects or interfaces
- capability registers and instructions available to capability-aware code
- operating-system support for saving, mapping, and passing capabilities
- a conventional ABI preserved for much of the program

Legacy loads and stores may be authorised relative to a broader default capability or architectural context. They do not automatically carry a separate bound for each C object.

## Why use hybrid mode

Hybrid mode can help teams:

- introduce one capability-aware interface at a time
- build protected handles and service entry points
- experiment with compartment mechanisms
- run conventional libraries while porting selected components
- preserve a familiar ABI during architecture development
- measure and debug capability operations before wider conversion

It played an important role in the development of CheriBSD and the wider CHERI software model.

## A staged example

Imagine a conventional service that receives network data. A first hybrid step might explicitly derive a bounded, read-only capability for one packet and pass it to a capability-aware parser.

The parser gains useful protection for accesses through that capability. Other conventional pointers in the service remain governed by the legacy model. If the parser converts back to a conventional pointer or receives a broad default authority, the effective boundary may weaken.

The security claim must therefore identify the protected path:

The parser accesses packet data only through a read-only capability bounded to the packet.

It should not claim:

The complete service has pure-capability memory safety.

## ABI compatibility

Keeping a conventional ABI reduces some migration costs. Existing structure layouts, pointer sizes, and call conventions may remain usable for code that does not expose capabilities.

Interfaces that pass capabilities still need capability-aware calling conventions, types, relocation support, and libraries. Mixing modes is platform-specific. A library built for one ABI cannot be assumed compatible with another because both run on the same processor.

## Security coverage

Hybrid mode provides strong enforcement where valid, tightly bounded capabilities are used. It may also support sealed objects and compartment entry mechanisms.

Coverage remains selective:

- ordinary pointers may retain broad address-space authority
- compiler-created object bounds may not cover conventional code
- a component may still hold ambient legacy authority
- conversions between pointer forms require careful review

This makes hybrid mode useful for transition but harder to describe with a single percentage or label.

## Planning a move to pure capability

A hybrid prototype can identify capability-aware interfaces and porting issues. To gain broader protection:

- build dependencies for the pure-capability ABI
- replace pointer-integer assumptions
- fix object-bound and allocator issues
- validate foreign-function and assembly boundaries
- run the complete test suite as pure-capability code
- confirm that conventional fallback paths are no longer used

Some systems may retain hybrid components deliberately where required. Document that residual authority and contain it behind a narrow boundary.

## Key takeaway

Hybrid CHERI makes incremental adoption possible, but capability protection is only present where the software actually uses capabilities. For broad C and C++ pointer protection, compare Pure-Capability Systems.
