---
title: CHERI or CHERIoT? The Answer Is Not What You Think
date: '2025-12-01T10:00:57+00:00'
authors: [adam-finney]
---

1. News &amp; Events
2. News &amp; Analysis
3. CHERI or CHERIoT? The Answer Is Not What You Think
{: .source-breadcrumbs }

# CHERI or CHERIoT? The Answer Is Not What You Think
{: id="page-hero-title" .page-hero-title }

*1 December 2025*{: .source-date }
*CHERI Alliance news*{: .collection-tag }
*Ecosystem*{: .collection-tag }
{: .collection-detail__metadata }

![CHERI or CHERIoT? The Answer Is Not What You Think](/assets/shared/source-assets/dca93f847af6-cheriot-1-0-specification-released.png){: .image-full }
{: .collection-detail__lead-image }

*Adam Finney – **CHERI Alliance***

Interest in capability based security has grown rapidly as organisations look for practical ways to move beyond legacy memory protection. As more projects explore CHERI technologies, a common question keeps surfacing: should we use CHERI or CHERIoT? At first glance it sounds like a straightforward architectural decision, but as [David Chisnall](/people/david-chisnall/) from [SCI Semiconductor](/organisations/sci-semiconductor/) points out, the question itself rests on a false premise.

CHERI is not a product or a platform. It is an abstract architectural model that can be expressed on many instruction sets and embodied in many designs. It defines the capability based ideas that make fine grained memory safety possible, but leaves enormous freedom in how those ideas are implemented. By contrast, CHERIoT is a concrete instantiation of CHERI aimed at resource constrained microcontroller class systems. It comes with a complete ISA, a software stack and design choices made specifically for small devices.

Understanding this distinction is important for anyone planning a CHERI based system. The real choice is not between CHERI and CHERIoT. It is between adopting CHERI at all and then selecting the right CHERI platform for the scale of hardware you are targeting. CHERIoT serves one part of that landscape. Other CHERI variants serve others.

In the article that follows, David explains why the “CHERI or CHERIoT” framing does not hold, what makes CHERIoT unique and how to think clearly about which CHERI approach fits your project or product.

[https://cheriot.org/cheri/philosophy/isa/2025/11/19/cheri-or-cheriot.html](https://cheriot.org/cheri/philosophy/isa/2025/11/19/cheri-or-cheriot.html)

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
{: .collection-detail__back }
