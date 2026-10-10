---
title: CHERI and Cybersecurity Regulation
permalink: /adopt/policy/cybersecurity-regulation/
---

1. Adopt
2. Policy
3. CHERI and Cybersecurity Regulation
{: .source-breadcrumbs }

# CHERI and Cybersecurity Regulation
{: id="page-hero-title" .page-hero-title }

Regulators increasingly expect security-by-design, resilience and effective risk management – CHERI can support those.
{: .page-hero-summary }

As cybersecurity regulation shifts from reactive security measures toward **secure-by-design** products, technologies that reduce vulnerability exposure become increasingly valuable.

CHERI can be relevant because memory safety and containment affect those outcomes. It can reduce exposure to a recurring vulnerability class and provide technical evidence that a component’s access is restricted. It does not, by itself, establish compliance.

The growing focus on memory safety is also reflected in standards activity. **ETSI TS 104 198 Memory Safety** defines multiple levels of memory-safety assurance and highlights CHERI as one of the technologies that can contribute to achieving the highest levels of memory-safety protection.

## European Union Cyber Resilience Act
{: id="european-union-cyber-resilience-act" }

The [Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act) covers products with digital elements placed on the European Union market. It introduces cybersecurity requirements across planning, design, development, maintenance, vulnerability handling, and information supplied with products.

The Act entered into force on 10 December 2024. Its reporting obligations apply from 11 September 2026, and its main obligations apply from 11 December 2027.

CHERI may contribute to reducing product risk by preventing many invalid memory accesses and containing selected components. The Act also covers activities that CHERI does not provide, including cybersecurity risk assessment, vulnerability handling, support periods, documentation, reporting, and conformity assessment.

## United Kingdom consumer connectable products
{: id="united-kingdom-consumer-connectable-products" }

The UK’s [Product Security and Telecommunications Infrastructure product-security regime](https://www.gov.uk/government/publications/the-uk-product-security-and-telecommunications-infrastructure-product-security-regime) has applied since 29 April 2024. It places duties on manufacturers, importers, and distributors of relevant consumer connectable products and sets baseline requirements concerning passwords, vulnerability reporting, and information about security-update periods.

CHERI is not a requirement of that regime. Its relevance is indirect but practical: connected products often contain memory-unsafe firmware and exposed protocol code, and capability protection can reduce the risk that one malformed input leads to wider access inside the device.

## NIS2 and Essential Services
{: id="nis2-and-essential-services" }

The European Union’s [NIS2 framework](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive) addresses cybersecurity risk management and incident reporting for covered sectors and entities. National implementation determines the exact obligations.

For essential and important services, CHERI can contribute to prevention and containment inside devices, gateways, infrastructure software, and operational systems. Availability, recovery, supply-chain security, monitoring, and incident management remain broader service properties.

## How CHERI can support compliance evidence
{: id="how-cheri-can-support-compliance-evidence" }

A CHERI implementation can provide evidence at several levels:

- Demonstrating stronger memory protection
- Demonstrating restricted component authority
- Demonstrating compartment boundaries
- Demonstrating blocked invalid accesses
- Documenting assumptions and limitations

That evidence can support a wider account of secure design and risk reduction. It does not replace legal interpretation or establish that every requirement has been met.

## Important Limitations
{: id="important-limitations" }

CHERI contributes to memory safety and compartmentalisation, but products must still meet broader requirements covering updates, vulnerability management, incident reporting, support, documentation, governance, and regulatory obligations.

## Supporting regulatory objectives
{: id="supporting-regulatory-objectives" }

Cybersecurity regulation increasingly encourages organisations to reduce risk and build security into products from the outset. While CHERI is not a compliance mechanism, it can support regulatory objectives by reducing exposure to memory vulnerabilities, strengthening isolation between components, and helping organisations demonstrate secure-by-design engineering practices.

## Where next
{: .where-next-title }

### [Critical Infrastructure &amp; Resilience](/adopt/policy/critical-infrastructure-and-resilience/)
{: .where-next-card-title }





[Critical-infrastructure policy connects prevention and containment with the availability and recovery of essential services.](/adopt/policy/critical-infrastructure-and-resilience/)
{: .where-next-summary }



[Continue](/adopt/policy/critical-infrastructure-and-resilience/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Government Guidance](/adopt/policy/government-guidance/)
{: .related-pages-item-title }





[Public guidance places CHERI alongside memory-safe languages and other routes to more resilient software.](/adopt/policy/government-guidance/)
{: .related-pages-item-summary }



[Read this page](/adopt/policy/government-guidance/)
{: .source-card-label }





### [The Business Case](/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](/adopt/business-case/the-business-case/)
{: .source-card-label }
