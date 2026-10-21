---
layout: article
title: AI Doesn’t Need a Kill Switch. It Needs Boundaries
summary: 'In the earlier articles in this series, we looked at why memory-safety vulnerabilities persist in critical infrastructure, and how [CHERI](/discover/understand/how-does-cheri-work/) can contain a compromised software component rather than allowing one failure to spread across the platform. AI takes that challenge a step further: how do we limit the authority of a component that is becoming part of the control loop?'
permalink: /news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/
slug: ai-doesnt-need-a-kill-switch-it-needs-boundaries
navigation:
  header:
    category: News & Events
    subcategory: News & Analysis
image:
  src: /assets/images/posts/2026-10-13-ai-doesnt-need-a-kill-switch-it-needs-boundaries.webp
  alt: AI Doesn't Need a Kill Switch. It Needs Boundaries.
  width: 1264
  height: 711
  fit: cover
date: '2026-10-13T11:00:10+01:00'
post:
  category: ecosystem
  tags:
  - Ecosystem
  - Government / Regulation
  authors:
  - person: jim-wallace
    role: CHERI Alliance / Cre8Vantage
---


## How CHERI can limit compromised AI before it compromises the system

In the earlier articles in this series, we looked at why memory-safety vulnerabilities persist in critical infrastructure, and how [CHERI](/discover/understand/how-does-cheri-work/) can contain a compromised software component rather than allowing one failure to spread across the platform. AI takes that challenge a step further: how do we limit the authority of a component that is becoming part of the control loop?

AI is moving into devices that increasingly influence and control the physical world. That raises a security question that model-level safeguards alone cannot answer: if an AI component or the software around it is compromised, what is it actually allowed to access and control?

## AI is becoming part of the control loop

Consider a home Energy Management System. An AI model could combine smart-meter data, solar generation, battery state of charge, electricity tariffs and a weather forecast to predict demand and help decide when a home battery should charge or discharge.

That sounds routine, but the consequences are real. A poor decision can increase cost or reduce efficiency. A compromised system could expose private household data or interfere with equipment that controls significant amounts of electrical power. At scale, the same class of device can become part of the wider energy system, where coordinated disruption could affect grid stability and, in extreme cases, contribute to outages or protective shutdowns.

The important point is that the AI does not have to be ‘hacked’ directly. If an attacker exploits a memory-safety bug in surrounding software and changes the data reaching the model, the model can produce a perfectly reasonable answer to false inputs.

**The AI can be working exactly as designed while the system around it has already lost its integrity.**

That is why trustworthy edge AI has to be a system problem, not only a model problem.

## A simple demonstration: same AI, different security boundary

One way to demonstrate the value of these boundaries would be to build two otherwise similar systems. Both run the same energy-management workload, using an external AI accelerator for forecasting and inference. One host uses a conventional processor. The other uses a CHERI-enabled processor on [Codasip Prime](https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime/).

The choice of AI engine is deliberately secondary. It could be a discrete accelerator such as Hailo-10H, or a platform based on [Google](/organisations/google/)‘s Coral NPU architecture. The important point is not which AI vendor or accelerator is used, but whether the host system can enforce stronger boundaries around the software that prepares data, invokes inference and acts on the result.

The two systems can be shown operating normally with identical inputs and matching predictions. Then a memory vulnerability is exploited in host software. On the conventional system, a successful exploit may allow adjacent data to be corrupted, including information supplied to the AI application. On the CHERI system, pointer bounds and permissions are enforced by hardware. Code cannot simply forge an unrestricted pointer and use it to access arbitrary memory.

If the compromised component does not possess a capability authorising access to another compartment’s memory, an attempted cross-boundary access can be blocked rather than silently modifying data.

**The model and workload have not changed. What has changed is the authority available to compromised software.**

## The more interesting question is what happens when the AI moves inside the SoC

External accelerator cards make a good demonstration because the boundary is visible. The longer-term opportunity is more ambitious.

Edge SoCs are increasingly combining application processors, real-time cores, NPUs, shared memory, security functions and communications on the same device. Once the AI engine is inside that architecture, the problem changes from ‘How do we protect software that calls the AI?’ to ‘How do we define exactly what the AI subsystem is allowed to see and affect?’

CHERI offers a useful model for answering that question: give each software component only the authority it needs. An inference service might be allowed to read a defined sensor buffer and a protected model region, then write a result to a specific output buffer. It need not have access to security keys, unrelated applications, another vendor’s IP or the control logic that ultimately drives a battery, motor or actuator.

