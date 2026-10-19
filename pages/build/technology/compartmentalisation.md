---
title: Compartmentalisation
permalink: /build/technology/compartmentalisation/
where-next:
  url: /build/technology/hybrid-systems/
related-pages:
- url: /build/technology/how-cheri-capabilities-work/
  description: CHERI capabilities explained.
  action: Read this page
- url: /build/technology/temporal-memory-safety/
  description: A pointer can remain inside the correct bounds and still be unsafe.
  action: Read this page
---

1. Build
2. Technology
3. Compartmentalisation
{: .source-breadcrumbs }

# Compartmentalisation
{: id="page-hero-title" .page-hero-title }

CHERI compartmentalisation contains bugs and attacks by limiting what each component can access.
{: .page-hero-summary }

Consider a network parser. It may need to read one packet and return a structured result. It does not need access to account credentials, update controls or every object in the application.

Yet conventional software often places many libraries and components within the same process, where they share an address space and potentially much broader authority than they need.

**Compartmentalisation** divides software into smaller protection domains. Each compartment receives only the capabilities required for its job.

## From crash boundary to authority boundary
{: id="from-crash-boundary-to-authority-boundary" }

Processes already provide strong and useful isolation and are often the right boundary between applications or services.

Within a large process, however, many libraries and subsystems may share memory. Moving every small component into a separate process can introduce additional communication, scheduling and memory overhead.

CHERI capabilities allow protection at a finer granularity. Compartments can exist within the same virtual address space while having access to very different sets of memory and services.

> A compartment is defined by the capabilities it can access, not simply by which addresses exist in its address space.

## A minimal parser compartment
{: id="a-minimal-parser-compartment" }

A parser might receive:

- a read-only capability bounded to one packet
- a writable capability bounded to one output record
- a sealed capability for a logging service
- an entry capability for returning to the caller

It should not receive:

- access to the application's key store
- writable access to unrelated heap objects
- unrestricted filesystem or network access
- a broad capability from which those authorities could be derived

If a bug allows an attacker to take control of the parser, the attacker gains only the authority available to that compartment, rather than automatically gaining the authority of the whole application.

This is the **principle of least privilege** applied within software.

## Crossing compartment boundaries
{: id="crossing-compartment-boundaries" }

Code sometimes needs to call a service in another compartment. That transition needs to ensure that the destination receives only the authority it is supposed to receive and that control can safely return afterwards.

CHERI provides architectural mechanisms, including sealing and sentry capabilities, that can be used to build these controlled transitions. The complete mechanism is provided by the surrounding operating system, runtime or platform.

Different CHERI systems implement compartments differently. CHERIoT integrates compartmentalisation into its firmware environment and RTOS, while CheriBSD supports CHERI-based isolation models for larger systems.

The important principle is the same: crossing a compartment boundary should not implicitly transfer all of the caller's authority.

## Least privilege and delegation
{: id="least-privilege-and-delegation" }

Capabilities make delegation explicit. A caller can derive a narrower capability and pass it to the callee without transferring all of its own authority.

For example:

- an image decoder can receive one image rather than the whole media library
- a driver can receive access to one device queue rather than all physical memory
- a plugin can receive one service interface rather than the host's internal objects
- a cryptographic service can receive a key handle rather than exposing key material unnecessarily

This makes the flow of authority visible in software interfaces and allows developers to design APIs around what a component actually needs.

Care is still required when capabilities can be retained or passed onwards. Compartment interfaces should define who may keep or delegate each capability and for how long.

## Memory safety and compartmentalisation are different
{: id="memory-safety-and-compartmentalisation-are-different" }

Memory safety and compartmentalisation solve related but different problems.

- Spatial safety: Where may this pointer access?
- Temporal safety: Is the object it refers to still alive?
- Compartmentalisation: What objects and services may this component access at all?

A component can be memory-safe and still misuse a powerful capability because of a logic error.

Conversely, a memory-safety vulnerability inside a tightly restricted compartment may have much less impact because the compromised code has limited authority.

Strong systems therefore combine both:

- memory safety limits how authorised memory can be accessed
- compartmentalisation limits how much memory and functionality a component is authorised to access in the first place

## Designing useful compartments
{: id="designing-useful-compartments" }

A compartment is only as secure as the authority it receives. When defining a boundary, consider:

- Shared writable memory can become a communication channel and a source of confused ownership
- Large, frequent interfaces increase transition cost and policy complexity
- Availability depends on how the system recovers from a compartment fault
- Side channels may cross capability boundaries
- A trusted switcher or runtime becomes part of the trusted computing base

## Evidence for a useful boundary
{: id="evidence-for-a-useful-boundary" }

A compartment claim should include:

- assets and threats addressed
- an authority record for initial and passed capabilities
- interface and lifetime definitions
- negative tests for denied operations
- transition and fault-recovery behaviour
- performance on the intended platform
- the trusted components that enforce the boundary

See [Build Compartments](/guides/build-compartments/) for a practical workflow and [Sealing](/build/technology/cheri-capabilities/sealing/) for one of the underlying mechanisms.

## Key takeaway

CHERI compartmentalisation turns least privilege into something the hardware can help enforce.

Instead of trusting every component in a process with the application's full authority, developers can give each component only the capabilities it needs.

If that component fails or is compromised, the capabilities it holds define what it can reach, helping contain the impact.



## Where next
{: .where-next-title }

### [Hybrid Systems](/build/technology/hybrid-systems/)
{: .where-next-card-title }





[Replacing every pointer in a large software stack at once is rarely practical.](/build/technology/hybrid-systems/)
{: .where-next-summary }



[Continue](/build/technology/hybrid-systems/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Capabilities](/build/technology/capabilities/)
{: .related-pages-item-title }





[A pointer bug becomes dangerous when changing a number changes authority.](/build/technology/capabilities/)
{: .related-pages-item-summary }



[Read this page](/build/technology/capabilities/)
{: .source-card-label }





### [Temporal Memory Safety](/build/technology/temporal-memory-safety/)
{: .related-pages-item-title }





[A pointer can remain inside the correct bounds and still be unsafe.](/build/technology/temporal-memory-safety/)
{: .related-pages-item-summary }



[Read this page](/build/technology/temporal-memory-safety/)
{: .source-card-label }
