---
title: Background reading
permalink: /reference/CHERI-seL4-Exercises/introduction/background.html
summary: null
image_url: null
updated_date: null
parent: /CHERI-seL4-Exercises/
next_page_url: null
related:
  pages: []
  people: []
  organisations: []
  groups: []
  news: []
  events: []
  papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

# Background reading

To perform these exercises most effectively, we recommend first building a working knowledge of CHERI and seL4. The most critical references will be the Introduction to CHERI and CHERI C/C++ Programming Guide, but there is a broad variety of other reference material available regarding CHERI, seL4, and Microkit:

An Introduction to CHERI - An overview of the CHERI architecture, security model, and programming models.

CHERI C/C++ Programming Guide - This use of CHERI capabilities to represent C/C++ pointers requires modest changes to the way C and C++ are used. This document describes those changes.

Capability Hardware Enhanced RISC Instructions: CHERI Instruction-Set Architecture (Version 9) - Instruction reference and design discussion.

CHERI-RISC-V specification - RISC-V Specification for CHERI Extensions.

seL4's Microkit - Microkit User Manual.

seL4 Manual - seL4 Reference Manual.

CheriABI: Enforcing Valid Pointer Provenance and Minimizing Pointer Privilege in the POSIX C Run-time Environment - This paper describes the CheriABI pure-capability process environment. An extended technical report is also available. CheriABI is not implemented in CHERI-Microkit, but it is worth reading.

Complete spatial safety for C and C++ using CHERI capabilities - This PhD dissertation provides an extensive overview of the CHERI-MIPS linking model (also relevant to the current CHERI-RISC-V model), an implementation of opportunistic subobject bounds, and general C/C++ compatibility issues.
