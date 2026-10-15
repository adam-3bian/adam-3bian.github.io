---
title: Tags & Validity
permalink: /build/technology/tags-and-validity/
summary: Protected tags let hardware distinguish authentic capabilities from ordinary data, even when both
  contain the same address bits.
image_url: null
updated_date: null
parent: /build/
next_page_url: /build/technology/bounds/
related:
  pages:
  - /build/technology/capabilities/
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides: []
  policies: []
navigation:
  header:
    category: Build
    subcategory: Technology
    parent: how-cheri-capabilities-work
    order: 1
---

# Tags & Validity

Suppose an attacker learns that a secret sits at address 0x40008000. On a conventional system, placing that number in a pointer may be enough to attempt an access. Bounds and page permissions may still stop it, but the address itself is generally treated as a potential pointer.

CHERI separates an address-shaped bit pattern from a valid capability. The mechanism that preserves this distinction is the tag.

## What the tag means

A capability tag records whether a register or suitably aligned memory location contains a valid capability. The tag is protected architectural state. It is not an ordinary bit that application code can set with an integer instruction.

For a memory access to use a value as a capability, the tag must be valid and the other checks, including bounds and permissions, must succeed.

Two values can therefore have the same visible address bits while only one has a valid tag. The tagged value carries authority derived from an existing capability. The untagged value is data.

## How tags are preserved

Capability-aware instructions load, store, and manipulate capabilities while preserving their protected metadata when the operation is valid. Supported capability copies can move a capability through registers and memory without losing its tag.

Ordinary data writes cannot manufacture a tag. If code overwrites part of a stored capability using an incompatible byte or integer store, the architecture clears the associated tag. Loading those bytes later may reproduce the bit pattern, but not valid authority.

This is why copying a capability as an arbitrary serialised byte string is not the same as transferring the capability. Capability-preserving memory operations have alignment, size, address-space, and platform rules that software must follow.

## Tags and memory

Implementations associate tags with capability-sized, aligned memory locations or with an architecture-defined memory granule. The tags are carried through the memory hierarchy alongside data and protected from ordinary modification.

This has system-wide consequences. Caches, context switching, debuggers, direct memory access (DMA), virtual machines, and memory-copy routines must handle capability state correctly. A complete CHERI system is therefore more than new arithmetic instructions in the processor core.

## When a tag becomes invalid

A tag may be cleared when software:

- writes ordinary data over all or part of a stored capability
- creates bounds or an address that the architecture cannot represent under the requested operation
- performs an operation whose defined result is not a valid capability
- receives memory that was cleared or initialised as ordinary data

Exact rules differ between CHERI architectures. Developers should use the target specification and compiler interfaces rather than infer tag behaviour from one implementation.

## Tags are not revocation

A valid tag shows that a value is an authentic capability. It does not show that the object is still logically alive.

If an allocator frees an object, copies of its capability may remain tagged. If the same memory is reused, those stale capabilities need a temporal-safety mechanism to prevent access to the new object. CHERIoT and other systems add allocator or revocation support for this purpose.

The distinction is:

- Tag validity: Was this value created and preserved as a capability?
- Object lifetime: Is the authority still safe to use for the intended object?

## Tags are not cryptographic signatures

Tags are architectural protection state, not public-key signatures or message authentication codes. They are designed for efficient local enforcement by the processor and memory system. They do not make a capability portable across arbitrary files, networks, or machines.

## Why tags matter

Bounds and permissions would be weak if software could copy their encoded bits into a new value and mark it valid. Tags close that route. They let the processor enforce an architectural rule: authority must descend from authority already present in the system.

That rule underpins Provenance and allows capabilities to be used as reliable references between Compartments.
