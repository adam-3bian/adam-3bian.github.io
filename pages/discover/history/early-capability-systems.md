---
title: Early Capability Systems
permalink: /discover/history/early-capability-systems/
summary: Long before CHERI, capability systems explored how computers could grant precise authority instead of trusting every address equally.
parent: /discover/
next_page_url: /discover/history/cambridge-and-sri/
---

# Early Capability Systems

How should a computer decide whether a program may read a file, change a device, or call a service? Conventional systems often answer with a combination of user identity, page tables, and checks made by privileged software. Capability systems developed a different idea: give a program an unforgeable reference that both identifies a resource and carries the authority to use it.

That idea predates CHERI by decades.

## The capability idea

In a capability system, possession of a valid capability is part of the authorisation decision. A capability can be compared to an access card that opens one room, rather than a note containing the room’s address. Copying the room number does not create a working access card.

Early work in the 1960s described capabilities as protected references to objects. During the 1970s and 1980s, systems including the Cambridge CAP computer, Carnegie Mellon’s Hydra, the Plessey System 250, and IBM’s System/38 explored capability-oriented protection in hardware and operating systems.

These systems differed substantially. Some used tagged memory to distinguish protected values from ordinary data. Some made every operating-system object accessible through capabilities. Others combined capabilities with additional access-control mechanisms.

## What the early systems demonstrated

The early capability machines established several principles that remain useful:

- Unforgeability: ordinary software should not be able to invent authority by writing a number.
- Least privilege: a component should receive only the authority required for its task.
- Delegation: a component can pass a limited capability to another component without granting all of its own authority.
- Object-oriented protection: access can be tied to a specific object or service, not just a large memory region.
- Protected representation: hardware or trusted software must preserve the difference between authority and ordinary data.

They also showed that capability-based operating systems could support practical computing rather than remaining a purely theoretical model.

## Why capabilities did not replace conventional architectures

Technical merit is not enough to displace a software ecosystem. Mainstream processors, operating systems, compilers, and applications converged around virtual memory, integer-like pointers, and C-language interfaces. Capability machines often required specialised hardware and software, while compatibility with existing code and performance expectations varied.

As general-purpose systems grew, page-based virtual memory became the common hardware boundary. It isolates processes effectively, but a page is much larger than most language objects and a process often contains many components with different security needs.

The engineering challenge was therefore to combine fine-grained capabilities with the architectures and software that industry already used.

## The connection to CHERI

CHERI revisits capability protection with several modern design goals:

- extend established instruction-set architectures rather than require an entirely separate computing model
- support conventional virtual memory alongside capabilities
- work efficiently with compiled C and C++
- enable hybrid migration as well as pure-capability software
- provide fine-grained compartmentalisation within applications and operating systems
- use protected tags so software cannot forge a valid capability from ordinary bytes

CHERI is not a direct copy of any one early machine. It draws on the capability tradition while responding to modern processors, language application binary interfaces (ABIs), caches, operating systems, and large software stacks.

## Why this history matters

Capability security has a long record of implementation and analysis. CHERI’s contribution is to translate those protection ideas into an architecture designed for current hardware-software ecosystems. Understanding the earlier systems makes the design objective clearer: preserve the authority carried by a reference without giving up the software and performance models on which modern computing depends.
