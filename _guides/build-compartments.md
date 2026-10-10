---
title: Build Compartments
---

1. Build
2. Developers
3. Build Compartments
{: .source-breadcrumbs }

# Build Compartments
{: id="page-hero-title" .page-hero-title }

Build compartments by mapping authority first, then give each component only the memory, services, and entry points required for its task.
{: .page-hero-summary }

Memory-safe code can still be over-privileged. A parser may correctly read the input it receives but have no reason to access encryption keys, update controls, or unrelated application state. A compartment boundary limits what the component can reach even if it is buggy or compromised.

The hard part is not adding the boundary instruction. It is deciding which authority must cross it.

## Choose a useful first boundary
{: id="choose-a-useful-first-boundary" }

Good first compartments have a narrow purpose and an existing interface. Examples include:

- image, document, or protocol parsers
- network stacks and packet-processing stages
- cryptographic services
- device drivers
- update verification
- third-party libraries
- key-value storage

A source-directory split alone does not create a useful security boundary. A compartment should correspond to assets and threats that can be described and tested.

## Describe the authority each component needs
{: id="describe-the-authority-each-component-needs" }

Before writing code, list what the component needs:

- **Input packet:** The parser needs to read one packet, so it receives a read-only capability bounded to that packet.
- **Output record:** The parser needs to return validated data, so it receives a writable capability bounded to one output record.
- **Log service:** The parser may submit a structured diagnostic event through a sealed service entry.
- **Key store:** The parser does not need keys, so it receives no capability for the key store.
- **Update service:** The parser does not change firmware, so it receives no capability for the update service.

This list describes the proposed security policy. Review it before implementation and keep it with the tests.

## Design a narrow interface
{: id="design-a-narrow-interface" }

Prefer interfaces that pass bounded data and small, well-defined values:

~~~
int parse_message(const unsigned char *input,
                  size_t input_length,
                  struct parsed_message *output);
~~~

The interface should define:

- ownership and lifetime of each object
- whether memory is read-only, writable, or transferred
- maximum sizes and permitted overlap
- valid return values and fault behaviour
- whether the callee may retain a capability after returning
- which service capabilities the callee may invoke

Passing a pointer to a large application context is convenient but usually grants too much authority.

## Derive, do not widen
{: id="derive-do-not-widen" }

The caller should derive a narrower capability from authority it already holds:

1. restrict the bounds to the specific object
2. remove permissions the callee does not need
3. pass only the required service entry points
4. avoid ambient globals that bypass the interface

CHERI capabilities can normally be reduced but not amplified. The design should not depend on the callee inventing authority later.

## Select the platform mechanism
{: id="select-the-platform-mechanism" }

Compartment application programming interfaces (APIs) differ by environment:

- **The CHERIoT real-time operating system (RTOS)** defines firmware compartments, imported and exported entry points, shared objects, and sealed service capabilities through its software development kit (SDK) and build model.
- **CheriBSD** supports several compartmentalisation approaches for applications and operating-system components, including capability-aware process and in-process models.
- **Other CHERI operating systems and runtimes** may provide their own call gates, switchers, sealing conventions, or service interfaces.

Use the platform’s maintained mechanism. A calling convention assembled from raw sealing operations is appropriate only when the architecture work itself is the goal.

## Test the negative cases
{: id="test-the-negative-cases" }

A compartment test suite must show what fails:

- read one byte before and after an input buffer
- write through a read-only capability
- call an entry point that was not granted
- retain and reuse authority beyond its documented lifetime
- pass a capability with missing or excessive permissions
- corrupt untrusted input and confirm recovery behaviour
- attempt to reach a known secret outside the compartment

Check not only that the processor faults, but also what the system does next. Does it terminate one compartment, restart a service, reset the device, or stop the whole application? Availability is part of the design.

## Measure boundary cost
{: id="measure-boundary-cost" }

Fine-grained compartments trade reduced authority for transition and communication overhead. Measure:

- call latency and throughput
- copied versus shared data
- stack and metadata memory
- scheduler or switcher activity
- cache effects on representative hardware
- recovery cost after a fault

If a boundary is too expensive, first reduce call frequency or batch data. Removing the security boundary should not be the automatic optimisation.

## Review checklist
{: id="review-checklist" }

- Every granted capability appears in the authority record.
- No undocumented global or inherited authority bypasses the interface.
- Bounds and permissions are narrower than the caller’s own authority where possible.
- Lifetimes and capability retention are explicit.
- Negative tests prove denied actions remain denied.
- Fault handling preserves the required availability and safety behaviour.
- Performance results name the platform, software revision, and workload.

For an embedded worked path, use the [CHERIoT Programmer’s Guide](https://cheriot.org/book/). For the underlying mechanism, read [Compartmentalisation](/build/technology/compartmentalisation/) and [Sealing](/build/technology/sealing/).

## Where next
{: .where-next-title }

### [Tutorials &amp; Training](/guides/tutorials-and-training/)
{: .where-next-card-title }





[Continue with maintained tutorials for the selected platform, compartment model, and development tools.](/guides/tutorials-and-training/)
{: .where-next-summary }



[Continue](/guides/tutorials-and-training/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Port Existing Software](/guides/port-existing-software/)
{: .related-pages-item-title }





[Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.](/guides/port-existing-software/)
{: .related-pages-item-summary }



[Read this page](/guides/port-existing-software/)
{: .source-card-label }





### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[Choose a platform, prepare an environment and run a first CHERI workload.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }
