---
layout: page/standard
title: Goals
summary: The goal of this work is to develop a CHERI Linux adaptation that is at feature parity with CheriBSD, and of sufficiently high quality to both enable production use and support upstreaming to the Linux community. On the whole, this roadmap is drawn from the CheriBSD feature list, including mature entries (e.g., spatial memory safety for kernel and user space, and user space heap temporal safety), and also immature prototypes or prospective ones (such as co-process compartmentalization or kernel compartmentalization). The scope of this work will include both MMU-enabled and MMU-less instantiations of Linux. Both of these targets have already seen substantial interest (and work) in the CHERI community, and have use cases at their respective scales that will clearly benefit from CHERI protection. In the case of MMU-less Linux, CHERI can be used to provide the fine-grained security that MPUs cannot provide and which have often proved a barrier to its adoption.
permalink: /reference/linux-roadmap/goals/index.html
slug: reference-linux-roadmap-goals-index
navigation:
  header:
    category: Discover CHERI
    subcategory: Resources
---

## Overview

This is a reasonable starting strategy, but it will likely evolve over time as we come to better understand CHERI integration into Linux. For example, we expect that there may be Linux features not present in FreeBSD that require more research-focused activities to address (such as eBPF) or even simply C stylistic differences (e.g., around the use of long) that change aspects of the work in important ways.

A longer term, but equally important, goal of the work is to engage with potential upstreaming to Linux and at least one major distribution – and to ensure that there is a useful consensus on both approach and implementation amongst the various interested parties and architectures. This will require bringing together a community of CHERI Linux collaborators, engaging with the broader Linux community, and working with potential adopters to steer technical direction. It will also require broadly available, accessible CHERI-based hardware.

In similar vein, we recommend continuing the current strategy of maximizing *portability* of CHERI protection, language integration, and APIs across architectures (e.g., Arm’s Morello, CHERI-RISC-V), toolchain (e.g., LLVM, GCC), and operating systems (e.g., FreeBSD, Linux). This has two strong benefits: Minimizing developer burden in adapting application-level code, and also ensuring that lessons learned in any of these can be broadly benefited from in all. This will also help reinforce the message to upstream communities that CHERI protection is a well defined, portable, and consistently implemented model, rather than the product of a fragmented community and therefore insufficiently mature to adopt.

To date, there have been a few different efforts to add CHERI support to Linux, with Arm’s Morello Linux prototype being the most mature and well supported. That implementation is focused on the Morello prototype architecture and microarchitecture, an MMU-enabled, high-performance design. In addition, Hesham Almatary at Capabilities Limited has developed a memory-safe variant of Linux targeted at MMU-less designs, based on CHERI-RISC-V. Finally, Huawei has also created a CHERI Linux prototype, focused on MMU-enabled CHERI-RISC-V, illustrating the feasibility of Linux on CHERI-RISC-V, but for technical and legal reasons it will not be a direct source for this work. It is our strong recommendation that Arm’s Morello Linux be the baseline for further work, used as a baseline against which further changes will be made (and, for existing work, merged).

One goal early in this work will be to develop a strategy for repositories and infrastructure to use in development work, as we migrate from a “Morello Linux” to a “CHERI Linux”. In doing so, it may be sensible to create a set of new “CHERI Linux” repositories where contributors from various organizations (academic, industrial, government) can collaborate in a vendor-neutral manner. A first engineering step, therefore, would be to bring in Arm’s work, as a collaborative activity, with suitable observation of, and management of, sensitivities about ownership, technical direction, and so on. There are other significant “people-focused” concerns about how to create a productive development community; however, the remainder of this document is focused on the technical roadmap rather than those topics, as we consider that roadmap to be a necessary input to joint planning required to create a broader plan.

The current major targets of this roadmap are in the areas of toolchain, emulation and crossbuild platforms, kernel support, and user space.
