---
layout: article
title: New InnovateUK-funded project to merge CHERI support into FreeBSD
summary: CheriBSD has been a key part of the hardware-software design used to create CHERI since the project’s inception.
permalink: /news/new-innovateuk-funded-project-to-merge-cheri-support-into-freebsd/
slug: new-innovateuk-funded-project-to-merge-cheri-support-into-freebsd
navigation:
  header:
    category: News & Events
    subcategory: News & Analysis
image:
  src: /assets/images/posts/2025-11-25-new-innovateuk-funded-project-to-merge-cheri-support-into-freebsd.webp
  alt: New InnovateUK-funded project to merge CHERI support into FreeBSD
  width: 928
  height: 522
  fit: contain
date: '2025-11-25T10:00:49+00:00'
post:
  category: cheri-alliance-news
  tags:
  - CHERI Alliance news
  - Ecosystem
  - Members
  authors:
  - person: brooks-davis
---

## Overview

Brooks Davis – [Capabilities Limited](/organisations/capabilities-limited/)

[Capabilities Limited](/organisations/capabilities-limited/), a founding member of the CHERI Alliance, is pleased to announce that we have received funding from Innovate UK for our 22 month project: *CheriBSD feature extraction, maturity, and testing*. [CheriBSD](http://cheribsd.org) is an operating system developed by the [University of Cambridge](/organisations/university-of-cambridge/), [SRI International](/organisations/sri/), and [Capabilities Limited](/organisations/capabilities-limited/) over the last fifteen years as part of the CHERI project.

It is both a demonstration of what is possible with cleanly and tightly integrated CHERI support in a general-purpose OS, and also a “pattern” for how to integrate CHERI into other systems such as [CHERI Linux](https://cheri-linux.org/). The CheriBSD design considers CHERI as a portable, architecture-neutral feature: It runs equally well on Arm’s Morello and arriving hardware implementing the new draft standard RV64Y from RISC-V International. Today, CheriBSD is a research operating system, but many of its CHERI-enabling features are already suitable for production use. Shipping CHERI support as part of FreeBSD will significantly reduce the risk of adopting CHERI vs attempting to base products on CheriBSD.

In this project we will extract the most production ready features from CheriBSD and upstream them to FreeBSD where they can more easily be incorporated into products supporting critical national infrastructure. Our goal is to upstream this functionality in time to ship it in the FreeBSD 16.0 release scheduled for December 2027, along with new test suites, engineering documentation, and other work to enable widespread use in the FreeBSD community.

We plan to produce patches for upstreaming on the following timeline:

- Now – March 2026: pure-capability kernel support
  - Goal: spatially safe kernel supporting FreeBSD and CheriBSD userspace
- April 2026 – September 2026: pure-capability userspace support
  - Goal: spatially safe userspace on FreeBSD/CHERI kernel
- October 2026 – February 2027: linker-based compartmentalization
  - Goal: enable stronger, finer grained isolation of components
- March 2027 – June 2027: Heap temporal safety
  - Goal: eliminate use-after-reallocation temporal safety issues for heap memory allocations

Standalone patches will be submitted to FreeBSD using [Phabricator](http://reviews.freebsd.org/) reviews or github pull requests as deemed appropriate. For larger changes, we will stage patches in the fork of the FreeBSD source tree hosted by the CHERI Alliance ([https://github.com/CHERI-Alliance/freebsd-src](https://github.com/CHERI-Alliance/freebsd-src)). The branches hosted there will be rebased periodically to track FreeBSD while maintaining work in progress patches in a reviewable state.

Beyond merging CHERI support to upstream FreeBSD, this project will improve the maturity of key CHERI-based features that are not quite ready to merge. In particular, we plan to improve the userspace component of heap temporal safety, replacing the malloc revocation shim (MRS) with revocation implemented directly in the allocator. This is expected to improve performance and allow for better optimization due the elimination of a layer of free lists which are decoupled from the allocator. We expect this work will bring us to the point where we can merge revocation. Likewise, we will integrate a current co-process compartmentalization prototype with the revocation system and explore new APIs for co-process creation and capability sharing. This will enable further exploration of co-process compartmentalization models in CheriBSD. We also plan to explore expanded use of sub-object bounds within userspace.

In the process of extracting patches and refining CHERI integration in CheriBSD and FreeBSD, we will also enhance existing test suites to cover a larger portion of CHERI C/C++ and POSIX than current test suites permit. This will involve improving the portability of the test suites as well as adding new tests.

We anticipate that FreeBSD 16 will be the first mainstream OS release to include support for CHERI out of the box.

More information on this project can be found at [https://www.capabilitieslimited.co.uk/current-projects/cheribsd-upstreaming](https://www.capabilitieslimited.co.uk/current-projects/cheribsd-upstreaming)

## About Capabilities Limited

[Capabilities Limited](/organisations/capabilities-limited/) is a UK-based small business founded by [Robert Watson](/people/robert-watson/) (Professor at the University of Cambridge) and Ben Laurie (Lead for systems and security research at Google Research) in 2011. Our goal is to transition research security technologies to broad industrial use. We perform fundamental research, applied research, and product development as services to industrial, government, and defense clients.

With highly experienced software, microarchitecture, and formal methods teams, the company has played a foundational role in the creation and adoption of the CHERI technology. Recent projects have included: Developing prototype software stacks for [Arm Morello](/products/morello/); Modeling an experimental CHERI-x86 ISA and new CHERI-based compartmentalisation tools; developing the RISC-V RV64Y Sail formal model; developing the CHERI-seL4 OS; and developing the open-source CVA6-CHERI application core.

We have active collaborations with partners that include [Google](/organisations/google/), the [University of Cambridge](/organisations/university-of-cambridge/), DARPA, UKRI, [SRI](/organisations/sri/), Arm, and the FreeBSD Foundation.

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
