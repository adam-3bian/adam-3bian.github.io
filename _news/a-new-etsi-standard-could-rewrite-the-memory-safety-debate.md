---
title: A new ETSI standard could rewrite the memory-safety debate
date: '2026-07-29T17:07:00+01:00'
authors: [mike-eftimakis]
---

1. News &amp; Events
2. News &amp; Analysis
3. A new ETSI standard could rewrite the memory-safety debate
{: .source-breadcrumbs }

# A new ETSI standard could rewrite the memory-safety debate
{: id="page-hero-title" .page-hero-title }

Mike Eftimakis – CHERI Alliance ETSI TS 104 198 establishes a common language for memory safety Memory-safety vulnerabilities remain one of the largest sources of critical software vulnerabilities. Despite years of investment in safer languages…
{: .page-hero-summary }

*29 July 2026*{: .source-date }
*CHERI Alliance news*{: .collection-tag }
*Ecosystem*{: .collection-tag }
*Government / Regulation*{: .collection-tag }
{: .collection-detail__metadata }

![ETSI standard](/assets/news/a-new-etsi-standard-could-rewrite-the-memory-safety-debate/67e343f4b8d6-hero.png){: .image-full }
{: .collection-detail__lead-image }

Mike Eftimakis – **CHERI Alliance**

Memory-safety vulnerabilities remain one of the largest sources of critical software vulnerabilities. Despite years of investment in safer languages, hardware protections, and secure development practices, the industry has lacked a common way to define and compare memory-safety technologies.

That may be about to change.

[**ETSI**](https://www.etsi.org/) (the European Telecommunications Standards Institute) develops globally recognised standards across telecommunications, cybersecurity, and digital technologies. ETSI’s Technical Committee on Cybersecurity (TC CYBER) has released a public draft of [**ETSI TS 104 198** – **Memory-safety requirements**](https://docbox.etsi.org/CYBER/CYBER/Open/ETSI_TS_104_198_DRAFT.zip), a new specification that introduces a common vocabulary, a set of memory-safety properties, and a structured assurance model for evaluating memory safety across languages, hardware, and software systems.

## Why It Matters
{: id="why-it-matters" }

Today, organisations improve memory safety in many ways: memory-safe languages such as Rust and Java, hardware technologies such as CHERI and Arm MTE, formal verification, and secure development practices. Comparing these approaches has been difficult because there has been no shared vocabulary or evaluation framework.

The ETSI specification addresses this by defining memory safety as a collection of measurable properties, including:

- Reference safety
- Spatial safety
- Temporal safety
- Initialization safety
- Finalization safety
- Concurrency-safe memory safety
- Type-safe memory safety

Rather than asking whether a technology is simply “memory safe”, the framework enables discussion of *which* properties it provides, how completely they are enforced, and whether that enforcement is deterministic or probabilistic.

## Introducing Memory-Safety Assurance Levels
{: id="introducing-memory-safety-assurance-levels" }

A key contribution of the draft is a set of five assurance levels:

- **Level 0:** Basic development practices in memory-unsafe languages.
- **Level 1:** Hardened development using code reviews, static analysis, sanitizers, and fuzzing.
- **Level 2:** Memory-safety enforcement through memory-safe languages, formal methods, or hardware/software protection mechanisms.
- **Level 3:**  Extends memory-safety requirements beyond the primary software component to dependencies that the organisation can control.
- **Level 4:** System-wide memory safety, including applications, dependencies, and the trusted computing base (TCB).

The assurance levels acknowledge that memory safety is achieved progressively, rather than all at once, helping organisations communicate realistic improvement roadmaps.

## A Neutral Framework for Comparing Technologies
{: id="a-neutral-framework-for-comparing-technologies" }

Importantly, ETSI TS 104 198 is technology-neutral. The draft discusses a wide range of languages and technologies, including Rust, Java, Erlang, Go, CHERI, MTE, PAC, and formal verification approaches.

For the first time, organisations have a common basis for comparing different memory-safety technologies and evaluating their strengths, limitations, and assurance characteristics.

## Why This Is Important for CHERI
{: id="why-this-is-important-for-cheri" }

While ETSI TS 104 198 is deliberately technology-neutral, it is particularly noteworthy for the attention given to CHERI. The draft contains numerous examples referencing CHERI, particularly when discussing capability permissions, provenance, reference integrity, and deterministic memory-safety enforcement. It also identifies CHERI-based systems as examples that can achieve the highest assurance levels when combined with suitable software stacks and development processes.

The strength of the standard lies in its neutrality. Yet when different approaches are evaluated against the same memory-safety criteria, CHERI emerges as a particularly powerful option. Its open, multi-vendor ecosystem, hardware-enforced protection model, and ability to deliver strong security without sacrificing efficiency make CHERI the most practical path towards the highest level of memory-safety assurance.

## Looking Ahead
{: id="looking-ahead" }

The public review note highlights broader ambitions for the specification, including support for technology roadmap development, procurement requirements, auditing, certification, and future standards work.

As governments and industry increasingly focus on secure-by-design software, ETSI TS 104 198 could become an important reference point for discussing and measuring memory safety across the entire technology ecosystem. For the first time, the industry has a credible, vendor-neutral framework for discussing, comparing, and measuring memory safety.

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
{: .collection-detail__back }
