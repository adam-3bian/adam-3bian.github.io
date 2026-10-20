---
layout: page
title: Spatial Memory Safety
summary: Spatial memory safety prevents code from accessing memory outside the bounds authorised by a capability.
permalink: /build/technology/spatial-memory-safety/
slug: build-technology-spatial-memory-safety
navigation:
  header:
    category: Build
    subcategory: Technology
related:
- type: page
  slug: build-technology-temporal-memory-safety
  relation: next_step
- type: page
  slug: build-technology-how-cheri-capabilities-work
  relation: related
- type: page
  slug: build-technology-cheri-capabilities-sealing
  relation: related
---

## Overview

For example, a program allocates 64 bytes for a network message but accidentally reads byte 80. The allocation still exists, but the access falls outside the memory assigned to that object. This is a **spatial memory-safety violation**.

Typical spatial errors include buffer overflows, buffer overreads, negative indexing, and pointer arithmetic that crosses from one object into another.

## Why virtual memory is not enough

Conventional virtual memory controls access at page granularity, typically several kilobytes in size and covering many heap allocations, stack variables, or other objects.

An invalid access that remains inside a mapped page therefore may not cause a page fault because the processor does not know the boundaries of the individual objects within it.

> Page tables protect pages. CHERI capabilities protect objects within those pages.

CHERI adds fine-grain capability checks to memory access while virtual memory continues to provide address-space isolation.

## Object-bounded access

In a pure-capability environment, a pointer used for memory access carries bounds and permissions. When code loads or stores through it, the processor checks the complete access against the capability’s authorised range.

For an allocation covering `[base, top)`, every access must fall within those bounds.

~~~
Capability bounds:  [ valid object bytes        )
Valid 4-byte load:      [----]
Invalid 4-byte load:                         [----]
                                               ^ crosses top
~~~

An out-of-bounds operation raises a capability exception instead of accessing neighbouring memory.

## Where do the bounds come from?

Bounds can be established and refined at several levels:

- the loader bounds code and global data
- the operating system bounds mapped regions and process authority
- the allocator bounds heap allocations
- the compiler bounds stack objects and, depending on policy, subobjects
- application code can derive narrower capabilities for particular interfaces

A pure-capability ABI provides broad pointer coverage, while the exact bounds depend on factors such as object layout, compiler policy, representability and source semantics.

## Example: protecting a parser

~~~
int parse_header(const unsigned char *packet, size_t length) {
    if (length < 4) {
        return -1;
    }

    return packet[0] << 8 | packet[1];
}
~~~

The length check is still required for correct logic and portable C.

On a CHERI system, passing a capability bounded to the actual packet adds hardware enforcement. If a later edit mistakenly reads `packet[length + 1]`, the capability check can stop the access even when the neighbouring memory page is mapped.

This is **defence in depth**: source-level checks express the application's rules, while capability bounds enforce the memory authority available to the code.

## Subobjects and compatibility

A structure can contain several fields within one allocation. Bounding a pointer to a particular field can prevent access to neighbouring fields, providing stronger isolation.

Some existing C idioms, however, derive a pointer to an enclosing structure from a pointer to one of its fields. CHERI toolchains therefore provide policies governing subobject bounds and compatibility with existing C code.

When describing spatial-safety guarantees, it is important to distinguish between bounds covering allocations, complete objects, or individual subobjects.

## What spatial safety prevents

Correctly configured capability bounds can prevent or contain:

- stack and heap buffer overflows
- reads beyond string or array storage
- writes into adjacent object metadata
- access beyond an authorised compartment’s shared-buffer
- many pointer-corruption attacks that depend on accessing nearby memory

## What it does not prevent

Spatial memory safety does not by itself prevent:

- use-after-free when a stale capability remains valid
- corruption occurring within valid bounds
- access using another capability with wider authority
- integer overflow occurring before allocation or bounds calculation
- logic, authentication, cryptographic or side-channel flaws

Spatial memory safety eliminates an important class of unsafe memory access, but object lifetime is a separate problem. Continue with [Temporal Memory Safety](/build/technology/temporal-memory-safety/) to understand how CHERI-based systems can address access to objects after their lifetime has ended.
