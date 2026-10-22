---
layout: page
title: How does CHERI work?
summary: Helping software stay within its boundaries.
permalink: /discover/understand/how-does-cheri-work/
slug: discover-understand-how-does-cheri-work
navigation:
  header:
    category: Discover CHERI
    subcategory: Understand CHERI
related:
- type: page
  slug: build-technology-cheri-and-rust-technical
  relation: next_step
- type: page
  slug: discover-understand-adapt-products
  relation: related
- type: page
  slug: discover-understand-cheri-and-existing-software
  relation: related
---

## Overview

At the heart of CHERI is a simple idea: the processor should understand the boundaries **intended** by the developer and prevent software from exceeding them.

## Today’s systems trust software too much

Today’s processors access memory using [pointers](/discover/resources/glossary/#glossary-p), which represent an address in memory. A pointer is essentially a number managed entirely by software. Memory is largely an open book: software can read, write, or execute wherever a pointer leads it, with few built-in checks on whether that access was actually intended.

If a program contains a bug, a pointer can accidentally (or maliciously) be changed to access memory that it was never supposed to reach.

![Traditional pointers vs capabilities](/assets/images/shared/pointer-vs-capability.webp){: .image-full }

## Capabilities: pointers with built-in protection

CHERI enhances processors with a new type of pointer called a [**capability**](/discover/resources/glossary/#glossary-c). CHERI capabilities contain additional information describing what access a piece of software has been granted, much like an access card controls which areas of a building someone can enter.

In a CHERI system, any part of the memory can only be accessed with a capability, which describes:

- A memory location
- The exact bounds of the memory area that can be accessed
- Permissions such as read, write, or execute
- Additional metadata used by the processor to enforce security rules

Capabilities are checked **every time** memory is accessed.

## Hardware-enforced security

The processor enforces the rules carried by each capability. Whenever software accesses memory, the processor checks that the operation stays within the capability’s permitted bounds and permissions. Any attempt to exceed those limits is **blocked** before it can affect the system.

By design, software cannot **create** new capabilities from nothing or grant itself additional privileges. New capabilities can only be **derived** from existing ones, and only with the same or fewer permissions.

Protection is built into the hardware rather than relying solely on software checks.

## Compartmentalisation

![Compartmentalisation prevents contagion](/assets/images/shared/compartmentalisation.webp){: .image-right }

Capabilities can also be used to create secure compartments: isolated parts of a system that have access only to the resources they need. A compartment might be:

- An application
- A library
- A service
- A security-critical function

Each compartment receives its own capabilities and cannot freely access the memory of other compartments. CHERI makes it practical to create and manage **large numbers** of **small** compartments with **very low overhead**. This enables much finer-grained isolation than traditional security approaches, without the important performance penalty.

This approach, known as compartmentalisation, helps contain bugs and security vulnerabilities, preventing problems in one part of a system from affecting everything else. The smaller the compartment, the smaller the impact of a bug or attack.

## Working with existing software

CHERI was designed to support and reuse existing software. Much of the work required to convert existing software is handled **automatically** by CHERI-aware compilers. When software contains memory-safety issues or relies on ambiguous behaviour, or to add compartmentalisation, some changes may be required, but they are often relatively small compared to the security benefits gained.

Applications, operating systems, libraries, and firmware can be adapted incrementally, allowing organisations to progressively benefit from increased hardware-enforced memory protection and compartmentalisation while continuing to use large amounts of existing code.

## In summary

CHERI introduces capabilities, an enhanced form of pointer that carries information about what memory can be accessed and how it can be used. By enforcing these rules in hardware and enabling fine-grained compartmentalisation, CHERI provides a foundation for building more secure and resilient systems.
