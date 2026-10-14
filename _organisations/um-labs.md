---
title: UM Labs
image_url: /assets/organisations/um-labs/logo-transparent.svg
website_url: https://www.um-labs.com/
membership_tier: full
---

# UM Labs

## Description

UM Labs is a cyber security company specialising in securing real-time communication protocols on IP networks. Applications include voice and video calls, streaming video and Extended Reality. Our products are deployed with multiple national telecommunications providers, defence and government organisations.

Our security platform, Unicus is includes a Core service deployed in a public or private cloud and an Edge device deployed as a small scale standalone system or integrated with an end-user device. Core and Edge work together to secure real-time data feeds including protecting content with Post Quantum Cryptography.

## CHERI Activities

UM Labs are using [Morello](/hardware/morello/) CHERI for two reasons: to provide additional validation of the memory safety and other security features of our code and to assess CHERI as a potential deployment platform for our technology. Some of our users with elevated security requirements are requesting this level of validation.

We have implemented Unicus Edge on Morello CHERI using CHERI-QEMU and are in the process of an implementation on a Morello CHERI board. The next step is extended testing using the board to process streaming video and one or more IoT applications. This assessment will monitor both code security and performance.
