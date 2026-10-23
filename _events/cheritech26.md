---
layout: detail
title: CHERITech'26
summary: A two-day CHERI technical programme at **Electronica** / **SEMICON Europa** in Munich, connecting implementation work with the wider
  electronics industry.
permalink: /events/cheritech26/
slug: cheritech26
navigation:
  header:
    category: News & Events
    subcategory: Events & Archive
image:
  src: /assets/images/events/cheritech26.webp
  alt: CHERITech'26
  width: 640
  height: 360
  fit: cover
date: '2026-11-12'
end_date: '2026-11-13'
event:
  format: conference
  series: cheritech
  location:
    venue: Electronica / SEMICON Europa, Munich Messe - Hall B0, Munich, Germany
  timezone: Europe/Berlin
  registration:
    url: /events/cheritech26/#register
    label: Register for CHERITech’26
  organisers:
  - organisation: cheri-alliance
    role: organiser
  schedule:
  - date: '2026-11-10'
    label: Exhibition only
    sessions:
    - type: exhibition
      title: CHERI area
      description: 10 booths from our members will be demonstrating CHERI in Hall B0.
  - date: '2026-11-11'
    label: Exhibition only
    sessions:
    - type: exhibition
      title: CHERI area
      description: 10 booths from our members will be demonstrating CHERI in Hall B0.
  - date: '2026-11-12'
    label: Conference and Exhibition
    sessions:
    - type: introduction
      title: Introduction
      start: '13:00'
      presentations:
      - title: Introduction to Day 1
    - type: keynote
      title: Keynotes
      start: '13:05'
      end: '14:20'
      presentations:
      - title: Keynote
        start: '13:05'
        speakers:
        - name: Yona Raekow
          affiliation: BSI
      - title: With CHERI, can we afford to ignore hardware security?
        start: '13:20'
        speakers:
        - name: Joerg Bormann
          affiliation: Siemens
      - title: Introduction and State of CHERI
        start: '13:40'
        affiliation: University of Cambridge
        speakers:
        - person: jonathan-woodruff
      - title: Progress of the Alliance
        start: '14:00'
        affiliation: CHERI Alliance
        speakers:
        - person: mike-eftimakis
    - type: break
      title: Break and exhibition
      start: '14:20'
    - type: session
      title: Case studies
      start: '14:30'
      end: '15:25'
      presentations:
      - title: Opportunities for CHERI in the Energy Industry
        speakers:
        - name: Joshua Cooper
          affiliation: Hildebrand
      - title: Core to edge IoT security with CHERI
        affiliation: UM Labs
        speakers:
        - person: peter-cox
      - title: 'Building a Network Security Product on CHERI: Early Insights'
        speakers:
        - person: martin-atkins
        - name: Divya Atkins
          affiliation: Mission Critical Applications
      - title: Beyond the tech and what it takes to create a market for CHERI
        affiliation: PA Consulting
        speakers:
        - person: manu-ravishankar
    - type: session
      title: Round table
      start: '15:25'
      presentations:
      - title: 'Panel: What is missing for CHERI to be widely adopted?'
        description: 'Host: Christopher Bennison. Panellists: Javier Orensanz Martinez, Joshua Cooper and Mike Eftimakis — IoT Security Foundation;
          lowRISC; Hildebrand Technology Limited; CHERI Alliance'
    - type: session
      title: Posters
      start: '15:45'
      presentations:
      - title: High performance CHERI tag controller
        affiliation: University of Cambridge
        speakers:
        - person: alexandre-joannou
      - title: 'CheriBSD on RISC-V VP++: A fast virtual prototype for latest RVY 0.9.9'
        speakers:
        - name: Andreas Hinterdorfer
          affiliation: Johannes Kepler University Linz, Institute for Complex Systems
    - type: break
      title: Break and exhibition
      start: '15:50'
    - type: session
      title: Standards
      start: '16:00'
      end: '16:45'
      presentations:
      - title: Mapping the ETSI Memory-Safety Technical Standard to CHERI
        affiliation: Capabilities Limited
        speakers:
        - person: graeme-jenkinson
      - title: CHERI Specification and Standardisation Update for RV64Y, RV32Y and CHERIoT
        affiliation: Codasip
        speakers:
        - person: tariq-kurd
      - title: A Standard for CHERI Capability Transport over AXI and CHI
        affiliation: CHERI Alliance / Codasip
        speakers:
        - person: ben-fletcher
    - type: session
      title: Hardware
      start: '16:45'
      end: '17:30'
      presentations:
      - title: 'CVA6-CHERI: Ratified Specification Implemented and Vector Support Planned'
        affiliation: Capabilities Limited
        speakers:
        - person: jonathan-woodruff
      - title: 'CHERI in OpenTitan: application of memory safety best practice in an open hardware root of trust'
        affiliation: lowRISC
        speakers:
        - person: javier-orensanz-martinez
      - title: Building Memory Safety into a DMA Engine with CHERI
        affiliation: CHERI Alliance / Codasip
        speakers:
        - person: ben-fletcher
    - type: networking
      title: Reception and exhibition
      start: '17:30'
    - type: closing
      title: End of Day 1
      start: '18:30'
    label: Thursday
  - date: '2026-11-13'
    label: Conference and Exhibition
    sessions:
    - type: introduction
      title: Introduction
      start: '10:00'
      presentations:
      - title: Introduction to Day 2
    - type: session
      title: Compartmentalisation
      start: '10:05'
      end: '11:15'
      presentations:
      - title: CHERI-Zephyr and Compartmentalisation of Userspace Threads
        affiliation: University of Birmingham
        speakers:
        - person: jennifer-jackson
      - title: Compartmentalizing a CANopen stack with CHERIoT
        speakers:
        - name: Hugo Melder
          affiliation: Technical University of Munich
      - title: Efficient Linkage-Based Compartmentalization on CHERI
        speakers:
        - name: Dapeng Gao
          affiliation: University of Cambridge
      - title: 'LittleCHERI: Ultra-Fine-Grain Compartmentalization using Secure Stack-Sharing on CHERI Capability Machines'
        speakers:
        - name: Elias Storme
          affiliation: DistriNet, KU Leuven
    - type: break
      title: Break and exhibition
      start: '11:15'
      presentations:
      - title: Break 3
    - type: session
      title: Software and research
      start: '11:30'
      end: '13:25'
      presentations:
      - title: 'SignetOS: Designing a Secure and Fast Single-Address-Space Microkernel to Support Modern Workloads'
        speakers:
        - name: John Kressel
          affiliation: Google
      - title: 'ftrace on CHERI Linux: porting a fairly complex kernel subsystem'
        speakers:
        - name: Martin Kaiser
          affiliation: Codasip
      - title: Title withheld (paper under submission)
        speakers:
        - name: Nils Jordan
          affiliation: Ericsson
      - title: Using existing CHERI semantics for CHERI-native temporal safety
        speakers:
        - name: Yuecheng Wang
          affiliation: University of Cambridge
      - title: 'Valid, In-Bounds, and Wrong: Analysis of Fault Injection Attacks Against CHERI Capabilities'
        speakers:
        - name: Jan Philipp Thoma
          affiliation: Codasip
      - title: Intra-allocation bounds enforcement in CheriBSD
        affiliation: University of Cambridge
        speakers:
        - person: alfredo-mazzinghi
      - title: Writing applications for CHERIoT in Rust
        affiliation: SCI Semiconductor
        speakers:
        - person: edoardo-marangoni
    - type: closing
      title: Conclusion
      start: '13:25'
      presentations:
      - title: Conclusion to Day 2
    - type: closing
      title: Talks end and exhibition
      start: '13:30'
    label: Friday
