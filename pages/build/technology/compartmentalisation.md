---
title: Compartmentalisation
permalink: /build/technology/compartmentalisation/
where-next:
  url: /build/technology/hybrid-systems/
related-pages:
- url: /build/technology/capabilities/
  description: A pointer bug becomes dangerous when changing a number changes authority.
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

CHERI compartmentalisation limits each software component to explicitly granted memory and services, containing faults inside smaller trust boundaries.
{: .page-hero-summary }

A network parser may need to read one packet and return a structured result. It does not need access to account credentials, update controls, or every object in the process. Yet conventional software often gives all code in a process the same address space and broadly similar authority.

**Compartmentalisation** divides that software into smaller protection domains. Each compartment receives only the capabilities needed for its task.

## From crash boundary to authority boundary
{: id="from-crash-boundary-to-authority-boundary" }

Processes already provide useful isolation. They are often the right boundary between applications or services. Inside a large process, however, many libraries and subsystems share memory. Moving every small component into its own process can add communication, scheduling, memory, and deployment cost.

CHERI enables finer boundaries because capabilities can restrict memory and services at object granularity. A compartment can remain in the same virtual address space while lacking a valid capability for most of it.

The security boundary is therefore not “which addresses exist?” but “which tagged capabilities can this component use?”

## A minimal parser compartment
{: id="a-minimal-parser-compartment" }

The parser might receive:

- a read-only capability bounded to one packet
- a writable capability bounded to one output record
- a sealed capability for a logging service
- an entry capability for returning to the caller

It should not receive:

- a capability for the application’s key store
- writable authority for unrelated heap objects
- general access to the filesystem or network
- a broad capability from which those authorities can be derived

If a memory bug gives an attacker control of the parser, the attacker inherits this limited set rather than the authority of the entire process.

## Compartment transitions
{: id="compartment-transitions" }

A secure call between compartments may need to:

1. enter only at an approved entry point
2. switch to a protected stack
3. remove caller capabilities that are not explicit arguments
4. establish the callee’s code and data authority
5. preserve a protected return path
6. handle faults without exposing privileged state

CHERI sealing and sentry capabilities provide architectural building blocks. A trusted switcher, operating system, or real-time operating system (RTOS) implements the complete transition model.

Different platforms choose different designs. CHERIoT integrates compartments into firmware and its RTOS. CheriBSD supports multiple process and in-process compartment models. Other systems may use capability-aware kernels, language runtimes, or hypervisors.

## Least privilege and delegation
{: id="least-privilege-and-delegation" }

Capabilities make delegation explicit. A caller can derive a narrower capability and pass it to the callee without transferring all of its own authority.

This supports patterns such as:

- giving a decoder one image rather than the whole media library
- giving a driver access to one device queue rather than all physical memory
- giving a plugin one service interface rather than the host’s internal objects
- giving a crypto service a key handle rather than raw key bytes

The receiver may be able to delegate the capability again unless the interface or platform restricts that behaviour. Authority-flow analysis should include onward transfer and retention.

## Memory safety and compartmentalisation differ
{: id="memory-safety-and-compartmentalisation-differ" }

Pure-capability memory protection constrains pointers to valid ranges and permissions. It reduces accidental or malicious out-of-bounds access.

Compartmentalisation constrains which valid objects and services a component receives at all. A component can be perfectly spatially memory-safe and still abuse a powerful capability through a logic error.

Strong systems use both:

- memory safety to keep each access within its authorised object
- compartmentalisation to keep each component’s authorised objects small in number and scope

## Design limits
{: id="design-limits" }

- A compartment is only as restricted as its initial and delegated capabilities.
- Shared writable memory can become a communication channel and a source of confused ownership.
- Large, frequent interfaces increase transition cost and policy complexity.
- Availability depends on how the system recovers from a compartment fault.
- Side channels may cross capability boundaries.
- A trusted switcher or runtime becomes part of the trusted computing base.

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

See [Build Compartments](/guides/build-compartments/) for a practical workflow and [Sealing](/build/technology/sealing/) for one of the underlying mechanisms.

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
