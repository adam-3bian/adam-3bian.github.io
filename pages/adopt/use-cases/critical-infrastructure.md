---
title: Critical Infrastructure
permalink: /adopt/use-cases/critical-infrastructure/
where-next:
  url: /adopt/use-cases/cloud-and-data-centre/
related-pages:
- url: /adopt/use-cases/automotive/
  description: Connected vehicles combine exposed software, long lifecycles, and components with very different levels of trust.
  action: Read this page
- url: /adopt/use-cases/iot-and-embedded/
  description: Small connected devices can hold private data, network credentials, and control over physical functions.
  action: Read this page
- url: /adopt/business-case/the-business-case/
  title: The Business Case
  description: CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.
  action: Read this page
---

1. Adopt
2. Use Cases
3. Critical Infrastructure
{: .source-breadcrumbs }

# Critical Infrastructure
{: id="page-hero-title" .page-hero-title }

CHERI can protect exposed and long-lived software inside infrastructure systems, helping one memory flaw remain separate from the functions that keep an essential service running.
{: .page-hero-summary }

Energy, water, communications, transport, health, and industrial services depend on computers that interact with the physical world. Many of those systems combine specialist hardware, established C or C++ code, remote management, vendor software, and replacement cycles measured in years or decades.

A vulnerability in a protocol handler or maintenance service can therefore have consequences far beyond the affected program. It may interrupt monitoring, expose operational data, influence control functions, or create a path from a connected edge into a wider system.

## Why CHERI can fit long-lived infrastructure
{: id="why-cheri-can-fit-long-lived-infrastructure" }

Critical infrastructure presents a difficult mix of constraints. Software often remains useful long after its original development environment has changed. Complete rewrites can introduce operational risk, while full process isolation may be unavailable in smaller controllers or too coarse within a consolidated appliance.

CHERI can protect that native software without requiring its purpose to change. Capabilities restrict memory access to defined ranges and permissions. Compartments can restrict a protocol parser, driver, vendor module, or management service to specific buffers, devices, and interfaces.

This provides two forms of protection:

- many invalid memory accesses can be stopped at the processor;
- a component compromised through another weakness can be prevented from reaching unrelated functions.

The second property is particularly relevant to resilience. An exposed service does not need authority over every part of the device because it shares the same processor.

## Areas where the protection matters
{: id="areas-where-the-protection-matters" }

CHERI can be relevant inside:

- gateways between operational, enterprise, and external networks;
- protocol conversion and message-processing services;
- remote maintenance and software-update components;
- controllers containing modules from several suppliers;
- monitoring appliances and edge devices;
- systems that combine critical and non-critical functions on shared hardware.

A gateway parser, for example, can receive access to an incoming message and a narrow interface to a control service while remaining unable to read credentials, alter configuration, or access unrelated device state.

## Resilience remains broader than memory safety
{: id="resilience-remains-broader-than-memory-safety" }

Essential services depend on prevention, detection, response, recovery, and safe degradation. CHERI contributes to prevention and containment, but it does not replace network architecture, identity and access control, secure configuration, monitoring, backups, manual alternatives, physical protection, or incident response.

The response to a capability fault also matters. A stopped invalid access protects memory, while the surrounding system determines whether the affected component restarts, fails over, enters a safe state, or interrupts a service. Timing, availability, logging, and recovery remain properties of the complete design.

## Fit with gradual renewal
{: id="fit-with-gradual-renewal" }

Infrastructure estates rarely change all at once. CHERI can appear within a new gateway, an updated controller, a replacement edge device, or a subsystem already reaching a refresh point. This allows capability protection to coexist with established protocols and equipment.

Its fit is strongest where one exposed or lower-trust component currently has broad access to functions with serious consequences. In that setting, CHERI can reduce the chance that a memory mistake becomes control over the wider device, while preserving the software and operational knowledge on which the service still depends.

## Where next
{: .where-next-title }

### [Cloud &amp; Data Centre](/adopt/use-cases/cloud-and-data-centre/)
{: .where-next-card-title }





[Cloud and data-centre platforms show the value of finer protection inside processes, hosts, and infrastructure services.](/adopt/use-cases/cloud-and-data-centre/)
{: .where-next-summary }



[Continue](/adopt/use-cases/cloud-and-data-centre/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Automotive](/adopt/use-cases/automotive/)
{: .related-pages-item-title }





[Connected vehicles combine exposed software, long lifecycles, and components with very different levels of trust.](/adopt/use-cases/automotive/)
{: .related-pages-item-summary }



[Read this page](/adopt/use-cases/automotive/)
{: .source-card-label }





### [IoT &amp; Embedded](/adopt/use-cases/iot-and-embedded/)
{: .related-pages-item-title }





[Small connected devices can hold private data, network credentials, and control over physical functions.](/adopt/use-cases/iot-and-embedded/)
{: .related-pages-item-summary }



[Read this page](/adopt/use-cases/iot-and-embedded/)
{: .source-card-label }





### [The Business Case](/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](/adopt/business-case/the-business-case/)
{: .source-card-label }
