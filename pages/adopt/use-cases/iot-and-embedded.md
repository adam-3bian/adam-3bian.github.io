---
title: IoT & Embedded
permalink: /adopt/use-cases/iot-and-embedded/
where-next:
  url: /adopt/use-cases/critical-infrastructure/
related-pages:
- url: /adopt/use-cases/automotive/
  description: Connected vehicles combine exposed software, long lifecycles, and components with very different levels of trust.
  action: Read this page
- url: /adopt/business-case/the-business-case/
  title: The Business Case
  description: CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.
  action: Read this page
---

1. Adopt
2. Use Cases
3. IoT &amp; Embedded
{: .source-breadcrumbs }

# IoT &amp; Embedded
{: id="page-hero-title" .page-hero-title }

CHERI can bring memory protection and compartmentalisation to connected devices that have limited resources but still handle private data, network access, or physical functions.
{: .page-hero-summary }

A connected camera, door lock, thermostat, medical sensor, or industrial controller may look like one small device, but it is also a computer. It can hold video or audio, Wi-Fi credentials, account tokens, personal routines, sensor readings, or authority over something physical.

These devices often accept data from networks, radio links, mobile applications, files, and sensors. A memory vulnerability in the code handling that data can expose information, change how the device behaves, or provide a route into the network around it.

## Why small devices are difficult to isolate
{: id="why-small-devices-are-difficult-to-isolate" }

Many embedded systems use C or C++ because they have limited memory, storage, power, and processing capacity. They may run for years, receive infrequent updates, and depend on libraries or drivers from several suppliers.

Larger computers commonly isolate applications with separate processes and virtual memory. Small microcontrollers may have no memory-management unit, and placing every service in a separate address space may be impossible. As a result, a network stack, parser, driver, and application can share one memory space even though they do not need the same access.

## What CHERI adds
{: id="what-cheri-adds" }

CHERI capabilities are protected references that carry bounds and permissions. A parser can receive access to one packet buffer without gaining access to every object in memory. A driver can be limited to the registers and buffers for one device. Code that attempts to read, write, or execute outside its authority triggers a capability fault.

Compartments extend that protection to software components. A network service, cryptographic service, update handler, or third-party library can run with only the access required for its role. If one component is compromised, secrets and physical controls held elsewhere can remain beyond its reach.

This is a strong fit for devices where heavyweight isolation is unavailable but the consequence of broad access is still significant.

## CHERIoT and constrained systems
{: id="cheriot-and-constrained-systems" }

[CHERIoT](https://cheriot.org/) applies CHERI ideas to 32-bit embedded systems. Its processor and software model support small, mutually distrusting compartments and controlled calls between them without relying on a conventional memory-management unit.

The model is relevant to:

- wireless and network protocol handling;
- connected cameras, locks, alarms, and home devices;
- sensor and actuator drivers;
- update verification and boot services;
- cryptographic keys and device identity;
- third-party libraries and supplier code;
- industrial, medical, and infrastructure edge devices.

Other CHERI platforms cover richer operating systems and larger processors. The underlying value remains the same: memory access is tied to explicit authority rather than treated as an unrestricted address.

## Security under real constraints
{: id="security-under-real-constraints" }

Capability metadata and calls between compartments use resources, so code size, RAM, flash, power, interrupt latency, and real-time behaviour remain part of the platform choice. Toolchain support, component availability, update arrangements, and product lifetime also affect fit.

CHERI does not replace device identity, secure boot, authenticated updates, cryptography, radio security, vulnerability handling, or physical protection. It strengthens the layer underneath them by reducing the memory a component can misuse and containing failures that would otherwise share one address space.

For a small connected device, that can be a meaningful change: one malformed packet need not imply access to every credential, sensor, actuator, and service in the product.

## Where next
{: .where-next-title }

### [Critical Infrastructure](/adopt/use-cases/critical-infrastructure/)
{: .where-next-card-title }





[Long-lived infrastructure shows how protection inside a device can contribute to wider service resilience.](/adopt/use-cases/critical-infrastructure/)
{: .where-next-summary }



[Continue](/adopt/use-cases/critical-infrastructure/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Automotive](/adopt/use-cases/automotive/)
{: .related-pages-item-title }





[Connected vehicles combine exposed software, long lifecycles, and components with very different levels of trust.](/adopt/use-cases/automotive/)
{: .related-pages-item-summary }



[Read this page](/adopt/use-cases/automotive/)
{: .source-card-label }





### [The Business Case](/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](/adopt/business-case/the-business-case/)
{: .source-card-label }
