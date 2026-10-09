---
title: Provenance
layout: source
permalink: /sources/cheri-alliance.github.io/build/technology/provenance/
---

1. Build
2. Technology
3. Provenance
{: .source-breadcrumbs }

# Provenance
{: id="page-hero-title" .page-hero-title }

Capability provenance preserves the connection between a usable pointer and the valid authority from which that pointer was derived.
{: .page-hero-summary }

Two pointers can contain the same address but not carry the same authority. One may have been derived from a valid capability for an allocation. The other may be an integer that happens to equal that address. CHERI preserves this distinction.

**Provenance** is the relationship between a pointer or capability and the authority from which it was validly derived. It answers “Why is this reference allowed to access that object?” as well as “Which number does it contain?”

## Authority follows derivation
{: id="authority-follows-derivation" }

Suppose an allocator holds a capability for a heap region and returns a smaller capability for one object:

~~~
Heap authority:       [--------------------------------]
Allocated object:             [------]
Derived field:                  [--]
~~~

The object capability is valid because it was derived within the heap capability’s range and permissions. The field capability carries no more authority than the object capability.

If code later learns the numeric address of another heap object, that number does not provide the tagged capability needed to access it.

## Provenance is not a visible history log
{: id="provenance-is-not-a-visible-history-log" }

CHERI implementations do not need to store a list of every capability operation. The protected tag, bounds, permissions, and architectural derivation rules preserve the security consequence of provenance: ordinary computation cannot manufacture new valid authority from raw data.

The term also appears in programming-language discussions, where compilers reason about which object a pointer may legally refer to. CHERI hardware and a C or C++ compiler must use a compatible pointer model so that optimisation does not contradict the architectural authority rules.

## Pointer-to-integer conversion
{: id="pointer-to-integer-conversion" }

Legacy code often converts pointers to integers for hashing, alignment, tagging, logging, or storage. On a conventional architecture, converting the integer back may recreate an address that the processor will use as a pointer.

On CHERI, the integer representation does not contain all capability metadata or the protected tag. A valid round trip may require retaining capability provenance through a platform-defined representation or deriving the new address from an existing capability.

The safe rule is:

- keep references as pointer or capability types
- use `uintptr_t` only for documented address-level operations
- do not expect an arbitrary integer to create authority
- do not serialise capabilities as portable addresses

Compiler diagnostics during a pure-capability port often reveal code that violated these rules implicitly.

## Why integer addresses are still useful
{: id="why-integer-addresses-are-still-useful" }

Addresses remain useful for logging, comparison under documented rules, file offsets, device protocols, and data structures that refer to positions rather than live memory authority.

The design improvement is to distinguish an **identifier or offset** from a **capability**. When software receives an offset from an untrusted source, it validates the value and derives a bounded capability from authority it already holds. The untrusted value chooses within an authorised region; it does not supply the authority itself.

## Provenance across interfaces
{: id="provenance-across-interfaces" }

When a capability crosses a function or compartment boundary, the receiver gains the authority it carries. Interface review should therefore ask:

- Which original capability was used to derive it?
- Were bounds narrowed to the intended object?
- Were unnecessary permissions removed?
- May the receiver retain or delegate it?
- Does the object remain alive for the full permitted use?

This makes authority flow reviewable in a way that a list of integer addresses is not.

## Important limits
{: id="important-limits" }

- Provenance does not prove that application logic chose the right object.
- A valid capability can be over-broad if its source authority was over-broad.
- Provenance and tags do not automatically revoke stale capabilities after `free`.
- Language rules, compiler implementation, application binary interface (ABI), and hardware behaviour must align.
- Devices and direct-memory-access (DMA) engines need system designs that preserve or mediate capability authority.

Provenance is why [Tags &amp; Validity](https://cheri-alliance.github.io/build/technology/tags-and-validity/) and monotonic derivation matter. Together they prevent “knowing the address” from becoming “owning the authority”.

## Where next
{: .where-next-title }

### [Sealing](https://cheri-alliance.github.io/build/technology/sealing/)
{: .where-next-card-title }





[Some authority should be carried without being directly exercised by its holder.](https://cheri-alliance.github.io/build/technology/sealing/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/build/technology/sealing/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Capabilities](https://cheri-alliance.github.io/build/technology/capabilities/)
{: .related-pages-item-title }





[A pointer bug becomes dangerous when changing a number changes authority.](https://cheri-alliance.github.io/build/technology/capabilities/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/technology/capabilities/)
{: .source-card-label }





### [Permissions](https://cheri-alliance.github.io/build/technology/permissions/)
{: .related-pages-item-title }





[A pointer can be inside the correct object and still perform the wrong operation.](https://cheri-alliance.github.io/build/technology/permissions/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/build/technology/permissions/)
{: .source-card-label }
