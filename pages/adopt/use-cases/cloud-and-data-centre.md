---
title: Cloud & Data Centre
permalink: /adopt/use-cases/cloud-and-data-centre/
summary: CHERI can add protection inside hosts and services, limiting native components that sit within the
  same process, container, or virtual machine.
image_url: null
updated_date: null
parent: /adopt/
next_page_url: /adopt/use-cases/defence-and-aerospace/
related:
  pages:
  - /adopt/use-cases/automotive/
  - /adopt/use-cases/critical-infrastructure/
  - /adopt/business-case/the-business-case/
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

# Cloud & Data Centre

Cloud and data-centre platforms process large volumes of untrusted data while holding customer information, credentials, storage, and control over shared infrastructure. Containers and virtual machines separate workloads, but complex native code still runs inside each boundary.

A vulnerable parser, plug-in, device model, or library can inherit much of the authority of its host process. If that component is compromised, the surrounding process may give it access to data and services that its own task never required.

## Why CHERI can fit inside existing boundaries

CHERI protects memory at a finer level than a process or virtual machine. A capability gives software authority over a particular range of memory and a defined set of operations. Compartments can combine those memory limits with narrow service interfaces.

This makes CHERI relevant where a full process boundary is too costly, too coarse, or difficult to introduce. A native plug-in can be limited to selected data. A parser can receive one input buffer. An infrastructure agent can retain access to a specific service without inheriting every credential available to its host.

Potential areas include:

network and storage data paths;

database extensions and native plug-ins;

media, document, archive, and image parsers;

hypervisor device models and hardware emulation;

language runtimes and native foreign-function interfaces;

host agents with access to credentials or management services.

## A further layer of isolation

CHERI does not replace tenant boundaries, virtual machines, containers, access control, cryptography, or network policy. Those mechanisms separate larger units and remain central to cloud security.

Capability protection adds a layer within them. If a service needs several native components for performance or compatibility, each component can have less authority than the process containing it. This can reduce the distance between “one library has a vulnerability” and “the host service is fully compromised.”

Memory-safe languages and CHERI also address different parts of the stack. New infrastructure can use Rust or another memory-safe language, while CHERI protects established C or C++ libraries, unsafe runtime code, and interfaces where languages meet. A mixed system can gain value from both.

## Why containment matters at scale

Cloud incidents can spread because a widely used component appears across many hosts, services, or customer environments. Preventing an invalid access can remove one route to exploitation. Restricting the component’s authority can also reduce the impact when a flaw outside CHERI’s scope is exploited.

At fleet scale, narrower compromise may mean fewer reachable secrets, smaller incident scope, and clearer boundaries for investigation. Capability faults can provide direct information about the rejected operation, supporting diagnosis and observability when the surrounding software records them effectively.

## Where the fit depends on the platform

Cloud workloads are sensitive to throughput, tail latency, cache behaviour, memory footprint, and the cost of crossing isolation boundaries. Operating-system, virtualisation, debugging, orchestration, and live-update support also influence whether a CHERI platform fits a particular service.

The strongest case tends to occur where exposed native code has valuable host authority, yet moving it into a separate process or rewriting it is impractical. In that gap, CHERI offers a way to keep the component close enough for its operational role while giving it far less of the host to compromise.
