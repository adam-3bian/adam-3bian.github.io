---
layout: page/standard
title: Temporal Memory Safety
summary: Temporal memory safety prevents references from being used after the object they refer to has ceased to exist.
permalink: /build/technology/temporal-memory-safety/
slug: build-technology-temporal-memory-safety
navigation:
  header:
    category: Build
    subcategory: Technology
related:
- type: page
  slug: build-technology-compartmentalisation
  relation: next_step
- type: page
  slug: build-technology-how-cheri-capabilities-work
  relation: related
- type: page
  slug: build-technology-spatial-memory-safety
  relation: related
---

## Overview

An object can be perfectly bounded and still be unsafe to access. If a program frees the object but retains a copy of its capability, that capability has become stale. Using it later is a **use-after-free** error.

The problem becomes particularly dangerous if the allocator reuses the same memory for a new object: the stale reference could now access data that did not exist when the capability was created.

Preventing this is **temporal memory safety**.

## Why bounds do not solve lifetime

Consider:

~~~
char *message = malloc(64);
char *stale = message;

free(message);
char *secret = malloc(64);

printf("%c\n", stale[0]);
~~~

The stale capability may still be valid, bounded to 64 bytes and permitted to read. If `secret` reuses the same memory, bounds alone cannot tell that the original object no longer exists.

This is the key difference between spatial and temporal safety:

Spatial: Is the access within the authorised range?
Temporal: Is the object that authorised the access still alive?

Or more simply:

> Spatial safety is about **where** you can access. Temporal safety is about **when** that access remains valid.

## Baseline CHERI behaviour

CHERI's capability [tags](/build/technology/cheri-capabilities/tags-and-validity/) prevent software from simply constructing arbitrary valid capabilities. But copying a valid capability creates another valid reference.

Freeing an object does not, by itself, invalidate every outstanding capability to that object.

CHERI provides important foundations for temporal safety, but temporal safety also requires the surrounding allocator, runtime or operating system to control what happens when memory is freed and reused.

## Approaches to temporal safety

CHERI systems can combine capabilities with different lifetime-management techniques.

### Quarantine

Freed memory is temporarily kept out of circulation before being reused. This reduces the opportunity for stale references to access a new object, although delaying reuse alone does not necessarily eliminate the problem.

### Revocation

Before memory is reused, the system identifies and invalidates capabilities referring to the retired memory. Capability tags help the system distinguish capabilities from ordinary data.

The cost and concurrency model need careful design.

### Epochs or generations

Allocations can be associated with a generation, colour or epoch. A stale reference associated with an older generation can then be rejected when memory is reused.

Implementations vary in where this metadata lives and how wraparound is handled.

### Allocator and architecture support

Allocators can organise and recycle memory in ways designed to work with capability bounds and revocation. Hardware support can also help make these mechanisms more efficient.

### Language-managed lifetime

Language mechanisms such as Rust ownership, garbage collection and reference counting can prevent many stale references at a higher level. CHERI can complement these mechanisms, particularly where native code, unsafe code or lower-level interfaces are involved.

## CHERIoT

CHERIoT integrates temporal memory safety into its hardware-software design. Its allocator and revocation mechanisms are designed to prevent stale capabilities from gaining access to reallocated objects while meeting embedded-system constraints.

This is a property of the CHERIoT system design, not automatically of every CHERI platform. Temporal-safety claims should therefore identify the mechanism or platform providing the guarantee.

## Compartment lifetimes

Lifetime matters across compartment boundaries too.

If one compartment gives another a capability to an object, the interface needs to define what happens when that object is destroyed.

Good interface design should make clear:

- who owns the object
- whether the recipient may retain the capability
- how destruction is communicated
- when the memory may be reused
- how outstanding references are invalidated

[Sealing](/build/technology/cheri-capabilities/sealing/) can make a capability opaque, but does not by itself invalidate every copy when the underlying object is destroyed.

## Evaluating a temporal-safety claim

Ask:

1. Which allocations and object types are covered?
2. What happens to capabilities in registers and memory?
3. Can memory be reused before revocation completes?
4. How are concurrent readers handled?
5. What is the cost in time, memory, and predictability?
6. What happens on exhaustion, crash, or reset?
7. Which tests or proofs support the claim?

## What temporal memory safety prevents

When implemented across the system, temporal memory safety can prevent stale references from accessing memory after the object they referred to has been destroyed or its storage reused.

This addresses vulnerabilities such as:

- use-after-free
- access through dangling pointers
- stale references reaching newly allocated objects
- retained capabilities remaining usable beyond an intended object lifetime

## What it does not prevent

Temporal memory safety does not by itself prevent:

- out-of-bounds accesses to live objects
- corruption within valid bounds
- incorrect ownership or application logic
- authentication or authorisation errors
- cryptographic or side-channel flaws

## Key takeaway

CHERI capabilities provide the authority and metadata needed to build strong temporal-safety mechanisms, but object lifetime is a system-level responsibility.

Bounds tell the processor where a capability may access. Temporal-safety mechanisms determine whether that capability should still be usable at all.
