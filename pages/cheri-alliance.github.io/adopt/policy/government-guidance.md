---
title: Public Policy and CHERI
layout: source
permalink: /sources/cheri-alliance.github.io/adopt/policy/government-guidance/
---

1. Adopt
2. Policy
3. Public Policy and CHERI
{: .source-breadcrumbs }

# Public Policy and CHERI
{: id="page-hero-title" .page-hero-title }

Policy makers, regulators, and cybersecurity agencies are pushing for safer software foundations.
{: .page-hero-summary }

**Memory vulnerabilities** remain a major source of software security risk, prompting governments to encourage safer software and stronger resilience.

This policy direction creates a clear place for CHERI. Memory-safe languages can prevent broad classes of errors in new code. CHERI can bring hardware-enforced memory protection to existing software and support **secure-by-design** and **resilience** objectives.

## The direction of public guidance
{: id="the-direction-of-public-guidance" }

[CISA’s Case for Memory Safe Roadmaps](https://www.cisa.gov/resources-tools/resources/case-memory-safe-roadmaps) presents memory safety as a strategic responsibility for software manufacturers. It focuses on measurable plans for reducing reliance on memory-unsafe languages and making progress visible to customers.

[CISA’s work on critical open-source projects](https://www.cisa.gov/news-events/alerts/2024/06/26/cisa-and-partners-release-guidance-exploring-memory-safety-critical-open-source-projects) also recognises that widely used dependencies form part of the exposure. This is important because a product may contain native code that its own development team did not write.

The UK National Cyber Security Centre describes memory-safe languages and hardware approaches as parts of a wider secure-by-design landscape. Its discussion of [raising software resilience at scale](https://www.ncsc.gov.uk/blog-post/raising-cyber-resilience-software-at-scale) identifies CHERI as one of the technology approaches that can contribute to a more resilient ecosystem.

The UK’s [Digital Security by Design programme](https://www.ukri.org/what-we-do/browse-our-areas-of-investment-and-support/digital-security-by-design/) provided a major public investment in CHERI research, the Morello platform, software, and industrial evaluation.

## Where CHERI adds to the policy picture
{: id="where-cheri-adds-to-the-policy-picture" }

Much public guidance focuses on increasing the use of memory-safe languages. CHERI addresses a complementary challenge: improving the security of existing software, operating systems, firmware, and infrastructure that will continue to rely on C and C++ for years to come.

CHERI can contribute in two ways:

- **Reducing the impact** of memory vulnerabilities through processor-enforced memory protection.
- **Limiting the consequences** of compromise through stronger compartmentalisation between components.

These properties support policy goals around secure-by-design products, vulnerability reduction, resilience, and the protection of legacy investment. They also make CHERI complementary to language migration rather than a competing universal answer, as explained in [CHERI and Rust](https://cheri-alliance.github.io/discover/why-cheri/cheri-and-rust/).

## CHERI’s role in memory safety
{: id="cheris-role-in-memory-safety" }

**ETSI TS 104 198 Memory Safety** standard defines several levels of memory safety, recognising that different systems may require different protections. The **highest level**, and CHERI, may be particularly relevant for systems requiring the strongest memory-safety assurance, including critical infrastructure, safety-critical environments, and systems handling sensitive data.

The world’s software infrastructure contains vast amounts of existing C and C++ code that cannot realistically and economically be replaced overnight.

CHERI’s policy relevance lies in providing a much stronger solution to memory safety. It offers a way to cover software that might otherwise remain dependent on exploit mitigations alone, and it adds containment when preventing every defect is unrealistic.

## Guidance, standards, and law
{: id="guidance-standards-and-law" }

As governments and cybersecurity authorities place increasing emphasis on memory safety, CHERI provides a practical way to strengthen existing software while supporting secure-by-design and resilience goals. It complements memory-safe languages, helps protect software investments, and expands the range of options available to product developers.

## Where next
{: .where-next-title }

### [Cybersecurity Regulation](https://cheri-alliance.github.io/adopt/policy/cybersecurity-regulation/)
{: .where-next-card-title }





[Cybersecurity regulation focuses on lifecycle risk and secure-by-design outcomes rather than prescribing a particular processor technology.](https://cheri-alliance.github.io/adopt/policy/cybersecurity-regulation/)
{: .where-next-summary }



[Continue](https://cheri-alliance.github.io/adopt/policy/cybersecurity-regulation/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [The Business Case](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](https://cheri-alliance.github.io/adopt/business-case/the-business-case/)
{: .source-card-label }
