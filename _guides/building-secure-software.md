---
title: Building Secure Software with CHERI
where-next:
  url: /build/technology/capabilities/
related-pages:
- url: /discover/understand/cheri-and-existing-software/
  description: Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.
  action: Read this page
- url: /discover/why-cheri/cheri-and-rust/
  description: Rust and CHERI address memory safety at different layers.
  action: Read this page
---

1. Discover
2. Why CHERI
3. Building Secure Software with CHERI
{: .source-breadcrumbs }

# Building Secure Software with CHERI
{: id="page-hero-title" .page-hero-title }

Questions developers should ask about memory safety, compartmentalisation, and authority.
{: .page-hero-summary }

The security properties of a CHERI system depend on how software is built, compiled, structured, and compartmentalised. Two products may both claim to “use CHERI” while providing very different levels of protection.

To understand what protection a system actually provides, engineers should ask a few practical questions about architecture, authority, threat models, and evidence.

## 1. What are you trying to protect?
{: id="1-what-are-you-trying-to-protect" }

Before discussing CHERI features, identify the data, services, and operations that matter:

- customer or patient data
- cryptographic keys
- privileged management interfaces
- device control functions
- service availability
- software update mechanisms
- safety-critical state

Then identify:

- which components can access them
- how authority is granted
- which interfaces can reach them
- which components do not need access

CHERI can only enforce security boundaries that exist in the software architecture. If every component has access to everything, there is little isolation for the hardware to enforce.

## 2. Which attackers and failures matter?
{: id="2-which-attackers-and-failures-matter" }

Security depends on what you expect the system to defend against. A browser renderer, a cloud service, and an industrial controller will have very different threat models.

A **threat model** describes the conditions the design is expected to withstand, e.g. whether an attacker can:

- send untrusted network data
- supply files or media for parsing
- install an untrusted extension
- compromise a third-party library
- gain local user access
- physically access the device
- observe timing or power use

## 3. Which CHERI execution mode is used?
{: id="3-which-cheri-execution-mode-is-used" }

The most important question is often: what code is actually using CHERI protections?

Ask what the relevant software actually does:

- **Conventional binary on CHERI hardware:** CHERI hardware may be able to run legacy binary code, which is then not protected.
- **Hybrid code:** Selected pointers or interfaces use capabilities. The protection depends on where and how they are used.
- **Pure-capability code:** Pointers visible to the language use capabilities broadly, giving strong coverage for capability-enforced accesses.
- **Compartmentalised code:** Authority is divided between components. The outcome depends on the boundaries and the capabilities each component receives.

These modes describe related but distinct protections. A pure-capability application is not necessarily compartmentalised, and a hybrid application may protect only selected interfaces.

## 4. What protections are actually enabled?
{: id="4-what-protections-are-actually-enabled" }

Different CHERI deployments provide different security properties. Verify which protections are enabled in your system rather than assuming they come automatically from CHERI hardware.

Check each relevant property separately:

- **Spatial safety:** Are accesses constrained to the intended object or allocation?
- **Permissions:** Are read, write, and execute rights reduced to what the code needs?
- **Capability integrity:** Can software forge or modify protected metadata?
- **Temporal safety:** What stops a stale capability being used after an object is freed and its memory reused?
- **Control-flow protection:** How are return addresses, function pointers, and protected entry points handled?

CHERI provides architectural building blocks, but some properties require compiler, allocator, operating-system, or runtime support. Temporal safety is an important example. Record the mechanism in use rather than assuming it from the processor alone.

## 5. How much authority does each component receive?
{: id="5-how-much-authority-does-each-component-receive" }

A component can still become a major security risk if it holds capabilities that grant broad access to memory, files, services, or secrets.

When reviewing a system, draw the authority flow between components. Explicitly identify which capabilities cross each boundary:

- capabilities available when the component starts
- capabilities accepted through interfaces
- services it can invoke
- capabilities it can retain or pass onwards
- whether shared memory is read-only or writable
- how the system revokes or replaces authority

Least privilege means giving each component only the authority required for its current task.

## 6. How do you verify the design?
{: id="6-how-do-you-verify-the-design" }

Useful evidence for engineering reviews includes:

- the architecture and implementation version
- compiler target and flags
- application binary interface (ABI) and operating-system mode
- software bill of materials
- porting diagnostics and resolved capability faults
- tests that deliberately exceed bounds or permissions
- compartment interface definitions
- threat modelling and security review
- independent assessment or scheme-specific certification
- performance and failure-recovery results for the real workload

A demonstration shows that one scenario worked. It is not automatically evidence for every build, platform, or attack path.

## A more useful security statement
{: id="a-more-useful-security-statement" }

A broad statement might be:

> The product is secure because it uses CHERI.

A more reviewable statement is:

> The network parser runs in its own compartment as pure-capability code. It receives a read-only capability bounded to one input buffer and a capability for one validated output queue. Tests confirm that out-of-bounds reads, writes, and unauthorised service calls fault without exposing application keys or affecting other compartments.

The second statement can be reviewed, tested, and improved. It also makes the remaining questions visible.

## Key takeaways
{: id="key-takeaways" }

- Treat CHERI as a set of security mechanisms rather than a single security property
- Be explicit about what code is running in pure-capability, hybrid, or compartmentalised modes
- Define authority boundaries and minimise the capabilities each component receives
- Verify memory-safety, isolation, and least-privilege assumptions with testing
- Support security claims with evidence from the actual product, build, and deployment configuration
- CHERI complements secure design, code review, testing, and operational controls; it does not replace them

## Where next
{: .where-next-title }

### [Capabilities](/build/technology/capabilities/)
{: .where-next-card-title }





[A pointer bug becomes dangerous when changing a number changes authority.](/build/technology/capabilities/)
{: .where-next-summary }



[Continue](/build/technology/capabilities/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [CHERI and Existing Software](/discover/understand/cheri-and-existing-software/)
{: .related-pages-item-title }





[Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.](/discover/understand/cheri-and-existing-software/)
{: .related-pages-item-summary }



[Read this page](/discover/understand/cheri-and-existing-software/)
{: .source-card-label }





### [CHERI and Rust](/discover/why-cheri/cheri-and-rust/)
{: .related-pages-item-title }





[Rust and CHERI address memory safety at different layers.](/discover/why-cheri/cheri-and-rust/)
{: .related-pages-item-summary }



[Read this page](/discover/why-cheri/cheri-and-rust/)
{: .source-card-label }
