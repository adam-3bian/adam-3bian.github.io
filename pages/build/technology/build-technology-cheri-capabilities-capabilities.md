---
layout: page
title: Capabilities
summary: A CHERI capability is a hardware-protected reference that combines where an object is with the authority to access it.
permalink: /build/technology/cheri-capabilities/capabilities/
slug: build-technology-cheri-capabilities-capabilities
navigation:
  header:
    category: Build
    subcategory: Technology
related:
- type: page
  slug: build-technology-cheri-capabilities-tags-and-validity
  relation: next_step
---

## Overview

A conventional pointer tells the processor where to access memory. It usually does not tell the processor which object the programmer intended, how large that object is, or whether the pointer should be allowed to write.

A CHERI capability carries that missing authority information in a form the architecture can protect and enforce.

## What a capability contains

A memory capability conceptually combines:

- **Address:** the current location used by a load, store, or instruction fetch.
- **Bounds:** the range of addresses the capability may access.
- **Permissions:** allowed operations, such as reading, writing, or executing.
- **Tag:** protected validity state showing that the value is an authentic capability.
- **Sealing state and type:** information used for protected objects and entry points.

Implementations may encode this metadata in different ways. The programming model matters more than the physical bit layout: ordinary software cannot edit protected fields to give itself more authority.

## An access card, not a street address

Imagine two values that both contain the address of a server room. One is a note with the room number. The other is an access card that opens only that room between defined boundaries.

Knowing the room number does not create a valid card. In the same way, knowing a memory address does not let software invent a tagged capability for that address.

This distinction is central to CHERI. The address answers “where?” The rest of the capability answers “with what authority?”

## How capabilities are created

Software normally receives capabilities from an authority it already holds. An operating system may give a process capabilities for its code, stack, and mapped data. An allocator may derive a bounded capability for one allocation. A caller may pass a read-only capability for one input buffer to a callee.

Authority can be reduced by:

- narrowing the bounds
- removing permissions
- sealing a capability for protected transfer
- passing only selected capabilities to another component

These operations follow a monotonic principle: unprivileged code can derive less authority, but it cannot use derivation to create more authority than its source capability allowed.

## What the processor checks

When an instruction uses a capability, the architecture checks relevant conditions including:

1. Is the capability tagged as valid?
2. Is it unsealed and usable for this operation?
3. Does it carry the required permission?
4. Does the complete access fall within its bounds?

If a check fails, the processor raises an exception instead of completing the access. The operating system or runtime decides how that fault affects the process or compartment.

## A C example

~~~
int readings[4] = {10, 20, 30, 40};
int *selected = &readings[1];
~~~

In a pure-capability C environment, `selected` is represented using a capability. The exact bounds depend on the compiler’s subobject-bounds policy and application binary interface (ABI). It may be bounded to the selected element, the whole array, or another documented enclosing object.

The important point is that the hardware has an enforceable range. If code tries to dereference an address outside that range, mapped memory elsewhere in the process is not enough to authorise the access.

## Capabilities are used for more than memory

A capability can also act as a protected reference to a service or software object. Sealed capabilities and controlled entry mechanisms let a system expose an operation without revealing or granting direct access to its internal state.

This supports compartmentalisation. A component can receive capabilities for one input buffer, one output queue, and one log service without receiving authority for the rest of the application.

## Important limits

- A capability enforces the authority it carries. If software is given broad bounds and permissions, the hardware will permit broad access.
- Capability bounds provide spatial protection. Reusing memory after it is freed requires additional temporal-safety mechanisms.
- A legacy binary does not automatically use capabilities because the processor supports CHERI.
- Logic errors remain possible. Code can write the wrong valid value to the right authorised object.
- Capability metadata is not encryption. It controls access but does not conceal data that code is authorised to read.

Capabilities are the common foundation for [Tags &amp; Validity](/build/technology/cheri-capabilities/tags-and-validity/), [Bounds](/build/technology/cheri-capabilities/bounds/), [Permissions](/build/technology/cheri-capabilities/permissions/), and [Compartmentalisation](/build/technology/compartmentalisation/).
