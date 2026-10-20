---
layout: details/post
title: The leading Root-of-Trust now integrates CHERI security technology
summary: If you are building secure hardware, the way you protect software running inside that hardware matters just as much as the cryptography around it.
permalink: /news/the-leading-root-of-trust-now-integrates-cheri-security-technology/
slug: the-leading-root-of-trust-now-integrates-cheri-security-technology
navigation:
  header:
    category: News & Events
    subcategory: News & Analysis
image:
  src: /assets/images/news-and-events/news-and-analysis/the-leading-root-of-trust-now-integrates-cheri-security-technology/6d7e0533-903fec6d1c34-hero.jpg
  alt: OpenTitan chip
  width: 1536
  height: 1024
date: '2026-07-15T12:35:43+01:00'
post:
  category: ecosystem
  tags:
  - Ecosystem
  - Members
  authors:
  - person: adam-finney
    role: CHERI Alliance
---


## Overview

That is why [lowRISC](/organisations/lowrisc/)’s announcement that OpenTitan Earl Grey 2 will support CHERI is important.

OpenTitan is an open source hardware Root of Trust platform designed to protect some of the most sensitive parts of a system. The Earl Grey 2 version will add CHERI support through a CHERIoT configuration of the Ibex processor, alongside post-quantum cryptography and other security improvements.

For developers and organisations, this means another practical route to using CHERI in real hardware.

CHERI helps prevent memory safety vulnerabilities and provides fine-grained software compartmentalisation enforced by the processor. Instead of relying entirely on software behaving correctly, hardware places stronger limits on what code is allowed to access.

This matters when the code handles keys, firmware, secure boot, device identity or other security-critical functions. CHERI can isolate each of those processes so that a vulnerability in one of them would not give an attacker access to anything else.

Earl Grey 2 will keep CHERI optional, allowing existing users to continue using legacy ePMP-based protection while giving new projects the opportunity to design with stronger hardware-enforced protections from the outset.

This new version of OpenTitan demonstrates how CHERI can bring an additional layer of security to real systems.

As AI makes it easier to discover, understand and potentially exploit software vulnerabilities at scale, reducing the impact of those vulnerabilities becomes increasingly important. Memory safety, compartmentalisation, Root of Trust and post-quantum security are becoming part of the same wider challenge. We need to build systems that integrate more of those security by design technologies to protect devices preventively as both threats and attackers’ capabilities evolve.

Read [lowRISC’s full announcement to learn more about OpenTitan Earl Grey 2 and its roadmap](https://lowrisc.org/news/opentitan-earl-grey-2-to-support-cheri-and-pqc).

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