resources:
- type: website
  label: Electronica
  url: https://electronica.de/en/
- type: website
  label: SEMICON Europa
  url: https://www.semiconeuropa.org/
- type: website
  label: CHERITech
  url: /news-and-events/events-and-archive/cheritech/
related:
- type: page
  slug: news-and-events-events-and-archive-upcoming-events
  relation: navigation
- type: page
  label: CHERITech
  slug: news-and-events-events-and-archive-cheritech
  relation: navigation
---

## Overview

CHERITech’26 brings the CHERI technical community to [Electronica](https://electronica.de/en/) / [SEMICON Europa](https://www.semiconeuropa.org/), connecting the latest developments in hardware, software, standards and real-world implementation with the wider semiconductor and electronics industry. The event is organised by the **CHERI Alliance** in collaboration with **SEMI**, organiser of SEMICON Europa.

Whether CHERI is new to you or already on your technology roadmap, join us to **learn** from early implementations, see the **technology in action**, ask questions and **connect** with the organisations shaping what comes next.

[Register for CHERITech’26](/events/cheritech26/#register){: .button } [View CHERITech’26 programme](/events/cheritech26/#programme-title){: .button }

## CHERI meets the semiconductor industry

![Munich Messe](/assets/images/events/cheritech26/53367353357-e4e8ac7171-o.webp){: .image-right }

The next step in secure computing is happening at the hardware level.

CHERI provides a stronger foundation for cybersecurity by adding hardware-enforced protections that help software use memory more safely and support fine-grained compartmentalisation.

At CHERITech’26, organisations from across industry and research will share progress in CHERI implementation, applications, standards, hardware, software and security evaluation. The conference takes place within Electronica / SEMICON Europa, giving its **80,000 visitors** the opportunity to discover CHERI and putting the technology at the heart of the wider semiconductor and electronics community.

CHERITech is not just about watching presentations. Participants can ask questions, join discussions, explore exhibits and use the networking sessions to meet the people developing, evaluating and applying CHERI.

[Watch CHERITech’25 event overview](https://youtu.be/PeMYZsSoUto?si=N1JnyQct5OmABfEa)

## Why attend?

![Munich Messe](/assets/images/events/cheritech26/munich-messe.webp){: .image-left }

Whether you're new to CHERI or already building with it, CHERITech’26 is an opportunity to:

- get up to speed
- learn from real implementations
- see where the technology is heading
- meet the people working on CHERI

Hear directly from organisations working across hardware, software, standards and real-world applications, see **CHERI in action** through demonstrations and exhibits, ask questions, exchange ideas and **make connections** with the people shaping the ecosystem.

## Hear from organisations across the ecosystem

CHERITech’26 brings together speakers from cybersecurity, semiconductors, technology companies and leading universities.

The programme includes contributions from **BSI, Siemens, Google, Ericsson, Codasip, lowRISC, PA Consulting, SCI Semiconductor, Capabilities Limited, the University of Cambridge, the Technical University of Munich** and many others.

**Get a front-row view of where CHERI is heading**. Across two packed days, discover real-world applications, emerging standards and the latest advances in hardware, software, compartmentalisation and security research. Hear directly from the people building with CHERI, see how the technology is evolving across the stack, and join the conversations shaping what comes next.

## Register

### CHERITech’26 is free to attend for SEMICON Europa visitors

*A valid SEMICON Europa ticket is required for each day on which you wish to attend CHERITech’26.*

The registration process has **two steps**:

1. [**Purchase a valid SEMICON Europa ticket**](https://tickets.messe-muenchen.de/MM-SHOP/SEM26/){: .button }
2. [**Register separately for CHERITech’26**](https://discover.semi.org/cheritech26-powered-by-cheri-alliance-registration.html){: .button }


## See CHERI in action

Exhibits and demonstrations run alongside the conference programme, giving visitors the opportunity to explore CHERI technology up close and talk directly with the organisations developing it.

Exhibitor booths will be open throughout SEMICON Europa, from **10 to 13 November 2026**, not only during the CHERITech sessions.

| --- | --- | --- |
| ![Capabilities Limited logo](/assets/images/organisation/capabilities-limited.webp){: .image-full } | ![CHERI Alliance logo](/assets/images/organisation/cheri-alliance.webp){: .image-full } | ![CHERI Research Centre logo](/assets/images/organisation/university-of-cambridge.webp){: .image-full } |
| ![Codasip logo](/assets/images/organisation/codasip.webp){: .image-full } | ![lowRISC logo](/assets/images/organisation/lowrisc.webp){: .image-full } | ![PA Consulting logo](/assets/images/organisation/pa-consulting.webp){: .image-full } |
| ![Parvat logo](/assets/images/organisation/parvat-infotech.webp){: .image-full } | ![SCI Semiconductor logo](/assets/images/organisation/sci-semiconductor.webp){: .image-full } | ![UM-Labs logo](/assets/images/organisation/um-labs.webp){: .image-full } |


## Venue - Find us in Hall B0!

![Hall B0 floorplan](/assets/images/events/cheritech26/hall-floorplan-2.webp){: .image-right }
![Munich Messe](/assets/images/events/cheritech26/53368566214-a49da891b9-o.webp){: .image-left }

**NextSEMI Arena, Hall B0**  
**Messe München**  
**81823 München, Germany**

Visit the SEMICON Europa website to get:

- [hall floorplans](https://expo.semi.org/europa2026/Public/EventMap.aspx?ID=32646&shAvailable=1&thumbnail=1)
- [directions / public transport information and hotel assistance](https://www.semiconeuropa.org/about/travel-and-hotels).

## Event dates and context

12-13 November 2026 (**Conference**) - 10-13 November 2026 (**Exhibition**)

