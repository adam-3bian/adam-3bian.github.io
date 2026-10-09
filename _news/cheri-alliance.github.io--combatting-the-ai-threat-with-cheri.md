---
title: Combatting the AI threat with CHERI
layout: source-github
permalink: /sources/cheri-alliance.github.io/news/combatting-the-ai-threat-with-cheri/
date: '2026-06-17T11:00:33+01:00'
---

1. News &amp; Events
2. News &amp; Analysis
3. Combatting the AI threat with CHERI
{: .source-breadcrumbs }

# Combatting the AI threat with CHERI
{: id="page-hero-title" .page-hero-title }

In 2025 alone, global cybercrime costs reached an estimated $1.2 billion every minute, with projections rising to $1.8 billion per minute by 2029. Just seven years earlier, the figure was “only” $100 million per minute—already enormous, but now…
{: .page-hero-summary }

*17 June 2026*{: .source-date }
*CHERI Alliance news*{: .collection-tag }
*Members*{: .collection-tag }
{: .collection-detail__metadata .source-div-text }

![Augmented reality showing a ship.](/assets/news/combatting-the-ai-threat-with-cheri/13658ea5e276-hero.png){: .image-full }
{: .collection-detail__lead-image }

Peter Cox –

[UM Labs](https://cheri-alliance.github.io/members/um-labs/)

[UM Labs](https://cheri-alliance.github.io/members/um-labs/) is a cybersecurity developer specialising in protecting real-time communications on IP networks. Real-time services deliver time critical data for sensitive and mission-critical communication. Our products are widely deployed in government, defence and commercial networks. [UM Labs](https://cheri-alliance.github.io/members/um-labs/) has joined the CHERI Alliance and adopted CHERI in our development, test and support procedures to strengthen our defences against the continuously evolving threat. Cybersecurity has always been an arms race. Developers work to improve security technology prompting attackers to search for new vulnerabilities. The pace of this arms race has accelerated as attackers employ AI in the search. Developers need a new defence; CHERI is a powerful new tool in the cybersecurity tool-kit.

The UM Labs Unicus® platform protects applications ranging from voice and video calls, surveillance video, extended reality and IoT. These applications share some common attributes. Transmitted data contains highly sensitive and commercially valuable information which must be transmitted in real-time. Data privacy and integrity must be protected and devices generating and processing data must be protected from attack. To meet these requirements, Unicus implements a Core/Edge architecture. A core system, typically deployed in a public or private cloud manages multiple edge devices. Edge devices are deployed as low-end Arm or Intel processors securing an end-user system or IoT device or running as an embedded system in the protected device.

![](/assets/news/combatting-the-ai-threat-with-cheri/e8cc99611ba5-um-labs-blog-img-1.png){: .image-full }

The Core/Edge combination provides end-to-end security including the use of Post Quantum Cryptography where needed. Core and Edge systems share the same internal design implementing security controls at the network, application and content levels. Application-level security means providing a full implementation of the relevant protocols, for example SIP for voice and video calls, RTSP for streaming video and extended reality and MQTT for IoT applications. Content level security has similar requirements, but different protocols must be implemented, for example RTP and SRTP. This layered security architecture is implemented with proprietary code supported by a number of open-source packages.

Since joining the CHERI alliance, we have implemented both Core and Edge systems on Morello CHERI using Morello QEMU via cheribuild and on hardware using a Morello prototype running CheriBSD. This involved compiling and running our own code and some open-source packages where ports were not available. The build stage identified potential problems with both [UM Labs](https://cheri-alliance.github.io/members/um-labs/) code and open-source packages.

![UM-Labs software architecture detail](/assets/news/combatting-the-ai-threat-with-cheri/fe185b1f0355-um-labs-blog-aside-1.png){: .image-full width="400" height="364" }

Our own code required a total of 52 mostly minor changes (35 for Edge, 17 for Core). Changes were also needed for some open-source packages these included alignment warnings and changes to adapt the code, originally developed on Linux, to CheriBSD. The port covered all security layers in our software from network connectivity to application and content protocols. The changes made as a result of porting and testing on CHERI benefit our software on all platforms, not only CHERI, as the changes made to address the potential fault were merged with our core code. The total effort spent so far on building Unicus Core and Edge on CHERI is estimated as 460 hours (approx. 3 months). The code base ported had taken several years to develop.

Porting to CHERI Linux may have saved some time, but a port to FreeBSD was already planned, so CheriBSD was an obvious choice.

Once the port was complete, we started a round of extended run-time tests using the Morello CHERI hardware. So far, these tests have covered Unicus Core, processing voice and video calls using SIP and Unicus Edge, processing streaming video.

|  |  |  |  |
| --- | --- | --- | --- |
| **Unicus Component** | **Application** | **Protocols covered** | **Test Duration** |
| Core | VoIP voice and video calls | SIP, SDP, RTP, SRTP | 2 weeks, 100 connected phones, 500,000 calls |
| Edge | Steaming Video | RTSP, SDP, RTP | 2 weeks, 350 hours video streaming |

The run-time tests were conducted to identify CHERI detectable problems triggered by processing normal data, so far none have been detected. The next stage of testing will be to target the systems with a range of attacks.

Our work with CHERI has enabled us to identify and fix multiple potential issues any of which could leave our software open to attack. The risk posed has never been higher. Attackers are using AI to identify vulnerabilities and to craft exploits. CHERI reduces that risk by proactively identifying possible attack points. The 480 hours we have spent on CHERI ports and testing so far is a small investment against the much higher potential cost of security incident triggered by an undetected vulnerability.

[Back to Latest News](https://cheri-alliance.github.io/news-and-events/news-and-analysis/latest-news/)
{: .collection-detail__back }