For a future SoC built around [Codasip CHERI technology](https://codasip.com/solutions/riscv-processor-safety-security/cheri/), this creates the opportunity to extend least privilege beyond the CPU. Application processing, real-time control, AI acceleration and security functions can be separated so that each component has access only to the memory and system resources it needs. Where accelerators or DMA-capable devices can access memory independently, additional controls such as an IOMMU, MPU or protected interconnect are still required.

## What if an attacker can modify the model weights?

If an attacker gains unauthorised write access to the memory or storage holding the model, changing the weights can alter the model’s behaviour without modifying the inference software.

CHERI can help when the weights are held in memory managed by CHERI-aware software. The model can be placed in a region that the inference runtime is authorised to read but not write. A network stack, user interface or third-party library can be denied any capability that permits access to that region. A memory exploit in one of those components therefore does not automatically grant permission to rewrite the model.

That is a meaningful security property: the component that uses a model does not necessarily need the authority to modify it, and software that communicates with the outside world certainly does not need that authority. But if a malicious model arrives through a trusted update path, CHERI cannot determine that the model itself is bad.

**CHERI can control access to a model and restrict who is able to change it. Determining whether the model itself is trustworthy requires other security mechanisms.**

## And if the model itself is already compromised?

Assume the worst case. The model is running, its weights have been maliciously altered, and its outputs can no longer be trusted. CHERI cannot turn a bad model back into a good one. What it can help do is stop a bad model from becoming an all-powerful component.

The architecture can separate inference from control. The inference compartment might be allowed to produce a prediction or recommendation, but not directly command the battery, motor or other safety-critical function. A smaller trusted control component can validate that output against hard system limits before anything physical happens.

In a home energy system, those limits might include battery temperature, maximum charge and discharge rates, state-of-charge limits and permitted export power. In a robot, the equivalent boundary could sit between an AI planner and the safety controller. In an industrial system, AI may optimise a process without receiving permission to override protection logic.

This is a familiar engineering principle applied to AI: do not make safety depend on one complex component always behaving correctly.

**The AI can recommend. The architecture decides what it is allowed to control.**

## Three layers of protection

The emerging CHERI-AI story can be expressed in three layers:

- **Protect the model**. Keep model weights and sensitive AI assets in memory that only authorised components can access or modify.
- **Constrain the runtime.** Compartmentalise the software that loads models, prepares inputs and manages inference so a flaw in one component does not automatically expose the rest of the system.
- **Limit the authority of the output.** Treat AI inference as an input to trusted control logic rather than giving the model unrestricted command of the physical system.

None of these measures replaces secure boot, model signing, safe update mechanisms, IOMMUs or domain-specific safety controls. The strength comes from combining them. CHERI adds something that conventional software security often struggles to provide at fine granularity: hardware-enforced authority over memory and software compartments.

## Why this matters

In the previous articles, *[From Cyber Shock to Silicon Trust](https://cre8vantage.com/2025/11/02/from-cyber-shock-to-silicon-trust/)* and *[Beyond Software Patching](/news/beyond-software-patching/)*, we looked at preventing and containing software compromise. AI adds another dimension: increasingly capable software is now being given a role in decisions that affect the physical world.

A resilient architecture should not assume that every AI model will always be correct, or that every supporting software component will remain uncompromised. It should assume that something will eventually go wrong and deliberately limit what each component is able to do.

For today’s systems, that can mean a safer host around an external accelerator. For tomorrow’s integrated AI SoCs, it points towards something more significant: an architecture in which AI can be powerful without automatically being given unrestricted authority over the wider system.

That is the opportunity for CHERI: not to promise that AI can never be wrong, but to help ensure that a wrong decision, a corrupted model or a compromised component does not automatically become a compromised system.

**Trustworthy AI depends as much on limiting authority as on improving the model itself.**

## From architectural principles to practical implementation

The architecture described here is not simply a theoretical exercise. [Codasip](/organisations/codasip/) engineers have already integrated a Hailo-10H AI accelerator with the Codasip Prime CHERI development platform and successfully run AI inference workloads on [CHERI-enabled RISC-V processors](https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/).

This gives Prime developers a practical, affordable route to adding advanced edge AI capabilities to their existing platforms using readily available PCIe hardware.

To help developers take the next step, [Codasip](https://codasip.com/) is publishing a two-part technical blog series that follows the journey from hardware integration and software environment setup through to porting AI applications, enabling CHERI PureCap, and executing inference workloads.

The second article goes further, exploring how CHERI’s hardware-enforced compartmentalisation can isolate AI services and supporting software, demonstrating how intelligent systems can be both powerful and secure by design.

## Sources and further reading

- [University of Cambridge – CHERI FAQ](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/cheri-faq.html) – CHERI capabilities, bounds, permissions, pointer integrity and software compartmentalisation.
- [University of Cambridge – CHERI project](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/) – Background on CHERI’s architectural protection model and hardware-enforced capabilities.
- [Codasip – Codasip Prime](https://codasip.com/solutions/riscv-processor-safety-security/cheri/codasip-prime/) – Prime platform details, including the X730 CHERI-RISC-V application CPU, FPGA platform and CHERI software stack.
- [Google Research – Coral NPU](https://research.google/blog/coral-npu-a-full-stack-platform-for-edge-ai/) – Google’s open, RISC-V-based Coral NPU architecture for low-power edge AI.
- [Google Research – I/O 2026 Coralboard update](https://research.google/blog/a-new-era-of-innovation-google-research-at-io-2026/) – Coralboard development platform and 2026 edge-AI demonstration.
- [Hailo – Hailo-10H](https://hailo.ai/hailo-files/hailo-10h-product-brief-en/) – Hailo-10H edge-AI accelerator product information.

**Technical note:** CHERI protects accesses made through the CHERI-aware processor and software environment. An external accelerator that can access memory independently, for example through DMA, still needs suitable system-level controls such as an IOMMU or equivalent device isolation. CHERI is not a wrapper around the accelerator itself; it provides stronger control over the software and memory authority around it.

## About the author

Jim Wallace has more than 40 years of experience in the semiconductor and technology industries, including senior roles at Arm, Imagination Technologies, CSR, GEC Plessey and Philips. His career spans engineering, product strategy, segment marketing and business development across semiconductor IP, automotive, industrial and connected systems. He now focuses on CHERI, secure-by-design technologies and long-life critical infrastructure platforms

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
