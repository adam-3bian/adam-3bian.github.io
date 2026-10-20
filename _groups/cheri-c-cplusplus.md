---
layout: details/working-group
title: ©️ CHERI C/C++ WG
summary: Coordinating portable C and C++ support for CHERI platforms.
permalink: /groups/cheri-c-cplusplus/
slug: cheri-c-cplusplus
navigation:
  header:
    category: CHERI Alliance
    subcategory: Leadership
working_group:
  type: technical
  focus_areas:
  - Language and ABI behaviour
  - Compiler and toolchain experience
  - Portability and standards
forms:
- contact
related:
- type: working_group
  slug: cheri-in-soc
  relation: next_step
- type: page
  slug: alliance-leadership-working-groups
  relation: navigation
---

## Overview

The C/C++ Working Group aims to ensure portability for C and C++ code written for CHERI platforms.

CHERI provides memory safety for C-like languages. Every CHERI implementation will trap on buffer overflows in C and many will trap on use-after-free. Beyond that, C compilers provide builtins for CHERI-specific and CHERI-implementation-specific features, additional headers, and so on.

This working group has two overlapping goals:

- To coordinate between CHERI C/C++ implementations to ensure portability.
- To work with ISO WG14 and WG21 to ensure long-term alignment of the C and C++ standards with CHERI.
