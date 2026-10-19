---
title: How CHERI Capabilities work
permalink: /build/technology/how-cheri-capabilities-work/
# sections:
# - presentation: action
#   headings: [what-a-capability-contains]
# - presentation: action
#   headings: [tags-is-this-a-real-capability]
# - presentation: action
#   headings: [bounds-where-can-it-access]
# - presentation: action
#   headings: [permissions-what-can-it-do]
# - presentation: action
#   headings: [provenance-where-did-its-authority-come-from]
# - presentation: action
#   headings: [sealing-can-it-be-used-directly]
where-next:
  url: /build/technology/tags-and-validity/
---

1. Build
2. Technology
3. CHERI Capabilities
{: .source-breadcrumbs }

# How CHERI Capabilities work
{: id="page-hero-title" .page-hero-title }

Pointers tell you where. Capabilities define what you can do.
{: .page-hero-summary }

A conventional pointer is essentially an address. A **CHERI capability** adds hardware-protected information describing the authority that goes with that address: where it can access, what operations it can perform, and whether the reference is valid.

This makes memory protection part of the architecture rather than relying only on software behaving correctly.

## What does a capability contain?
{: id="what-a-capability-contains" }

A capability contains:

- **Address:** location used by a load, store, or instruction fetch
- **Bounds:** the memory range it may access
- **Permissions:** what it may do, such as read, write or execute
- **Tag:** whether it is a valid, authentic capability
- **Sealing state and type:** information used for protected objects and entry points

The exact representation differs between CHERI architectures, but the principle is the same: ordinary software cannot modify this protected metadata to give itself more authority.

[Learn more about capabilities](/build/technology/cheri-capabilities/capabilities/) →

===== TBD Add capability picture =====

## Five concepts to understand

### ✅ Tags: is this a real capability?
{: id="tags-is-this-a-real-capability" }

Knowing an address is not enough to access it.

CHERI associates capabilities with a protected tag, managed exclusively in hardware. Software cannot manufacture a valid capability simply by constructing an integer containing the right address.

If a capability is corrupted using ordinary data operations, its tag is automatically cleared and it can no longer be used as valid authority.

Developer takeaway: don't assume you can serialise a capability as bytes or reconstruct one from an integer.

[Learn more about tags and validity](/build/technology/cheri-capabilities/tags-and-validity/) →

### ↔️ Bounds: where can it access?
{: id="bounds-where-can-it-access" }

Capabilities contain enforceable memory bounds.

~~~
Allocation capability:  [--------------------------]
Record capability:            [--------]
Field capability:                [--]
~~~

Software can derive a narrower capability from a broader one, but cannot widen it beyond the authority from which it was derived.

An access outside the permitted range faults even if that memory is otherwise mapped into the process.

Developer takeaway: an out-of-bounds pointer is no longer just a software bug that may corrupt adjacent memory. The hardware enforces boundaries.

[Learn more about bounds](/build/technology/cheri-capabilities/bounds/) →

### 🔐 Permissions: what can it do?
{: id="permissions-what-can-it-do" }

Capabilities can independently control operations such as reading, writing and executing, with additional permissions depending on the architecture.

For example:

~~~
Original:  read + write + load-capability + store-capability
Derived:   read
~~~

Once a permission has been removed, the derived capability cannot restore it by itself.

Developer takeaway: pass the authority a component actually needs, rather than giving every pointer equivalent access.

[Learn more about permissions](/build/technology/cheri-capabilities/permissions/) →

### ↪️ Provenance: where did its authority come from?
{: id="provenance-where-did-its-authority-come-from" }

Two values can contain the same address without carrying the same authority.

A valid capability must be derived from existing authority. An integer that happens to contain the same address does not become an equivalent capability.

Developer takeaway: keep live references as capabilities.

[Learn more about provenance](/build/technology/cheri-capabilities/provenance/) →

### 🔒 Sealing: can it be used directly?
{: id="sealing-can-it-be-used-directly" }

A capability can be sealed, turning it into a protected token that ordinary code cannot dereference directly.

This is useful for:

- object handles
- protected objects
- service references
- controlled compartment entry points

A caller can hold a reference to a service without automatically gaining access to its internal state.

Developer takeaway: sealing helps turn capabilities into protected interfaces, not just protected memory pointers.

[Learn more about sealing](/build/technology/cheri-capabilities/sealing/) →

## Authority only gets narrower

One of the most important CHERI principles is simple:

> Code can reduce the authority of a capability, but ordinary derivation cannot give it more authority than its source.

A component can:

- narrow its bounds
- remove permissions
- seal it
- pass only selected capabilities onwards

This makes least privilege practical inside an application.

## What does this mean for your code?

When passing a capability across an interface, ask:

| --- | --- |
| Where? | Is it bounded to only the memory the recipient needs? |
| What? | Does it have only the required permissions? |
| Where from? | Was it derived from appropriate authority? |
| How? |  Should the recipient access the object directly, or receive a sealed handle? |
| How long? | Will the referenced object remain valid while that capability can still be used? |

That is the shift CHERI introduces: treat pointers as authority, not simply addresses.

## What CHERI capabilities don't solve

Capabilities are powerful, but they are not a complete security policy.

They do not automatically prevent:

- logic errors inside authorised memory
- excessive authority if software deliberately provides broad capabilities
- use-after-free without an appropriate temporal-safety mechanism
- access through another capability that still has broader authority
- disclosure of data that the caller is legitimately authorised to read

## The developer takeaway

You don't need to think of CHERI as an entirely new memory model.

Start with one idea:

> A pointer becomes a capability: an address plus hardware-enforced authority.

- Tags establish validity
- Bounds define where
- Permissions define what
- Provenance defines where the authority came from
- Sealing controls how it can be used

Together, they give developers a practical way to build software around explicit, least-privilege access to memory and services.

