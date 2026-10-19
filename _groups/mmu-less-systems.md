---
title: 👮 MMU-less Systems WG
where-next:
  url: /groups/os-support-and-portability/
  title: OS Support & Portability
---

1. Alliance
2. About &amp; Governance
3. 👮 MMU-less Systems WG
{: .source-breadcrumbs }

# 👮 MMU-less Systems WG
{: id="page-hero-title" .page-hero-title }

Examines CHERI protection and compartmentalisation for systems that share an address space and do not depend on a conventional memory-management unit.
{: .page-hero-summary }

The goal of this WG is to discuss designs for a broad range of CHERI systems where the common theme is that they operate on a shared single address space between processes. The three main categories of systems that I have in mind are:

- Embedded single-address space physical memory systems. This includes systems like CHERIoT.
- Application-class single-address space physical memory systems. This expects large physical memories where processes reside permanently because dynamically managing process memory in this setting is difficult, and supporting disk swap may not be easy.
- Application-class single-address space virtual memory systems. This uses virtual memory solely to virtualize physical memory, facilitating dynamic process memory management and supporting disk swap, while capabilities manage all access control.

It is important to discuss both the hardware and software aspects of such a design. For instance, a traditional POSIX fork call cannot work in a single-address space setting. In general, we should discuss how to redesign system calls to work in this single-address space setting.

We will also propose and discuss other designs that broadly fall into the category of CHERI-based single-address space systems, or systems that don’t require traditional MMUs.

Group type
: Technical

Areas of collaboration
: - Shared-address-space systems
  - Embedded compartment models
  - Resource and real-time constraints
{: .entity-facts }

[Enquire about this group](/alliance/membership/contact/)
{: .entity-primary-link }

[Back to all working groups](/alliance/leadership/working-groups/)
{: .entity-back }

## Where next
{: .where-next-title }

### [OS Support &amp; Portability](/groups/os-support-and-portability/)
{: .where-next-card-title }





[Compare operating-system interfaces and portability across CHERI projects.](/groups/os-support-and-portability/)
{: .where-next-summary }



[Continue](/groups/os-support-and-portability/)
{: .source-card-label }
