---
layout: page
title: Vulnerabilities in Everyday Technology
summary: A memory mistake in a connected device can expose private information, change how the device behaves, or provide a way into a wider network.
permalink: /discover/why-cheri/vulnerabilities-in-everyday-technology/
slug: discover-why-cheri-vulnerabilities-in-everyday-technology
navigation:
  header:
    category: Discover CHERI
    subcategory: Why CHERI
related:
- type: page
  slug: discover-why-cheri-why-existing-defences-are-not-enough
  relation: next_step
---

## Overview

Connected devices are specialised computers. A camera, doorbell, router, medical monitor, or vehicle system may connect to networks, accept remote commands, install software updates, and store sensitive or personal information.

If software contains a serious memory vulnerability, an attacker may be able to access information, change settings, disrupt operation, or use the device to attack other systems on the same network.

![Vulnerabilities keep increasing](/assets/images/shared/cve.webp){: .image-full }

## Even small devices can carry significant risk

Connected products often combine private data, physical control, and a route into a wider system, for example:

| Device | What it handles | Potential impact of a serious compromise |
| --- | --- | --- |
| **Video doorbell** | Video, audio, account details, Wi-Fi access | Privacy loss, device control, access to other devices |
| **Smart meter** | Usage readings, remote commands | Presence detection, disruption of operation |
| **Medical device** | Patient information, alarms, settings | Loss of confidentiality or even life-threatening events |
| **Factory sensor or gateway** | Production data, control messages, network connections | Production disruption, industrial accident |
| **Connected vehicle component** | Sensor and service communications | Vehicle function disruptions, loss of availability, or safety impacts |

> The risk depends on the flaw and the device, but even modest products can provide valuable access.

## How an ordinary mistake becomes a security problem

Software stores information in memory while it runs. **Memory safety** means software can only access the information it is supposed to access.

A **memory-safety vulnerability** occurs when software accidentally reads or modifies memory outside those intended limits. An attacker can sometimes trigger these mistakes using carefully crafted input, potentially allowing them to:

- read private information;
- alter settings or security decisions;
- make a device unavailable;
- run commands with the software’s privileges;
- access data and services the software was never meant to reach.

This is why a small coding mistake can become a significant security problem.

## Why connected products are vulnerable

Connected devices constantly process information from outside sources, including network traffic, files, images, sensor data, app commands, and software updates. Every one of these inputs can become an attack path.

Many products also rely on software written in C and C++. These languages are efficient and widely used, especially in constrained devices, but they require developers to manage memory correctly. In large codebases built from drivers, libraries, and application software, some mistakes inevitably escape review and testing.

## Limiting the impact of vulnerabilities

An image-processing component should need access to images, not to Wi-Fi credentials or update keys. Yet many traditional systems allow software components to share memory and broad privileges.

As a result, compromising one component can give an attacker access to much more than that component actually needs. Separating software into smaller, independent parts helps contain the damage, but traditional isolation can be difficult or expensive in resource-constrained devices.

## A stronger foundation for connected devices

Testing, code review, and security updates remain essential, but they cannot prevent every future memory mistake.

CHERI helps address the problem at the hardware level. It introduces protected references called capabilities, which define not only where information is stored but also what memory can be accessed and what actions are permitted.

A conventional pointer is like an address. A CHERI capability is more like an access pass that combines the address with the permissions needed to use it. The processor checks those permissions whenever the capability is used.

CHERI does not eliminate all software bugs, but it can prevent many forms of invalid memory access and limit what compromised software can reach.

## The essential point

Connected devices are trusted with private information, physical functions, and network access. Memory vulnerabilities matter because they can turn ordinary input into a route for taking control.

By preventing many forms of invalid memory access and limiting the reach of compromised software, CHERI helps reduce the risk that a single mistake compromises an entire device or system.

Further reading: [Google’s overview of its memory-safety strategy](https://security.googleblog.com/2024/10/safer-with-google-advancing-memory.html) and the [University of Cambridge CHERI overview](https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/).
