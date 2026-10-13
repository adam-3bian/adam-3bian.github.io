---
title: CHERI or CHERIoT? The Answer Is Not What You Think
image_url: null
published_date: null
authors:
- adam-finney
related:
  groups: []
  organisations: []
  hardware: []
  software: []
  papers: []
---

# CHERI or CHERIoT? The Answer Is Not What You Think

Interest in capability based security has grown rapidly as organisations look for practical ways to move beyond legacy memory protection. As more projects explore CHERI technologies, a common question keeps surfacing: should we use CHERI or CHERIoT? At first glance it sounds like a straightforward architectural decision, but as David Chisnall from SCI Semiconductor points out, the question itself rests on a false premise.

CHERI is not a product or a platform. It is an abstract architectural model that can be expressed on many instruction sets and embodied in many designs. It defines the capability based ideas that make fine grained memory safety possible, but leaves enormous freedom in how those ideas are implemented. By contrast, CHERIoT is a concrete instantiation of CHERI aimed at resource constrained microcontroller class systems. It comes with a complete ISA, a software stack and design choices made specifically for small devices.

Understanding this distinction is important for anyone planning a CHERI based system. The real choice is not between CHERI and CHERIoT. It is between adopting CHERI at all and then selecting the right CHERI platform for the scale of hardware you are targeting. CHERIoT serves one part of that landscape. Other CHERI variants serve others.

In the article that follows, David explains why the “CHERI or CHERIoT” framing does not hold, what makes CHERIoT unique and how to think clearly about which CHERI approach fits your project or product.

https://cheriot.org/cheri/philosophy/isa/2025/11/19/cheri-or-cheriot.html
