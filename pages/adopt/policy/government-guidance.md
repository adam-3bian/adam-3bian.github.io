---
title: Public Policy and CHERI
permalink: /adopt/policy/government-guidance/
summary: Policy makers, regulators, and cybersecurity agencies are pushing for safer software foundations.
parent: /adopt/
next_page_url: /adopt/policy/cybersecurity-regulation/
related:
  pages:
  - /adopt/business-case/the-business-case/
---

# Public Policy and CHERI

Memory vulnerabilities remain a major source of software security risk, prompting governments to encourage safer software and stronger resilience.

This policy direction creates a clear place for CHERI. Memory-safe languages can prevent broad classes of errors in new code. CHERI can bring hardware-enforced memory protection to existing software and support secure-by-design and resilience objectives.

## The direction of public guidance

CISA’s Case for Memory Safe Roadmaps presents memory safety as a strategic responsibility for software manufacturers. It focuses on measurable plans for reducing reliance on memory-unsafe languages and making progress visible to customers.

CISA’s work on critical open-source projects also recognises that widely used dependencies form part of the exposure. This is important because a product may contain native code that its own development team did not write.

The UK National Cyber Security Centre describes memory-safe languages and hardware approaches as parts of a wider secure-by-design landscape. Its discussion of raising software resilience at scale identifies CHERI as one of the technology approaches that can contribute to a more resilient ecosystem.

The UK’s Digital Security by Design programme provided a major public investment in CHERI research, the Morello platform, software, and industrial evaluation.

## Where CHERI adds to the policy picture

Much public guidance focuses on increasing the use of memory-safe languages. CHERI addresses a complementary challenge: improving the security of existing software, operating systems, firmware, and infrastructure that will continue to rely on C and C++ for years to come.

CHERI can contribute in two ways:

- Reducing the impact of memory vulnerabilities through processor-enforced memory protection.
- Limiting the consequences of compromise through stronger compartmentalisation between components.

These properties support policy goals around secure-by-design products, vulnerability reduction, resilience, and the protection of legacy investment. They also make CHERI complementary to language migration rather than a competing universal answer, as explained in CHERI and Rust.

## CHERI’s role in memory safety

ETSI TS 104 198 Memory Safety standard defines several levels of memory safety, recognising that different systems may require different protections. The highest level, and CHERI, may be particularly relevant for systems requiring the strongest memory-safety assurance, including critical infrastructure, safety-critical environments, and systems handling sensitive data.

The world’s software infrastructure contains vast amounts of existing C and C++ code that cannot realistically and economically be replaced overnight.

CHERI’s policy relevance lies in providing a much stronger solution to memory safety. It offers a way to cover software that might otherwise remain dependent on exploit mitigations alone, and it adds containment when preventing every defect is unrealistic.

## Guidance, standards, and law

As governments and cybersecurity authorities place increasing emphasis on memory safety, CHERI provides a practical way to strengthen existing software while supporting secure-by-design and resilience goals. It complements memory-safe languages, helps protect software investments, and expands the range of options available to product developers.
