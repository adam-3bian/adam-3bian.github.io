---
title: Vulnerabilities in Everyday Technology
permalink: /discover/why-cheri/vulnerabilities-in-everyday-technology/
summary: A memory mistake in a connected device can expose private information, change how the device behaves,
  or provide a way into a wider network.
image_url: /assets/shared/source-assets/b68c7fc17613-cve.webp
updated_date: null
parent: /discover/
next_page_url: /discover/why-cheri/why-existing-defences-are-not-enough/
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

# Vulnerabilities in Everyday Technology

Connected devices are specialised computers. A camera, doorbell, router, medical monitor, or vehicle system may connect to networks, accept remote commands, install software updates, and store sensitive or personal information.

If software contains a serious memory vulnerability, an attacker may be able to access information, change settings, disrupt operation, or use the device to attack other systems on the same network.

## Even small devices can carry significant risk

Connected products often combine private data, physical control, and a route into a wider system, for example:

Device: Video doorbell; What it handles: Video, audio, account details, Wi-Fi access; Potential impact of a serious compromise: Privacy loss, device control, access to other devices

Device: Smart meter; What it handles: Usage readings, remote commands; Potential impact of a serious compromise: Presence detection, disruption of operation

Device: Medical device; What it handles: Patient information, alarms, settings; Potential impact of a serious compromise: Loss of confidentiality or even life-threatening events

Device: Factory sensor or gateway; What it handles: Production data, control messages, network connections; Potential impact of a serious compromise: Production disruption, industrial accident

Device: Connected vehicle component; What it handles: Sensor and service communications; Potential impact of a serious compromise: Vehicle function disruptions, loss of availability, or safety impacts

The risk depends on the flaw and the device, but even modest products can provide valuable access.

## How an ordinary mistake becomes a security problem

Software stores information in memory while it runs. Memory safety means software can only access the information it is supposed to access.

A memory-safety vulnerability occurs when software accidentally reads or modifies memory outside those intended limits. An attacker can sometimes trigger these mistakes using carefully crafted input, potentially allowing them to:

read private information;

alter settings or security decisions;

make a device unavailable;

run commands with the software’s privileges;

access data and services the software was never meant to reach.

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

Further reading: Google’s overview of its memory-safety strategy and the University of Cambridge CHERI overview.
