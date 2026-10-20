---
title: Bounds
permalink: /build/technology/cheri-capabilities/bounds/
where-next:
  url: /build/technology/cheri-capabilities/permissions/
related-pages:
- url: /build/technology/how-cheri-capabilities-work/
  description: How CHERI Capabilities work
  action: Read this page
summary: Capability bounds restrict a pointer to an authorised memory range, so mapped memory outside that range
  remains inaccessible through it.
---

A function receives a pointer to a 32-byte message. On a conventional processor, the pointer usually contains no enforceable record of that size. If the function reads byte 40, the hardware may allow it because the address still lies in a mapped page.

CHERI capability bounds let the pointer carry an authorised range. The processor checks that the entire memory access stays inside it.

## Base, top, and current address
{: id="base-top-and-current-address" }

A bounded capability has three useful positions:

- **Base:** the first address in the authorised range.
- **Top:** the address immediately after the authorised range.
- **Address:** the current location to which the capability points.

For a capability covering bytes `1000` through `1031`, the base is `1000` and the top is `1032`. A four-byte read at `1028` fits. A four-byte read at `1030` crosses the top and faults.

The current address can move within the representable rules of the capability, but changing it does not move the authorised base and top. Pointer arithmetic is therefore different from authority amplification.

## Deriving narrower bounds
{: id="deriving-narrower-bounds" }

Software commonly begins with a capability for a larger region and derives a smaller one:

~~~
Allocation capability:  [--------------------------]
Record capability:            [--------]
Field capability:                [--]
~~~

The record capability can be created from the allocation capability because its range is contained within the source authority. The field capability can be narrower again.

Unprivileged software cannot widen the field capability back to the allocation range unless it retained another capability with that wider authority.

## How compilers apply bounds
{: id="how-compilers-apply-bounds" }

In a pure-capability C or C++ environment, the compiler, linker, allocator, and operating system cooperate to create useful bounds for:

- stack allocations
- heap allocations
- global objects
- code and function entry points
- subobjects such as structure fields or array elements

The exact policy matters. Some application binary interfaces (ABIs) place bounds at allocation granularity by default. Stronger subobject bounds may catch more errors but can affect compatibility with code that derives an enclosing object from a field pointer.

A claim that “every pointer is bounded to exactly one C object” needs evidence from the compiler mode and platform.

## Representable bounds
{: id="representable-bounds" }

Many CHERI implementations compress capability metadata so that a capability fits in a practical register and memory size. Compression can make some large or poorly aligned ranges representable only with slightly wider bounds.

Allocators and compilers can use alignment and size choices to obtain exact bounds for common objects. For other objects, the architecture may round the representable range outwards. The capability still cannot exceed the authority of its source.

This is a precision issue, not permission to access the whole address space. Security analysis should nevertheless use the actual representable bounds, especially for large allocations or tightly packed sensitive objects.

## Bounds and C pointer rules
{: id="bounds-and-c-pointer-rules" }

C permits a pointer to be formed one past the end of an array for comparison and iteration, but dereferencing that pointer is invalid. A CHERI ABI must preserve useful language behaviour while preventing the out-of-range access.

Code that temporarily moves a pointer far outside an object and later moves it back is fragile. Depending on the architecture and compiler model, it may lose validity or fail to preserve the expected authority. Keep pointer arithmetic within documented language and platform rules.

## What bounds stop
{: id="what-bounds-stop" }

Correctly applied bounds can stop:

- buffer overreads and overwrites
- negative indexing before an object
- pointer arithmetic that reaches a neighbouring allocation
- some forms of stack and heap corruption
- a compartment reading shared memory outside the object it received

## What bounds do not stop
{: id="what-bounds-do-not-stop" }

- Access to the wrong value within an authorised object.
- A write that is in bounds but violates application logic.
- Use-after-free when a stale capability still has valid bounds and the memory has been reused.
- Access through a different, more powerful capability held elsewhere.
- Information leakage through side channels.

Bounds are therefore strongest when paired with narrow [Permissions](/build/technology/cheri-capabilities/permissions/), careful [Provenance](/build/technology/cheri-capabilities/provenance/), lifetime protection, and least-privilege compartment design.
