---
title: 👮 MMU-less Systems WG
where-next:
  url: /groups/os-support-and-portability/
  title: OS Support & Portability
summary: Examines CHERI protection and compartmentalisation for systems that share an address space and do not depend
  on a conventional memory-management unit.
group_type: Technical
collaboration_areas:
- Shared-address-space systems
- Embedded compartment models
- Resource and real-time constraints
links:
- label: Back to all working groups
  url: /alliance/leadership/working-groups/
  kind: navigation
- label: Enquire about this group
  url: /alliance/membership/contact/
  kind: resource
  primary: true
---

The goal of this WG is to discuss designs for a broad range of CHERI systems where the common theme is that they operate on a shared single address space between processes. The three main categories of systems that I have in mind are:

- Embedded single-address space physical memory systems. This includes systems like CHERIoT.
- Application-class single-address space physical memory systems. This expects large physical memories where processes reside permanently because dynamically managing process memory in this setting is difficult, and supporting disk swap may not be easy.
- Application-class single-address space virtual memory systems. This uses virtual memory solely to virtualize physical memory, facilitating dynamic process memory management and supporting disk swap, while capabilities manage all access control.

It is important to discuss both the hardware and software aspects of such a design. For instance, a traditional POSIX fork call cannot work in a single-address space setting. In general, we should discuss how to redesign system calls to work in this single-address space setting.

We will also propose and discuss other designs that broadly fall into the category of CHERI-based single-address space systems, or systems that don’t require traditional MMUs.
