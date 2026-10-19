---
title: Beyond Software Patching
date: '2026-09-11T12:47:46+00:00'
authors: [jim-wallace]
---

1. News &amp; Events
2. News &amp; Analysis
3. Beyond Software Patching
{: .source-breadcrumbs }

# Beyond Software Patching
{: id="page-hero-title" .page-hero-title }

*11 September 2026*{: .source-date }
*CHERI Alliance news*{: .collection-tag }
*Ecosystem*{: .collection-tag }
{: .collection-detail__metadata }

Jim Wallace – **CHERI Alliance / Cre8Vantage**


![CHERI logo](/assets/news/beyond-software-patching/bb1ce7a6a7-cheri-logo.png){: .image-right }
{: .collection-detail__lead-image }

## How CHERI Can Limit the Blast Radius in Long-Life CNI Systems


Critical National Infrastructure (CNI) products may remain in service for 10, 15 or even 20 years. During that time, software changes, attack techniques evolve and regulation is now becoming more demanding.

No product team or company can guarantee that every defect will be found before deployment. The more practical question is:

**If your product is compromised in the field, can its underlying platform limit the compromise and prevent a much wider and more costly impact across the infrastructure?**

This is one of the central problems CHERI can help address.

![Long-life utility platforms must keep evolving without allowing each new software component to enlarge the blast radius of a failure.](/assets/news/beyond-software-patching/80ee4d1338-beyond_software_patching_blog_1.png){: .image-full width="955" height="537" } 

Long-life utility platforms must keep evolving without allowing each new software component to enlarge the blast radius of a failure.
{: .image-caption }


## The cost often extends far beyond "just the patch"


A memory-safety flaw in a communications or control component can quickly become an operational and lifecycle problem. Recent disclosures illustrate the consequences:

