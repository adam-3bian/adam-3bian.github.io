---
title: Procurement
permalink: /adopt/assurance-and-adoption/procurement/
where-next:
  url: /adopt/assurance-and-adoption/about-cheri-enabled/
  title: About CHERI Enabled
related-pages:
- url: /adopt/assurance-and-adoption/case-studies/
  description: CHERI has been explored across application processors, operating systems, embedded platforms, and commercial products.
  action: Read this page
- url: /adopt/assurance-and-adoption/assurance-and-certification/
  description: CHERI can turn intended memory and component boundaries into properties that are enforced and testable.
  action: Read this page
- url: /adopt/business-case/the-business-case/
  title: The Business Case
  description: CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.
  action: Read this page
---

1. Adopt
2. Assurance &amp; Adoption
3. Procurement
{: .source-breadcrumbs }

# Procurement
{: id="page-hero-title" .page-hero-title }

CHERI can give buyers a more precise account of memory protection and containment when the product, software coverage, and evidence have a defined scope.
{: .page-hero-summary }

Procurement connects a product’s security claims to the needs of the organisation that will depend on it. CHERI can make those claims more concrete because its protection concerns defined memory ranges, permissions, and component authority rather than an undefined promise of greater security.

The phrase “CHERI-based” on its own says very little. A product may use a CHERI-capable processor while protecting only part of its software, running in a hybrid mode, or allowing privileged paths outside normal capability checks. The value becomes clearer when the scope is visible.

## What a CHERI product can make explicit
{: id="what-a-cheri-product-can-make-explicit" }

A well-scoped description can identify:

- the processor product, architecture profile, and supported execution modes;
- which firmware, operating-system, application, and third-party components use capabilities;
- which components are compartments and the authority available to each one;
- how spatial and temporal memory safety are addressed;
- whether debug, devices, direct memory access, or privileged software can bypass normal checks;
- the toolchain, update path, vulnerability process, and supported lifetime;
- limitations that remain outside the CHERI protection model.

This information turns a technology label into a set of properties that can be compared with a product’s intended role.

Spatial memory safety keeps access within the bounds of the intended object. Temporal memory safety addresses access to memory after the object’s valid lifetime has ended. CHERI implementations can cover these properties in different ways, so their scope affects product fit.

## Why the distinction matters
{: id="why-the-distinction-matters" }

Two CHERI products can provide very different coverage. One may be a processor core that correctly implements capability instructions. Another may be a complete system whose operating system and applications run in pure-capability mode with several compartments.

Both can be valuable, but they answer different needs. A processor core provides a foundation for an integrator. A complete platform can provide evidence about more layers of the software and product. Certification of one component does not extend automatically to the system around it.

## CHERI alongside other approaches
{: id="cheri-alongside-other-approaches" }

Memory-safe languages, process isolation, virtual machines, CHERI, and established hardware protections can complement one another. Their relevance depends on the software being protected and the boundary required.

CHERI is a particularly good fit in product requirements where existing native code remains important or where several components need isolation within one address space. A memory-safe language may be the stronger fit for a new application. A virtual machine may be the appropriate boundary between complete workloads. A combined design can use all three at different layers.

## Evidence and comparability
{: id="evidence-and-comparability" }

Useful evidence can include architecture conformance, hardware verification, protected-software manifests, compartment authority, denied-access tests, fault behaviour, port results, and lifecycle support. The depth of independent review varies by product and scheme.

The [CHERI Enabled product directory](/adopt/assurance-and-adoption/cheri-enabled-products/) provides public records for products certified under the Alliance programme. Those records describe the named product and version, the evidence submitted, and the limits of the programme. They do not certify every integrated product that uses the component.

## Lifecycle value
{: id="lifecycle-value" }

Purchase price is only one part of the cost. Platform availability, software migration, build and debugging tools, assurance, updates, supplier maintenance, and the ability to move between product generations all affect long-term fit.

CHERI’s procurement value lies in making a security property more visible: which software can access which resources, and how the processor enforces that boundary. When a product exposes that scope, buyers can distinguish meaningful capability protection from use of the name alone.

The exact legal and contractual requirements remain specific to the jurisdiction, sector, and procurement. This page describes the technical meaning of CHERI claims rather than model legal wording.

## Where next
{: .where-next-title }

### [About CHERI Enabled](/adopt/assurance-and-adoption/about-cheri-enabled/)
{: .where-next-card-title }





[The CHERI Enabled programme provides a common public record for named products and their implementation claims.](/adopt/assurance-and-adoption/about-cheri-enabled/)
{: .where-next-summary }



[Continue](/adopt/assurance-and-adoption/about-cheri-enabled/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Case Studies](/adopt/assurance-and-adoption/case-studies/)
{: .related-pages-item-title }





[CHERI has been explored across application processors, operating systems, embedded platforms, and commercial products.](/adopt/assurance-and-adoption/case-studies/)
{: .related-pages-item-summary }



[Read this page](/adopt/assurance-and-adoption/case-studies/)
{: .source-card-label }





### [Assurance &amp; Certification](/adopt/assurance-and-adoption/assurance-and-certification/)
{: .related-pages-item-title }





[CHERI can turn intended memory and component boundaries into properties that are enforced and testable.](/adopt/assurance-and-adoption/assurance-and-certification/)
{: .related-pages-item-summary }



[Read this page](/adopt/assurance-and-adoption/assurance-and-certification/)
{: .source-card-label }





### [The Business Case](/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](/adopt/business-case/the-business-case/)
{: .source-card-label }
