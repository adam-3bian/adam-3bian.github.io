---
title: One Bug is All It Takes
date: '2026-05-04T16:06:57+01:00'
authors: [adam-finney]
---

1. News &amp; Events
2. News &amp; Analysis
3. One Bug is All It Takes
{: .source-breadcrumbs }

# One Bug is All It Takes
{: id="page-hero-title" .page-hero-title }

In 2025 alone, global cybercrime costs reached an estimated $1.2 billion every minute, with projections rising to $1.8 billion per minute by 2029. Just seven years earlier, the figure was “only” $100 million per minute—already enormous, but now…
{: .page-hero-summary }

*4 May 2026*{: .source-date }
*CHERI Alliance news*{: .collection-tag }
*Ecosystem*{: .collection-tag }
{: .collection-detail__metadata }

![A red bug on a computer screen being focused by a magnifying glass](/assets/news/one-bug-is-all-it-takes/90741c3e8a15-hero.jpg){: .image-full }
{: .collection-detail__lead-image }

Adam Finney – **CHERI Alliance**

This article is part of a series of blogs published after the announcement of Mythos vulnerabilities’ exploitation capabilities. The views from other experts on this topic are:

- [AI has compressed the attack timeline – Mike Eftimakis](/news/ai-has-compressed-the-attack-timeline/)
- [CHERI memory safety mitigates LLM-discovered vulnerability in FreeBSD – Brooks Davis](/news/cheri-memory-safety-mitigates-llm-discovered-vulnerability-in-freebsd/)

For many years, automated tools that scan software for defects have played a central role in improving system security. A major early effort in this space was a U.S. Department of Homeland Security funded initiative that used Coverity’s static analysis technology to examine widely used open source software projects. This work analysed over 150 projects, including 53 in detail, and led to the discovery and remediation of approximately 6,000 defects across those codebases. It demonstrated that large numbers of previously unknown flaws existed even in widely deployed software, many of which represented potential security risks.

Since then, static analysis has become a standard part of modern software development. These tools analyse source code without executing it, exploring possible execution paths to identify defects such as null pointer dereferences, resource leaks, and logic errors. Over time, they have scaled to analyse very large codebases across many projects, contributing to the identification and fixing of large numbers of defects.

More recently, new approaches have emerged that attempt to make analysis tools more adaptive and intelligent. Rather than strictly modelling program execution, some systems attempt to identify patterns that appear risky, similar to how a human reviewer might detect suspicious constructs. While this can uncover issues that traditional techniques might miss, it also introduces challenges, particularly in distinguishing genuine vulnerabilities from benign patterns.

One of the most significant challenges in static analysis is noise. Tools often produce large volumes of warnings, many of which are false positives or lower priority issues. Each reported defect must still be reviewed by a developer, creating a substantial cost in time and effort. Over time, this can lead to alert fatigue, where important warnings risk being ignored. Even in high quality analysis tools, some level of false positives is unavoidable due to the inherent trade off between accuracy and completeness in static analysis.

Subsequent empirical studies have shown that these challenges persist in modern tools, with analyses highlighting variability in results across different tools and continued issues with precision and false positives in real world codebases.

Traditional approaches attempt to mitigate this by allowing developers to provide annotations or additional context, helping tools better understand intended behaviour. However, more probabilistic or heuristic based systems may lack this precision, making it difficult to distinguish between genuinely dangerous conditions and code that merely appears suspicious.

Alongside these approaches, architectural solutions such as CHERI (Capability Hardware Enhanced RISC Instructions) provide a complementary path to improving security. Rather than relying solely on detection, CHERI enforces memory safety properties directly in hardware through capabilities that encode bounds and permissions. This reduces reliance on warning based systems and removes entire classes of vulnerabilities, particularly those related to memory safety, which static analysis tools often struggle to reason about precisely.

There is also a fundamental asymmetry between defenders and attackers. Developers must identify and fix every serious vulnerability, whereas an attacker needs to exploit only one. When tools generate large numbers of potential issues, even with many false positives, an attacker can focus on a small subset and still discover a real weakness. Approaches like CHERI aim to rebalance this dynamic by reducing the number of exploitable defects at their source, rather than relying solely on their detection.

Further reading:

- [AI has compressed the attack timeline](/news/ai-has-compressed-the-attack-timeline/)
- [LinkedIn article from David Chisnall](https://www.linkedin.com/feed/update/urn:li:activity:7447564843349430272/)
- [https://arxiv.org/pdf/2101.08832](https://arxiv.org/pdf/2101.08832)
- [https://download.101com.com/pub/gcn/newspics/Coverity\_OpenSourceReport2008.pdf](https://download.101com.com/pub/gcn/newspics/Coverity_OpenSourceReport2008.pdf)
- [https://www.theregister.com/2009/09/25/open\_source\_code\_audit](https://www.theregister.com/2009/09/25/open_source_code_audit)
- [https://www.cs.cmu.edu/~aldrich/courses/654-sp07/tools/cure-coverity-06.pdf](https://www.cs.cmu.edu/~aldrich/courses/654-sp07/tools/cure-coverity-06.pdf)

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
{: .collection-detail__back }