[CVE-2026-42945](https://www.cisa.gov/news-events/ics-advisories/icsa-26-188-03) in Hitachi Energy’s e-mesh EMS is a remotely reachable heap-buffer overflow that can cause denial of service and, in some configurations, potentially remote code execution.

In Rockwell Logix controllers, [CVE-2025-12011](https://www.rockwellautomation.com/en-gb/trust-center/security-advisories.html) shows a different consequence: specially crafted EtherNet/IP traffic can force a major non-recoverable fault requiring onsite recovery and a verified software re-download.

For manufacturers, having one such defect can mean identifying affected products and firmware versions, developing and validating fixes, repeating security and regression testing, gaining operator approval and supporting deployment across a long-lived installed base. For operators, it may mean disruption, emergency workarounds, maintenance windows and site visits.

Worse still, the collection of CVEs named [Ripple20](https://ordr.net/learn/ripple20-how-to-identify-protect-devices) showed how those costs can multiply when vulnerable software is shared across many products and suppliers. What began as vulnerabilities in one TCP/IP stack became a distributed remediation problem across an ecosystem and many affected devices and use cases.

Firewalls, authentication and intrusion detection remain essential, but they cannot guarantee that malformed or malicious input will never reach vulnerable code. The important question is what happens when it does.

CHERI can prevent memory-safety attacks from succeeding through hardware-enforced memory protection, while CHERI-enabled compartmentalisation can contain the impact of other compromises by limiting what affected software is able to access.

For long-life CNI equipment, that can mean the difference between a contained local software failure and a wider platform compromise — with very different operational and remediation costs.

Our earlier article, [From Cyber Shock to Silicon Trust](https://cre8vantage.com/2025/11/02/from-cyber-shock-to-silicon-trust/), explained why memory-safety vulnerabilities persist and why hardware-enforced protection matters. This article asks the more practical product question: where should a team begin, and what evidence should its first CHERI evaluation produce?

That question is becoming more urgent as the regulatory and commercial consequences of vulnerabilities increase.

## Why now: CRA raises the cost of vulnerabilities


The [EU Cyber Resilience Act (CRA)](/news/the-eu-cyber-resilience-act-what-it-means-for-secure-by-design-systems-and-cheri/) is already in force. Reporting obligations for actively exploited vulnerabilities and severe security incidents apply from 11 September 2026, with the main product requirements applying from 11 December 2027.

The CRA makes manufacturers responsible for cybersecurity throughout a product’s lifecycle, from design and development through to vulnerability handling and secure updates. For connected utility and infrastructure equipment that can remain deployed for many years, this creates an ongoing engineering and support obligation.

The commercial consequences can be significant. Breaches of key CRA requirements can attract fines of up to €15 million or 2.5% of worldwide annual turnover, whichever is higher. Compliance itself can require substantial investment, while vulnerabilities discovered in deployed products can trigger investigation, reporting, remediation, validation and patch deployment.

Mandatory vulnerability and incident reporting also increases the potential business impact. A serious vulnerability is no longer only an engineering issue: it can expose a manufacturer to regulatory scrutiny, reputational damage and erosion of customer trust.

The challenge is therefore not only to demonstrate compliance, but to reduce the number and impact of vulnerabilities that have to be managed once products are deployed.

## What CHERI adds to existing protection


CHERI can strengthen the technical foundation for CRA compliance by adding fine-grained, hardware-enforced control over what memory and services software is authorised to access. This complements wider CRA requirements around risk management, reporting, documentation and secure updates, while helping reduce the engineering and vulnerability-management burden associated with meeting those obligations.

At the processor level, memory protection is already provided by technologies such as MPUs and MMUs. These remain important controls, typically separating memory regions, applications or processes from one another.

However, software operating legitimately within an allowed region may still be able to access more memory than it actually needs. If that software contains a vulnerability, an attacker may be able to use it to corrupt other data or functions within the same environment.

CHERI adds a much finer-grained layer of protection. It allows the processor to restrict what memory and services software is authorised to access, and what it is permitted to do with them.

For example, software processing incoming network data could be given access to its packet buffer without automatically gaining access to device credentials, cryptographic keys, metering data or control functions. If it attempts to reach outside that authority, the processor can block its access.

CHERI complements rather than replaces existing security controls:

- Secure boot and signed firmware help ensure authorised software starts; CHERI helps control what that software can access once it is running.
- MPUs, MMUs, processes, VMs and containers provide broader isolation boundaries; CHERI can add finer-grained protection within them.
- Memory-safe languages such as Rust can prevent many memory-safety defects, while CHERI provides hardware-enforced access control and compartmentalisation regardless of programming language. It can strengthen protection for existing C/C++ software without requiring a complete rewrite, while supporting a phased migration to memory-safe languages over time.

CHERI can also enable compartmentalisation, allowing individual software components to operate with only the authority they need. If one component is compromised, its ability to reach other parts of the system can be restricted.

For long-life CNI products, this combination of exploit prevention and hardware-enforced access limits can reduce the likelihood that a single vulnerability becomes a wider platform compromise — reducing remediation effort, operational disruption and wider business impact.

## A practical example: securing intelligence at the grid edge


Smart-metering systems traditionally separate metrology and tariff functions from wide-area communications, with both typically running on low-power microcontrollers.

That model is now being extended. As homes and neighbourhoods become more active participants in balancing supply and demand, they must increasingly coordinate solar PV, batteries, EV charging and heat pumps. This is also bringing more analytics, automation and AI towards the grid edge.

These workloads require substantially more processing, memory and software capability than traditional metering alone. Future grid-edge systems are likely to introduce higher-performance processors alongside existing MCU-based metering and communications functions.

One possible architecture retains a trusted Smart Metering Platform alongside a separate Energy Management System (EMS). The Smart Meter provides electricity-metering functions and connectivity through the Communications Hub Function (CHF) to the Data Communications Company ([DCC](https://www.smartdcc.co.uk/about-dcc/)). The Energy Management System provides local optimisation and control of Distributed Energy Resources (DER) such as EV chargers, batteries, solar inverters, heat pumps and other controllable loads.

The Energy Management System could decide when electricity should be consumed, stored, imported or exported. These decisions may take account of customer preferences, tariffs, weather forecasts, battery state, equipment availability and wider grid or market signals. This makes the optimisation layer a natural home for frequently changing applications, while the metering and communications functions remain within a more stable trusted subsystem.

Over time, third-party energy providers, aggregators or equipment suppliers may also introduce applications that participate in optimisation or flexibility services, increasing the importance of giving each component only the authority it requires.

![Figure 1: Greater intelligence at the grid edge across smart metering and energy management platforms](/assets/news/beyond-software-patching/dea3b9883d-Picture1.png){: .image-full width="1426" height="797" } 

Figure 1: Greater intelligence at the grid edge across smart metering and energy management platforms
{: .image-caption }


CHERI can strengthen this architecture by enforcing separation between software components. Communications software could exchange approved messages without being able to read cryptographic keys or invoke energy-control functions, while an analytics or optimisation application could use selected operational data without gaining access to billing information, device identity or the wider metering platform.

![Figure 2: CHERI can permit approved interfaces while blocking access between compartments by default](/assets/news/beyond-software-patching/d1b9354a30-Picture2.png){: .image-full width="1435" height="479" } 

Figure 2: CHERI can permit approved interfaces while blocking access between compartments by default
{: .image-caption }


If one compartment is compromised, attacker-controlled code can remain limited to the access that compartment was explicitly given, provided the boundaries and approved interfaces are correctly designed.

The affected software may still fail, but CHERI can help prevent that failure becoming a foothold from which an attacker can gain access or control across the wider platform.

## Start with the boundary that matters most


A useful CHERI evaluation should begin with a product risk analysis, not a plan to migrate the entire software stack.

Four questions usually reveal the strongest first candidate:

1. **Exposure:** Does the component process untrusted network, device or partner data?
2. **Consequence:** Is it close to keys, identity, billing, update authority or real-time control?
3. **Change:** Is it frequently updated, supplied by a third party or likely to host new analytics or AI?
4. **Recovery cost:** Would a defect trigger extensive testing, approval, recertification or physical intervention?

Good candidates include network-facing services such as protocol parsers and time-synchronisation services, update agents, device-management software, and third-party or fast-changing applications close to sensitive assets.

The strongest pilot is where exposure, consequence, change and recovery cost intersect.

Fast-changing applications are also particularly attractive because long-life platforms increasingly need to support workloads that were not anticipated when the product was first designed — from EV optimisation and battery coordination to predictive maintenance and local analytics.

As these workloads evolve and incorporate third-party or AI-assisted software, strong boundaries around them become increasingly valuable.

## From benchmarks to product evidence


Over the past few years, CHERI has moved from research and experimental platforms towards commercially available processor IP, evaluation systems, silicon and increasingly mature software support.

These include processor IP, Linux-capable FPGA platforms, CHERI-enabled silicon and open-source reference designs from organisations including [Codasip](/organisations/codasip/), [SCI Semiconductor](/organisations/sci-semiconductor/) and [lowRISC](/organisations/lowrisc/), with further commercial silicon programmes under development.

Product teams can now run representative software on CHERI platforms and generate evidence against their own performance, integration and security requirements, rather than relying primarily on generic benchmark results.

## A practical five-stage evaluation


A focused pilot can place one CHERI-enabled workload alongside an existing software stack. CHERI support is already available or under active development across major operating environments including Linux, FreeRTOS and Zephyr, reducing the need for product teams to start from scratch.

![Figure 3: A focused evaluation produces evidence before a wider platform commitment](/assets/news/beyond-software-patching/cef8c62f96-Picture3.png){: .image-full width="1402" height="469" } 

Figure 3: A focused evaluation produces evidence before a wider platform commitment
{: .image-caption }


**Identify**: Select one product, workload or security boundary with meaningful exposure and consequence.

**Evaluate**: Recompile a representative workload for a CHERI-enabled platform. Measure software compatibility, engineering effort, code size, performance and OS integration.

**Compartmentalise**: Define the minimum authority each component needs. Separate communications, applications, control functions and cryptographic assets.

**Validate**: Introduce representative faults or attack scenarios. Confirm whether invalid access is blocked, whether the affected component is prevented from accessing assets beyond its intended authority, and whether critical assets remain protected.

**Plan**: Use the evidence to guide processor selection, product roadmaps, assurance activity and procurement discussions.

This approach keeps the first step manageable and produces results using the company’s own code.

## What a successful evaluation should prove


A CHERI evaluation should answer a practical product question: does the additional security justify the engineering, performance and integration cost?

Using the company’s own software and realistic fault or attack scenarios, it should show whether CHERI can:

- reduce the routes from a vulnerable service to critical assets;
- prevent a compromised component from accessing assets beyond its intended authority;
- reduce the scope of remediation, regression testing and recertification;
- strengthen secure-by-design assurance for customers, operators and regulators;
- provide safer boundaries for third-party and rapidly changing software; and
- help extend the secure operational life of the product.

For CRA-regulated products, fewer vulnerabilities becoming successful exploits and stronger limits on what compromised software can access can mean less engineering time spent on investigation, remediation and field updates, while reducing operational, reputational and revenue risk.

The aim is not to prove CHERI in the abstract, but to test one meaningful boundary and use the evidence to inform processor selection, product roadmaps, assurance and procurement decisions.

For long-life CNI products, making that assessment before the next platform decision can help avoid carrying today’s security weaknesses into another generation of infrastructure.

**The goal is not to promise that software will never fail. It is to prevent one failure from gaining control of the whole platform.**

## Sources and further reading


- [European Commission: Cyber Resilience Act summary](https://digital-strategy.ec.europa.eu/en/policies/cra-summary)
- [University of Cambridge: CHERI Frequently Asked Questions](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-faq.html)
- [Rust Programming Language](https://rust-lang.org/)
- [NSA and CISA: Memory Safe Languages—Reducing Vulnerabilities in Modern Software Development](https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4223298/nsa-and-cisa-release-csi-highlighting-importance-of-memory-safe-languages-in-so)
- [CHERI Linux Project](https://cheri-linux.org)
- [CERT/CC: Treck TCP/IP Vulnerabilities — Ripple20](https://www.kb.cert.org/vuls/id/257161)
- [CISA: Hitachi Energy e-mesh EMS — ICSA-26-188-03](https://www.cisa.gov/news-events/ics-advisories/icsa-26-188-03)
- [CISA: Rockwell Automation Logix Controllers — ICSA-26-197-06](https://www.cisa.gov/news-events/ics-advisories/icsa-26-197-06)
- [CHERI Alliance: Recent Advances in CHERI](/news/recent-advances-in-cheri-enhancing-stability-maturity-and-accessibility-as-urged-by-the-uks-dstl/)
- [Anthropic: Assessing Claude Mythos Preview’s Cybersecurity Capabilities](https://www.anthropic.com/research/mythos-preview)
- [Itron and NVIDIA: AI-Powered Distributed Intelligence at the Grid Edge](https://investors.itron.com/news-releases/news-release-details/itron-brings-ai-powered-distributed-intelligence-capabilities)
- [Codasip: X730 CHERI-RISC-V Application Processor](https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor)
- [Codasip Prime CHERI Exploration Platform](https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime)
- [SCI Semiconductor: ICENI First-Silicon Announcement](https://www.scisemi.com/company/press-release-iceni-first-commercial-cheri)
- [lowRISC: CHERI-Mocha Memory-Safe Compute Subsystem Is Now Open](https://lowrisc.org/news/cheri-mocha-memory-safe-compute-subsystem-is-now-open)
- [EnSilica and Codasip: Strategic Partnership to Bring CHERI Cybersecurity to Critical Applications](https://www.ensilica.com/news-and-insight/ensilica-and-codasip-announce-strategic-partnership)

## About the author


Jim Wallace has more than 40 years of experience in the semiconductor and technology industries, including senior roles at Arm, Imagination Technologies, CSR, GEC Plessey and Philips. His career spans engineering, product strategy, segment marketing and business development across semiconductor IP, automotive, industrial and connected systems. He now focuses on CHERI, secure-by-design technologies and long-life critical infrastructure platforms.
