---
title: Assurance & Certification
permalink: /adopt/assurance-and-adoption/assurance-and-certification/
---

1. Adopt
2. Assurance &amp; Adoption
3. Assurance &amp; Certification
{: .source-breadcrumbs }

# Assurance &amp; Certification
{: id="page-hero-title" .page-hero-title }

CHERI can strengthen assurance by turning intended memory and component boundaries into processor-enforced properties that can be described and tested.
{: .page-hero-summary }

Assurance explains why a defined security or safety claim can be trusted. Certification records a judgement under a particular scheme. CHERI can contribute to both because it provides concrete properties about memory access and software authority, but neither follows from the presence of a CHERI-capable processor alone.

## Why CHERI can strengthen an assurance case
{: id="why-cheri-can-strengthen-an-assurance-case" }

In a conventional system, a software boundary may depend on coding rules, review, and the assumption that every pointer is used correctly. CHERI can place part of that boundary in the processor. Capabilities carry bounds and permissions, and compartments can receive a limited set of memory and services.

This supports claims with a defined subject and outcome, such as:

> In this configuration, the packet parser can access only its assigned buffers and the services exposed through its compartment interface.

That statement is narrower than “the product is secure,” but it is also far more useful. The protected component, permitted authority, and expected enforcement can all be connected to implementation evidence.

## Evidence across the system
{: id="evidence-across-the-system" }

CHERI-related assurance can draw on several layers:

- **Architecture:** the instruction-set specification, security model, capability rules, and behaviour when a check fails.
- **Hardware:** design verification, compliance testing, protection of capability tags, privileged paths, and debug behaviour.
- **Toolchain:** compiler behaviour, supported language models, conformance results, known limitations, and reproducible builds.
- **Software:** the code covered by capabilities, compartment configuration, interfaces, test results, and handling of unsafe operations.
- **Integration:** boot, devices, direct memory access, operating-system services, updates, monitoring, and fault response.
- **Product lifecycle:** traceable requirements, vulnerability handling, regression testing, maintenance, and recorded residual risk.

Evidence at one layer does not establish the others. A processor core can implement CHERI correctly while a wider system still includes direct-memory-access devices, debug paths, unsafe configuration, or software outside capability protection.

## Where this can be a good fit
{: id="where-this-can-be-a-good-fit" }

CHERI is relevant to assurance when a product depends on native code and its case includes claims about memory separation, least authority, or containment after compromise. It can be particularly valuable where components of different trust or assurance levels share an address space.

The fit is not limited to safety-certified products. Buyers and operators of general-purpose systems can also benefit from evidence that explains which software is protected, what it can reach, and what happens when a capability check fails.

## Certification remains scoped
{: id="certification-remains-scoped" }

Sector certification depends on the product, claims, standards, evidence, independence, and operating context. CHERI can contribute architectural and test evidence to that process; it does not replace the process or determine its outcome.

The Alliance’s [CHERI Enabled programme](/adopt/assurance-and-adoption/about-cheri-enabled/) has a specific purpose. It identifies named products whose submitted evidence supports the correct application of CHERI security principles. It is not a certificate for the overall security or safety of every system containing that product.

## Assurance over time
{: id="assurance-over-time" }

A claim remains meaningful when it is tied to the exact processor, architecture profile, toolchain, execution mode, software version, compartment design, and configuration. Changes to any of these may alter the evidence or the authority available to a component.

This specificity is one of CHERI’s strengths. It replaces a broad promise of “hardware security” with properties that can be bounded, inspected, tested, and maintained as part of the wider product assurance case.

## Where next
{: .where-next-title }

### [Procurement](/adopt/assurance-and-adoption/procurement/)
{: .where-next-card-title }





[Procurement can distinguish a defined CHERI implementation from a broad technology label by using its scope and evidence.](/adopt/assurance-and-adoption/procurement/)
{: .where-next-summary }



[Continue](/adopt/assurance-and-adoption/procurement/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Case Studies](/adopt/assurance-and-adoption/case-studies/)
{: .related-pages-item-title }





[CHERI has been explored across application processors, operating systems, embedded platforms, and commercial products.](/adopt/assurance-and-adoption/case-studies/)
{: .related-pages-item-summary }



[Read this page](/adopt/assurance-and-adoption/case-studies/)
{: .source-card-label }





### [The Business Case](/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](/adopt/business-case/the-business-case/)
{: .source-card-label }
