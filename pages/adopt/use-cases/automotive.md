---
title: Automotive
permalink: /adopt/use-cases/automotive/
summary: CHERI can protect memory and separate software components in connected vehicles while preserving a
  path for established C and C++ systems.
image_url: null
updated_date: null
parent: /adopt/
next_page_url: /adopt/use-cases/iot-and-embedded/
related:
  pages:
  - /adopt/business-case/the-business-case/
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

# Automotive

A modern vehicle is a network of computers. Infotainment, driver assistance, diagnostics, connectivity, body controls, and powertrain functions exchange data while software from many suppliers remains in service for years.

This combination creates a demanding security problem. A media file, wireless message, mobile application, or diagnostic connection may reach software written in C or C++. A memory error in that exposed software can affect more than the feature processing the input if it also has access to other vehicle data or services.

## Why CHERI can fit automotive systems

Automotive platforms combine several characteristics that make CHERI relevant:

- extensive use of established native software;
- long development and support lifecycles;
- components from different suppliers and assurance levels;
- growing consolidation onto shared processors;
- connections between externally exposed and safety-relevant functions;
- tight requirements for timing, memory, power, and dependable operation.

Rewriting every established component in a memory-safe language is unlikely to happen within one vehicle generation. Process or virtual-machine isolation can separate larger domains, but it may be too coarse for every parser, driver, library, or supplier service inside those domains.

CHERI adds protection at that finer level. A capability describes the memory a component may access and whether it may read, write, or execute. The processor rejects operations outside those limits. Compartments can restrict a component to selected buffers, devices, and callable services.

## What that changes in a vehicle

A connected-service parser might receive access to one incoming message and a narrow interface for returning a result, without access to stored credentials or control state. A third-party driver might reach only its device registers and assigned buffers. An infotainment component could remain separated from functions that influence vehicle movement.

Relevant areas include:

- wireless, media, and network protocol processing;
- central gateways between vehicle domains;
- infotainment and connected-service components;
- device drivers and third-party software modules;
- update, diagnostics, and vehicle-to-everything services;
- consolidated compute platforms containing mixed-criticality software.

The benefit is both preventative and protective. Many invalid accesses can be stopped where they occur, and a component that is compromised through another flaw can have less authority over the rest of the platform.

## Relationship to safety and cybersecurity

CHERI does not make a vehicle safe or secure on its own. Functional safety, threat analysis, secure boot, cryptography, network separation, updates, diagnostics, supply-chain control, and incident response remain necessary.

Its contribution is a set of processor-enforced properties that can sit inside those wider arrangements. Bounds and permissions can support a claim about which memory is reachable. A compartment design can support a claim that an exposed service has no direct path to a safety-relevant function.

Fault response remains important. Blocking an invalid access may stop a component, and the vehicle architecture determines whether that event is contained, recovered, reported, or handled through a safe degraded mode.

## Where the fit is strongest

CHERI is especially relevant where valuable native software will remain in use, a component receives untrusted data, and its current access is broader than its role requires. It can also fit new centralised architectures where fine-grained separation supports consolidation without placing every component in the same trust domain.

For automotive systems, the attraction is not a claim that one processor feature replaces existing engineering practice. It is the ability to preserve useful low-level software while giving the hardware a stronger role in preventing memory misuse and limiting how far a compromise can travel.
