---
layout: article
title: 'The EU Cyber Resilience Act: What It Means for Secure-by-Design Systems and CHERI'
summary: In 2025 alone, global cybercrime costs reached an estimated **$1.2 billion every minute**, with projections rising to **$1.8 billion per minute by 2029**. Just seven years earlier, the figure was “only” $100 million per minute—already enormous, but now eclipsed by today’s scale.
permalink: /news/the-eu-cyber-resilience-act-what-it-means-for-secure-by-design-systems-and-cheri/
slug: the-eu-cyber-resilience-act-what-it-means-for-secure-by-design-systems-and-cheri
navigation:
  header:
    category: News & Events
    subcategory: News & Analysis
image:
  src: /assets/images/common/578c9944-d4c0d2560e6f-eu-flag.jpg
  alt: EU Flag
  width: 1280
  height: 853
date: '2026-02-04T10:00:45+00:00'
post:
  category: cheri-alliance-news
  tags:
  - CHERI Alliance news
  - Government / Regulation
  authors:
  - person: tariq-kurd
---

## Overview

Tariq Kurd – [Codasip](/organisations/codasip/)

## Cybercrime has become a trillion-dollar tax on the global economy — and it’s accelerating.

Crucially, most successful attacks do not rely on sophisticated zero-day exploits. They exploit **known Common Vulnerabilities and Exposures (CVEs)** – documented weaknesses that frequently remain unpatched across systems. These vulnerabilities are routinely used to deploy spyware, steal sensitive data, harvest credentials, and deliver ransomware. In many cases, ransomware is merely the final step after initial access has already been achieved.

The attack surface extends far beyond enterprise infrastructure. Today’s risks include **everyday consumer and embedded devices**: laptops, smartphones, desktops, wearables, smart TVs, and connected home appliances. Poorly secured devices are increasingly used as entry points into networks or as tools in large-scale denial-of-service attacks.

At the same time, **Linux-based systems are becoming ubiquitous**, from cloud infrastructure to consumer products. With that growth comes exposure: the Linux kernel averaged **12 reported CVEs per day in 2024**, rising to **nearly 16 per day in 2025**, with the trend continuing upward. These numbers reflect only known vulnerabilities; unreported flaws remain an even greater concern.

The conclusion is clear: incremental security improvements are no longer enough. Structural changes are required. Regulators are responding accordingly. The **EU Cyber Resilience Act (CRA)** mandates secure-by-design products, vulnerability disclosure, and timely patching across the digital supply chain.

Technologies such as **CHERI (Capability Hardware Enhanced RISC Instructions)** make this shift practical. By fundamentally improving memory safety and system isolation, CHERI enables far more secure consumer and embedded systems – reducing exploitability at its source. For manufacturers, this simplifies compliance with the CRA while lowering long-term security costs and helping curb the rising economic impact of cybercrime.

## The European Union’s Cyber Resilience Act (CRA)

The **European Union’s Cyber Resilience Act (CRA)** represents a major shift in how cybersecurity is regulated for digital products. By placing clear, legally enforceable obligations on manufacturers, the CRA aims to reduce systemic vulnerabilities and raise the baseline level of security across the EU’s digital economy.

With full enforcement due from **December 2027**, organisations developing or selling products with digital elements must now consider cybersecurity not as an afterthought, but as a core design requirement.

## What Is the Cyber Resilience Act?

The Cyber Resilience Act is a horizontal EU regulation that applies to “*products with digital elements*” — including software, hardware, connected devices, and standalone components that can connect directly or indirectly to a network.

Unlike previous frameworks that focused heavily on users and operators, the CRA places responsibility firmly on manufacturers and vendors. It requires products to be designed, developed, and maintained with cybersecurity in mind throughout their entire lifecycle.  
Key requirements include:

- **Security by design and by default**, ensuring that products ship in a secure state
- **Documented risk assessments** and technical documentation
- **Vulnerability handling processes**, including monitoring, patching, and coordinated disclosure
- **Mandatory vulnerability and incident reporting** within defined timelines
- **Conformity assessments**, including third-party evaluation for higher-risk product categories

Non-compliance can lead to significant penalties, making the CRA both a regulatory and commercial risk for organisations targeting the EU market.

## Lifecycle Security Becomes a Legal Requirement

One of the most important aspects of the CRA is its focus on lifecycle security. Manufacturers are no longer judged solely on how secure a product is at launch, but on how well it is maintained over time.

This includes providing security updates, addressing newly discovered vulnerabilities, and maintaining clear communication with users and authorities. In practice, this shifts incentives away from reactive patching towards more robust preventative approaches — particularly those that eliminate entire classes of vulnerabilities.

## Why Memory Safety Matters Under the CRA

Memory safety vulnerabilities remain one of the most common and severe sources of security flaws in modern software. While the CRA does not explicitly mandate memory-safe architectures today, its emphasis on risk reduction and secure-by-design principles strongly favours approaches that address root causes rather than symptoms.

This is where **CHERI** becomes especially relevant. By enforcing fine-grained memory protection at the hardware level, CHERI significantly reduces the risk of memory corruption vulnerabilities.

From a CRA perspective, architectures that provide built-in memory safety can:

- Reduce the volume and severity of vulnerabilities that must be managed
- Lower the operational burden of ongoing patching and disclosure
- Decrease long-term maintenance and compliance costs
- Reduce legal and reputational exposure resulting from security incidents

Although CHERI-based systems may initially involve higher learning and adoption costs, these can be offset by improved security outcomes and reduced lifecycle risk.

## Conformity Assessments and Supply Chain Pressure

The CRA introduces differentiated conformity assessment paths depending on product risk. While some lower-risk products may qualify for self-assessment, higher-risk categories will require **independent third-party assessment**.

This has important implications for supply chains. Vendors will increasingly need to **demonstrate** that their components — including hardware, firmware, and software libraries — support compliance. As a result, pressure to adopt more robust security foundations is likely to cascade down to suppliers and technology partners.

Standards aligned with CRA requirements are already emerging, and future revisions of the regulation may raise the bar further — potentially including explicit expectations around memory safety.

## Why Organisations Should Act Now

Although full enforcement is still over a year away, time is running out! The CRA is already shaping procurement decisions, product roadmaps, and architectural choices.

Organisations should be:

- Identifying which products fall within the CRA’s scope
- Assessing existing development practices against CRA requirements
- Embedding security-by-design principles into engineering workflows
- Evaluating architectural approaches that reduce vulnerability exposure at source

Those that act early will be better positioned not only to meet compliance deadlines, but to compete in a market where security is increasingly a differentiator rather than a checkbox.

## Regulation as an Architectural Turning Point

The Cyber Resilience Act signals a clear change in direction for product security. This will not only have an impact in Europe, but also in the rest of the World as manufacturers usually design products that are sold globally and need to fit the most stringent requirements. By making cybersecurity a legal requirement at the point of design, it encourages a move away from reactive fixes and towards fundamentally safer systems.

For organisations willing to invest in secure-by-design architectures such as CHERI, the CRA is not just a compliance challenge — it is an opportunity to build more resilient products, reduce long-term risk, and establish trust in an increasingly security-conscious market.

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
