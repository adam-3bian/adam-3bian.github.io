---
title: Spatial Memory Safety
permalink: /build/technology/spatial-memory-safety/
where-next:
  url: /build/technology/temporal-memory-safety/
related-pages:
- url: /build/technology/capabilities/
  description: A pointer bug becomes dangerous when changing a number changes authority.
  action: Read this page
- url: /build/technology/sealing/
  description: Some authority should be carried without being directly exercised by its holder.
  action: Read this page
---

1. Build
2. Technology
3. Spatial Memory Safety
{: .source-breadcrumbs }

# Spatial Memory Safety
{: id="page-hero-title" .page-hero-title }

Spatial memory safety stops code accessing before or beyond the memory object authorised by a capability.
{: .page-hero-summary }

A program allocates 64 bytes for a network message and accidentally reads byte 80. The allocation still exists, but the access is outside the space assigned to that object. This is a **spatial memory-safety violation**.

Spatial errors include buffer overflows, buffer overreads, negative indexing, and pointer arithmetic that crosses from one object into another.

## Why virtual memory is not enough
{: id="why-virtual-memory-is-not-enough" }

Conventional page tables control access to memory pages, commonly several kilobytes in size. One page can contain many heap allocations, stack variables, and library objects.

If an invalid access stays within a mapped page, the processor sees no page fault. It cannot infer the smaller object boundary intended by the source program.

CHERI adds capability checks before or alongside virtual-address translation. Page tables still isolate address spaces. Capability bounds protect much smaller ranges within them.

## Object-bounded access
{: id="object-bounded-access" }

In a pure-capability environment, a pointer used for memory access carries bounds and permissions. When code loads or stores through it, the processor checks the complete access against the capability’s authorised range.

For an allocation covering `[base, top)`, an access is permitted only when every byte lies at or above `base` and below `top`.

~~~
Capability bounds:  [ valid object bytes        )
Valid 4-byte load:      [----]
Invalid 4-byte load:                         [----]
                                               ^ crosses top
~~~

The invalid operation raises a capability exception rather than reading neighbouring memory.

## Where bounds come from
{: id="where-bounds-come-from" }

Several layers create and refine bounds:

- the loader bounds code and global data
- the operating system bounds mapped regions and process authority
- the allocator bounds heap allocations
- the compiler bounds stack objects and, under selected policies, subobjects
- application code derives narrower capabilities for interfaces

Coverage depends on all of these layers. A pure-capability application binary interface (ABI) gives broad pointer coverage, but the precision of each bound still depends on object layout, compiler policy, representability, and source semantics.

## Example: protecting a parser
{: id="example-protecting-a-parser" }

~~~
int parse_header(const unsigned char *packet, size_t length) {
    if (length < 4) {
        return -1;
    }

    return packet[0] << 8 | packet[1];
}
~~~

The length check is still required for correct logic and portable C. On a CHERI system, passing a capability bounded to the actual packet adds hardware enforcement. If a later edit mistakenly reads `packet[length + 1]`, the capability check can stop the access even when the neighbouring memory page is mapped.

This illustrates defence in depth. Source checks express protocol rules. Capability bounds enforce memory authority.

## Subobjects and compatibility
{: id="subobjects-and-compatibility" }

A structure may contain several fields inside one allocation. Bounding a pointer to one field can stop access to neighbouring fields, which is useful for security. Some established C patterns, however, derive a pointer to an enclosing structure from a field pointer.

CHERI compilers therefore expose documented policies for subobject bounds and language compatibility. Security claims should state whether pointers are bounded to allocations, complete objects, or selected subobjects.

## What spatial safety prevents
{: id="what-spatial-safety-prevents" }

Correctly configured capability bounds can prevent or contain:

- stack and heap buffer overflows
- reads past string or array storage
- writes into adjacent object metadata
- crossing a compartment’s shared-buffer boundary
- many pointer-corruption exploits that depend on arbitrary nearby access

## What it does not prevent
{: id="what-it-does-not-prevent" }

- Use-after-free when the stale capability remains usable.
- In-bounds corruption of a field that code is authorised to write.
- Access through another capability with wider bounds.
- Integer overflow before an allocation or bounds calculation, unless separately checked.
- Logic, authentication, cryptographic, and side-channel flaws.

Spatial memory safety removes a major class of unsafe access, but it is one property. Continue with [Temporal Memory Safety](/build/technology/temporal-memory-safety/) to understand why object lifetime needs additional mechanisms.

## Where next
{: .where-next-title }

### [Temporal Memory Safety](/build/technology/temporal-memory-safety/)
{: .where-next-card-title }





[A pointer can remain inside the correct bounds and still be unsafe.](/build/technology/temporal-memory-safety/)
{: .where-next-summary }



[Continue](/build/technology/temporal-memory-safety/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Capabilities](/build/technology/capabilities/)
{: .related-pages-item-title }





[A pointer bug becomes dangerous when changing a number changes authority.](/build/technology/capabilities/)
{: .related-pages-item-summary }



[Read this page](/build/technology/capabilities/)
{: .source-card-label }





### [Sealing](/build/technology/sealing/)
{: .related-pages-item-title }





[Some authority should be carried without being directly exercised by its holder.](/build/technology/sealing/)
{: .related-pages-item-summary }



[Read this page](/build/technology/sealing/)
{: .source-card-label }
