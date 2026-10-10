---
title: Hybrid Systems
permalink: /build/technology/hybrid-systems/
where-next:
  url: /build/technology/pure-capability-systems/
related-pages:
- url: /build/technology/capabilities/
  description: A pointer bug becomes dangerous when changing a number changes authority.
  action: Read this page
- url: /build/technology/compartmentalisation/
  description: A media application may include millions of lines of code, dozens of libraries, and parsers for hostile input.
  action: Read this page
---

1. Build
2. Technology
3. Hybrid Systems
{: .source-breadcrumbs }

# Hybrid Systems
{: id="page-hero-title" .page-hero-title }

Hybrid CHERI systems combine conventional pointers with explicit capabilities, supporting staged adoption while leaving some accesses outside capability protection.
{: .page-hero-summary }

Replacing every pointer and binary interface at once is rarely practical. CHERI therefore supports **hybrid systems**, where conventional address-based software coexists with capability-aware code.

Hybrid operation is a migration and experimentation tool. It is not the same security property as a pure-capability application.

## What “hybrid” can mean
{: id="what-hybrid-can-mean" }

The precise model depends on the architecture and application binary interface (ABI), but hybrid software commonly has:

- conventional language-visible pointers for ordinary C and C++ code
- explicit capability-qualified pointer types for selected objects or interfaces
- capability registers and instructions available to capability-aware code
- operating-system support for saving, mapping, and passing capabilities
- a conventional ABI preserved for much of the program

Legacy loads and stores may be authorised relative to a broader default capability or architectural context. They do not automatically carry a separate bound for each C object.

## Why use hybrid mode
{: id="why-use-hybrid-mode" }

Hybrid mode can help teams:

- introduce one capability-aware interface at a time
- build protected handles and service entry points
- experiment with compartment mechanisms
- run conventional libraries while porting selected components
- preserve a familiar ABI during architecture development
- measure and debug capability operations before wider conversion

It played an important role in the development of CheriBSD and the wider CHERI software model.

## A staged example
{: id="a-staged-example" }

Imagine a conventional service that receives network data. A first hybrid step might explicitly derive a bounded, read-only capability for one packet and pass it to a capability-aware parser.

The parser gains useful protection for accesses through that capability. Other conventional pointers in the service remain governed by the legacy model. If the parser converts back to a conventional pointer or receives a broad default authority, the effective boundary may weaken.

The security claim must therefore identify the protected path:

> The parser accesses packet data only through a read-only capability bounded to the packet.

It should not claim:

> The complete service has pure-capability memory safety.

## ABI compatibility
{: id="abi-compatibility" }

Keeping a conventional ABI reduces some migration costs. Existing structure layouts, pointer sizes, and call conventions may remain usable for code that does not expose capabilities.

Interfaces that pass capabilities still need capability-aware calling conventions, types, relocation support, and libraries. Mixing modes is platform-specific. A library built for one ABI cannot be assumed compatible with another because both run on the same processor.

## Security coverage
{: id="security-coverage" }

Hybrid mode provides strong enforcement where valid, tightly bounded capabilities are used. It may also support sealed objects and compartment entry mechanisms.

Coverage remains selective:

- ordinary pointers may retain broad address-space authority
- compiler-created object bounds may not cover conventional code
- a component may still hold ambient legacy authority
- conversions between pointer forms require careful review

This makes hybrid mode useful for transition but harder to describe with a single percentage or label.

## Planning a move to pure capability
{: id="planning-a-move-to-pure-capability" }

A hybrid prototype can identify capability-aware interfaces and porting issues. To gain broader protection:

1. build dependencies for the pure-capability ABI
2. replace pointer-integer assumptions
3. fix object-bound and allocator issues
4. validate foreign-function and assembly boundaries
5. run the complete test suite as pure-capability code
6. confirm that conventional fallback paths are no longer used

Some systems may retain hybrid components deliberately where required. Document that residual authority and contain it behind a narrow boundary.

## Key takeaway
{: id="key-takeaway" }

Hybrid CHERI makes incremental adoption possible, but capability protection is only present where the software actually uses capabilities. For broad C and C++ pointer protection, compare [Pure-Capability Systems](/build/technology/pure-capability-systems/).

## Where next
{: .where-next-title }

### [Pure-Capability Systems](/build/technology/pure-capability-systems/)
{: .where-next-card-title }





[A program cannot gain broad pointer protection if only a few selected pointers carry capability metadata.](/build/technology/pure-capability-systems/)
{: .where-next-summary }



[Continue](/build/technology/pure-capability-systems/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Capabilities](/build/technology/capabilities/)
{: .related-pages-item-title }





[A pointer bug becomes dangerous when changing a number changes authority.](/build/technology/capabilities/)
{: .related-pages-item-summary }



[Read this page](/build/technology/capabilities/)
{: .source-card-label }





### [Compartmentalisation](/build/technology/compartmentalisation/)
{: .related-pages-item-title }





[A media application may include millions of lines of code, dozens of libraries, and parsers for hostile input.](/build/technology/compartmentalisation/)
{: .related-pages-item-summary }



[Read this page](/build/technology/compartmentalisation/)
{: .source-card-label }
