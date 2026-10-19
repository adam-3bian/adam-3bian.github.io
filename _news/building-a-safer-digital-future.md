---
title: Building a Safer Digital Future
date: '2025-02-05T12:46:45+00:00'
---

1. News &amp; Events
2. News &amp; Analysis
3. Building a Safer Digital Future
{: .source-breadcrumbs }

# Building a Safer Digital Future
{: id="page-hero-title" .page-hero-title }

*5 February 2025*{: .source-date }
*CHERI Alliance news*{: .collection-tag }
{: .collection-detail__metadata }

![A CPU with padlocks and protective shielding](/assets/news/building-a-safer-digital-future/87eb1aa83796-hero.png){: .image-full }
{: .collection-detail__lead-image }

**The Call for Memory Safety Standards and CHERI’s Role**

The conversation around software memory safety is reaching a critical turning point. In a [recent publication in the Communications of the ACM](https://cacm.acm.org/opinion/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/), industry experts have called for a decisive move toward standardizing principles and practices to mitigate memory safety vulnerabilities. These vulnerabilities, responsible for a significant portion of software security breaches, demand attention not just from developers and hardware designers but also from policymakers. Among the promising solutions at the forefront of this effort is CHERI (Capability Hardware Enhanced RISC Instructions), a transformative technology that brings memory safety directly into hardware design.

### The Case for Memory Safety Standards
{: id="the-case-for-memory-safety-standards" }

The CACM article emphasizes a stark reality: despite decades of effort, memory safety remains a persistent Achilles’ heel in software development. Buffer overflows, use-after-free errors, and other memory-related bugs are exploited in nearly 70% of all reported software vulnerabilities. These issues not only compromise user data but also cost trillions annually in security breaches and mitigation efforts.

The push for standardized memory safety practices signals a shift in how policymakers and industry leaders view the problem. Rather than treating memory safety as a best-effort practice, the goal is to establish it as a fundamental requirement—similar to how electrical or mechanical safety is regulated in physical systems. Such standards could enable industry sectors such as defence, critical infrastructure, and healthcare to express demand for memory safety in their procurement process, or allow regulators or insurers to require organizations to adopt proven solutions, setting a baseline for secure systems in critical use cases.

### CHERI: A Game-Changing Technology
{: id="cheri-a-game-changing-technology" }

One of these proven solutions is CHERI, a groundbreaking architecture that integrates fine-grained memory protection and scalable compartmentalization into hardware. By enforcing bounds and permissions at the pointer level, CHERI effectively neutralizes many of the most common memory vulnerabilities.

The paper highlights that CHERI brings the strongest level of memory safety:

1. **Hardware-Enforced Security:** Unlike purely software-based solutions, CHERI builds memory safety guarantees directly into the hardware. This approach not only improves performance but also ensures that protection mechanisms cannot be bypassed.
2. **Backward Compatibility:** CHERI has been designed to work with existing software. Adaptations of FreeBSD, Linux, nginx, and LLVM for CHERI-enabled platforms such as Arm’s Morello and CHERI-RISC-V demonstrate how it can easily be applied to legacy codebases, making it a practical option for wide-scale adoption. Critically, CHERI brings memory safety throughout a C/C++ software stack without a ground-up rewrite in a new programming language.
3. **Scalable Compartmentalization:** By enabling fine-grained compartmentalization, CHERI allows applications to be divided into isolated components. This significantly limits the impact of potential exploits, aligning with regulatory goals of minimizing risk.

### Policy Impact, Procurement, and Adoption
{: id="policy-impact-procurement-and-adoption" }

For policymakers, the publication’s call to action and CHERI’s capabilities represent a perfect alignment of opportunity and innovation. As regulatory bodies begin to consider mandating memory safety in critical environments, and security-sensitive market consumers such as governments and healthcare seek the protection associated with strong memory safety, technologies like CHERI provide a concrete solution that can be standardized and adopted at scale.

Imagine a world where regulatory compliance mandates memory-safe architectures for critical systems—such as those in healthcare, finance, or a country's infrastructure. CHERI could become the benchmark for compliance, driving widespread adoption across industries.

### Challenges and the Path Forward
{: id="challenges-and-the-path-forward" }

Of course, challenges remain. While CHERI offers a compelling solution, difficulties like scalability, adoption by diverse ecosystems, and developer training remain. The CHERI Alliance addresses these hurdles by uniting industry leaders, academics, and policymakers to promote and facilitate adoption.

Key efforts include educational programs, technical collaboration, and advocacy for memory safety policies. By fostering teamwork and aligning on standards, the alliance helps bridge the gap between CHERI’s potential and real-world implementation, paving the way for broader adoption.

### A great step forward
{: id="a-great-step-forward" }

The CACM article’s call for standardized memory safety principles is more than a rallying cry; it’s a blueprint for a safer digital future. Technologies like CHERI demonstrate that memory safety is not just possible but practical, scalable, and effective. As policymakers and industry leaders answer the call, we could see a paradigm shift where memory safety is no longer an aspiration but a fundamental guarantee.

The time to act is now. With CHERI leading the way, we have the tools to make memory safety a cornerstone of modern computing—and to build a more secure world for everyone.

– Mike Eftimakis, CHERI Alliance

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
{: .collection-detail__back }
