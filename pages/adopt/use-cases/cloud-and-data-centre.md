---
title: Cloud & Data Centre
permalink: /adopt/use-cases/cloud-and-data-centre/
---

1. Adopt
2. Use Cases
3. Cloud &amp; Data Centre
{: .source-breadcrumbs }

# Cloud &amp; Data Centre
{: id="page-hero-title" .page-hero-title }

CHERI can add protection inside hosts and services, limiting native components that sit within the same process, container, or virtual machine.
{: .page-hero-summary }

Cloud and data-centre platforms process large volumes of untrusted data while holding customer information, credentials, storage, and control over shared infrastructure. Containers and virtual machines separate workloads, but complex native code still runs inside each boundary.

A vulnerable parser, plug-in, device model, or library can inherit much of the authority of its host process. If that component is compromised, the surrounding process may give it access to data and services that its own task never required.

## Why CHERI can fit inside existing boundaries
{: id="why-cheri-can-fit-inside-existing-boundaries" }

CHERI protects memory at a finer level than a process or virtual machine. A capability gives software authority over a particular range of memory and a defined set of operations. Compartments can combine those memory limits with narrow service interfaces.

This makes CHERI relevant where a full process boundary is too costly, too coarse, or difficult to introduce. A native plug-in can be limited to selected data. A parser can receive one input buffer. An infrastructure agent can retain access to a specific service without inheriting every credential available to its host.

Potential areas include:

- network and storage data paths;
- database extensions and native plug-ins;
- media, document, archive, and image parsers;
- hypervisor device models and hardware emulation;
- language runtimes and native foreign-function interfaces;
- host agents with access to credentials or management services.

## A further layer of isolation
{: id="a-further-layer-of-isolation" }

CHERI does not replace tenant boundaries, virtual machines, containers, access control, cryptography, or network policy. Those mechanisms separate larger units and remain central to cloud security.

Capability protection adds a layer within them. If a service needs several native components for performance or compatibility, each component can have less authority than the process containing it. This can reduce the distance between “one library has a vulnerability” and “the host service is fully compromised.”

Memory-safe languages and CHERI also address different parts of the stack. New infrastructure can use Rust or another memory-safe language, while CHERI protects established C or C++ libraries, unsafe runtime code, and interfaces where languages meet. A mixed system can gain value from both.

## Why containment matters at scale
{: id="why-containment-matters-at-scale" }

Cloud incidents can spread because a widely used component appears across many hosts, services, or customer environments. Preventing an invalid access can remove one route to exploitation. Restricting the component’s authority can also reduce the impact when a flaw outside CHERI’s scope is exploited.

At fleet scale, narrower compromise may mean fewer reachable secrets, smaller incident scope, and clearer boundaries for investigation. Capability faults can provide direct information about the rejected operation, supporting diagnosis and observability when the surrounding software records them effectively.

## Where the fit depends on the platform
{: id="where-the-fit-depends-on-the-platform" }

Cloud workloads are sensitive to throughput, tail latency, cache behaviour, memory footprint, and the cost of crossing isolation boundaries. Operating-system, virtualisation, debugging, orchestration, and live-update support also influence whether a CHERI platform fits a particular service.

The strongest case tends to occur where exposed native code has valuable host authority, yet moving it into a separate process or rewriting it is impractical. In that gap, CHERI offers a way to keep the component close enough for its operational role while giving it far less of the host to compromise.

## Where next
{: .where-next-title }

### [Defence &amp; Aerospace](/adopt/use-cases/defence-and-aerospace/)
{: .where-next-card-title }





[Mission systems add long lifecycles, mixed suppliers, demanding assurance, and operation under active threat.](/adopt/use-cases/defence-and-aerospace/)
{: .where-next-summary }



[Continue](/adopt/use-cases/defence-and-aerospace/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Automotive](/adopt/use-cases/automotive/)
{: .related-pages-item-title }





[Connected vehicles combine exposed software, long lifecycles, and components with very different levels of trust.](/adopt/use-cases/automotive/)
{: .related-pages-item-summary }



[Read this page](/adopt/use-cases/automotive/)
{: .source-card-label }





### [Critical Infrastructure](/adopt/use-cases/critical-infrastructure/)
{: .related-pages-item-title }





[Essential services depend on containing faults as well as keeping systems available and recoverable.](/adopt/use-cases/critical-infrastructure/)
{: .related-pages-item-summary }



[Read this page](/adopt/use-cases/critical-infrastructure/)
{: .source-card-label }





### [The Business Case](/adopt/business-case/the-business-case/)
{: .related-pages-item-title }





[CHERI can create value where memory-unsafe software, valuable assets, and long support lives meet.](/adopt/business-case/the-business-case/)
{: .related-pages-item-summary }



[Read this page](/adopt/business-case/the-business-case/)
{: .source-card-label }
