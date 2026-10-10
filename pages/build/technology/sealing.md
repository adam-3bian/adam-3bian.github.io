---
title: Sealing
permalink: /build/technology/sealing/
where-next:
  url: /build/technology/spatial-memory-safety/
related-pages:
- url: /build/technology/capabilities/
  description: A pointer bug becomes dangerous when changing a number changes authority.
  action: Read this page
- url: /build/technology/provenance/
  description: An explanation of how capability authority is derived and why arbitrary integers are not equivalent to valid capabilities.
  action: Read this page
---

1. Build
2. Technology
3. Sealing
{: .source-breadcrumbs }

# Sealing
{: id="page-hero-title" .page-hero-title }

Sealing turns a capability into a protected, non-dereferenceable token that can support opaque objects and controlled compartment entry points.
{: .page-hero-summary }

Passing a direct capability for an object gives the receiver whatever read, write, or execute authority that capability contains. Sometimes an interface should let a caller refer to an object without accessing its representation.

CHERI **sealing** supports that pattern. A sealed capability is a protected token that ordinary code cannot dereference or modify as an unsealed memory capability.

## An opaque handle enforced by hardware
{: id="an-opaque-handle-enforced-by-hardware" }

An application programming interface often exposes an opaque handle:

~~~
session_t *session;
~~~

Conventional C relies on type discipline and hidden structure definitions to discourage callers from inspecting the object. A memory error can still bypass that convention if the process holds a usable address.

A sealed capability can represent the session while preventing direct loads and stores through that capability. Code with the appropriate unsealing authority can recover and validate the underlying object inside the service boundary.

## Object types
{: id="object-types" }

Sealing associates a capability with an architecture-defined object type. The type helps determine which unsealing authority or protected entry mechanism can use it.

The exact encoding and instruction sequence differ between CHERI architectures. The general model is:

1. A trusted component creates a capability for an object or entry point.
2. It seals that capability with controlled sealing authority.
3. It passes the sealed token to less-trusted code.
4. The recipient can store, copy, and return the token but cannot dereference it directly.
5. A trusted service validates and unseals it, or the architecture uses it through a defined entry mechanism.

## Protected entry points
{: id="protected-entry-points" }

Sealing can help create a call gate into a compartment. The caller receives authority to enter approved code, but not a general executable or writable capability for the compartment’s internals.

Some CHERI architectures provide **sentry** capabilities or related sealed entry forms. A sentry may be usable for a controlled jump while remaining unavailable for arbitrary data access. A trusted switcher, runtime, or operating system can combine this with a protected stack and register sanitisation to change compartments safely.

Use the platform’s supported compartment calling convention and runtime rather than assembling a boundary from sealing instructions alone. A secure transition must handle all authority in registers, memory, stack state, return paths, faults, and concurrency.

## Sealed capabilities as tokens
{: id="sealed-capabilities-as-tokens" }

Sealed capabilities are useful for:

- object handles
- service references
- protected callbacks
- compartment entry points
- trusted-stack records
- allocator or runtime metadata
- representing authority that may be invoked but not inspected directly

CHERIoT, for example, uses sealing as part of several software patterns, including protected objects and cross-compartment mechanisms.

## Sealing is not encryption
{: id="sealing-is-not-encryption" }

Sealing does not hide the ordinary bytes of an object from every other capability. It prevents use through the sealed capability itself. If the receiver also holds an unsealed read capability for the same memory, sealing one alias does not remove that other authority.

Likewise, sealing does not authenticate a token across arbitrary machines or persistent storage. Capability tags and types are architectural state within a suitable CHERI system.

## Protect sealing authority
{: id="protect-sealing-authority" }

The ability to seal or unseal a type is itself authority. If every component receives a broad sealing capability, sealed interfaces lose their value.

Apply least privilege:

- give each service only the sealing range or type authority it needs
- keep unsealing inside the trusted implementation
- validate object state after unsealing
- define lifetime and revocation for sealed handles
- prevent callers from substituting tokens of an unexpected type

## Important limits
{: id="important-limits" }

- Sealing does not provide temporal safety by itself. A sealed handle may still refer to an object whose lifetime ended.
- A sealed entry point is only one part of a safe compartment transition.
- Architecture-specific type widths and sentry behaviour differ.
- Copying a token delegates its authority unless the surrounding design prevents or tracks delegation.

Sealing turns capabilities into protected interface elements. It becomes most useful within a complete [Compartmentalisation](/build/technology/compartmentalisation/) model with explicit authority and lifecycle rules.

## Where next
{: .where-next-title }

### [Spatial Memory Safety](/build/technology/spatial-memory-safety/)
{: .where-next-card-title }





[A program allocates eight bytes and writes sixteen.](/build/technology/spatial-memory-safety/)
{: .where-next-summary }



[Continue](/build/technology/spatial-memory-safety/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Capabilities](/build/technology/capabilities/)
{: .related-pages-item-title }





[A pointer bug becomes dangerous when changing a number changes authority.](/build/technology/capabilities/)
{: .related-pages-item-summary }



[Read this page](/build/technology/capabilities/)
{: .source-card-label }





### [Provenance](/build/technology/provenance/)
{: .related-pages-item-title }





[An explanation of how capability authority is derived and why arbitrary integers are not equivalent to valid capabilities.](/build/technology/provenance/)
{: .related-pages-item-summary }



[Read this page](/build/technology/provenance/)
{: .source-card-label }
