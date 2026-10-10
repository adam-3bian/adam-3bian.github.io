---
title: CHERIoT 1.0 Specification Released
alternate: true
authors: [adam-finney]
undated: true
---

# CHERIoT 1.0 Specification Released


*Adam Finney – **CHERI Alliance***

*5 November 2025, Cambridge – New Release*

CHERIoT 1.0 provides a stable, hardware-enforced platform for building memory safe, compartmentalised systems in the microcontroller class. The specification defines the instruction set architecture, language extensions, and the complete compilation and relocation model, enabling developers to build software that is safeguarded against buffer overflows and use after free errors, even in hand written assembly.

Two independent implementations already demonstrate how the design scales across the microcontroller range. CHERIoT Ibex implements the specification in a three stage single issue pipeline, while CHERIoT Kudu stretches the same ISA to a six stage dual issue design. Together, they mirror the span of Arm’s M profile and let partners design for a variety of cost and performance envelopes while maintaining the same software base.

Looking forward, the project is working closely with RISC V International on the upcoming Y base for CHERI. The goal is that CHERIoT 2.0 will track this standard while remaining source compatible with the 1.0 design. In the interim, minor 1.x updates may align mnemonics and naming conventions with the RISC V standard without changing the underlying architecture.

The CHERIoT 1.0 line will be supported for years through the open source CHERIoT Platform and through partner companies bringing CHERIoT based products to market. This release marks the beginning of a stable, long term foundation for secure, scalable microcontroller class systems.

You can read David’s full announcement here: [https://cheriot.org/sail/specification/release/2025/11/03/cheriot-1.0.html](https://cheriot.org/sail/specification/release/2025/11/03/cheriot-1.0.html)


For more information on CHERI and capability-based security, visit [cheri-alliance.org](http://cheri-alliance.org), or find us on [LinkedIn](https://www.linkedin.com/company/cheri-alliance/) or [Mastodon](https://infosec.exchange/@cheri_alliance).
