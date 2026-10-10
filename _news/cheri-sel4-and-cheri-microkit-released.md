---
title: CHERI-seL4 and CHERI-Microkit Released
date: '2025-07-29T11:00:45+01:00'
---

1. News &amp; Events
2. News &amp; Analysis
3. CHERI-seL4 and CHERI-Microkit Released
{: .source-breadcrumbs }

# CHERI-seL4 and CHERI-Microkit Released
{: id="page-hero-title" .page-hero-title }

Hesham Almatary – Capabilities Limited We are happy to release a prototype of CHERI-seL4, an experimental version of the seL4 microkernel with CHERI support. This comes with CHERI-Microkit, a lightweight userspace framework, and a set of exercises…
{: .page-hero-summary }

*29 July 2025*{: .source-date }
*Ecosystem*{: .collection-tag }
*Working Groups*{: .collection-tag }
{: .collection-detail__metadata .source-div-text }

![The software release roadmap for CHERI-seL4](/assets/news/cheri-sel4-and-cheri-microkit-released/8d44a7e5916e-hero.png){: .image-full }
{: .collection-detail__lead-image }

Hesham Almatary

*–* [*Capabilities Limited*](/organisations/capabilities-limited/)

We are happy to release a prototype of CHERI-seL4, an experimental version of the seL4 microkernel with CHERI support. This comes with CHERI-Microkit, a lightweight userspace framework, and a set of exercises and tutorials designed to help developers explore CHERI’s potential in a real microkernel environment.

The release is aimed at developers who want to build and experiment with memory-safe C/C++ software on seL4. It supports the draft CHERI-RISC-V architecture and runs on QEMU, Codasip’s x730 processor, CHERI-Toooba and CHERI-CVA6 on FPGA.

## Why Try CHERI-seL4
{: id="why-try-cheri-sel4" }

![CHERI-seL4: Why?](/assets/news/cheri-sel4-and-cheri-microkit-released/8b01b36a4468-cheri-sel4-why.png){: .image-full }

seL4 is a formally verified microkernel known for enforcing strong isolation between protection domains in separate address spaces. However, seL4 does not currently provide protection between components in the same address space.

CHERI is a hardware capability architecture that enables fine-grained memory safety and compartmentalisation within a single address space. By combining CHERI with seL4, developers can use CHERI to explore new ways to enforce memory-safety in their C/C++ projects/components, at no extra development cost.

This opens up use cases where:

- Isolation is needed between mixed-trust components without separate address spaces
- You want hardware enforcement of memory safety for C/C++ userspace
- You need a lightweight runtime that avoids the complexity of full MMU-based separation

CHERI-seL4 enables all of this with minimal changes to the kernel and no need to rewrite existing C code in managed languages.

## What this Release Includes
{: id="what-this-release-includes" }

This initial release provides:

- A prototype implementation of the CHERI-seL4 RFC discussed with the seL4 community
- Support for the draft CHERI-RISC-V (Zcheri) architecture
- Compatibility with Codasip’s x730 processor, CHERI-Toooba and CHERI-CVA6
- A minimal kernel extension that supports memory-safe CHERI C in userspace while keeping the kernel unchanged when CHERI is disabled
- CHERI-Microkit: a lightweight framework for running CHERI-enabled and unmodified C/C++ or Rust programs side by side
- A set of exercises and tutorials to get developers started with CHERI on seL4

## About Microkit
{: id="about-microkit" }

![](/assets/news/cheri-sel4-and-cheri-microkit-released/16467bfc72a2-cheri-sel4-5.png){: .image-full }

Microkit simplifies seL4 development by abstracting away low-level kernel primitives. It allows you to define a static security policy and deploy isolated components without needing to write complex seL4 setup code.

Microkit consists of:

- A runtime library for applications
- A monitor (root task) that manages startup
- A Rust-based build tool that generates the required bootstrapping and system setup logic

CHERI support in Microkit lets you run legacy C/C++ (non-CHERI), memory-safe C/C++ (using CHERI capabilities), and Rust programs in distinct protection domains.

## Try it Out
{: id="try-it-out" }

All code for CHERI-seL4, CHERI-Microkit and CHERI-seL4 Exercises is available as open source. The tutorials walk through how to build and run the system, and include example code to test different features.

This is a prototype release and the CHERI-RISC-V standard is still in draft. The focus is on enabling experimentation and early development.

To run the CHERI-Microkit system on QEMU, start by installing the following dependencies (Ubuntu example):

### Install dependencies (Ubuntu example):
{: id="install-dependencies-ubuntu-example" }

~~~
                    # Install cheribuild dependencies:

sudo apt install autoconf automake libtool pkg-config clang bison cmake mercurial ninja-build samba flex texinfo time libglib2.0-dev libpixman-1-dev libarchive-dev libarchive-tools libbz2-dev libattr1-dev libcap-ng-dev libexpat1-dev libgmp-dev bc

# Install Microkit dependencies (Rust and XML tools):

curl https://sh.rustup.rs -sSf | sh
rustup target add x86_64-unknown-linux-musl
sudo apt install libxml2-utils

# Clone and build:

git clone https://github.com/CTSRD-CHERI/cheribuild.git

cd cheribuild
./cheribuild.py run-cheri-microkit-baremetal-riscv64-purecap --riscv-cheri-isa experimental_std093 -d
~~~

### Run tests and examples:
{: id="run-tests-and-examples" }

~~~
                    ./cheribuild.py cheri-microkit-baremetal-riscv64-purecap --build-and-test --riscv-cheri-isa experimental_std093
~~~

## CHERI-seL4 Tutorials and Exercises
{: id="cheri-sel4-tutorials-and-exercises" }

You can find the CHERI-seL4 Exercises [here](/CHERI-seL4-Exercises/), with extensive documentation, instructions, scripts, and source code.

## Feedback Welcome
{: id="feedback-welcome" }

We welcome contributions, questions and feedback. If you run into issues, have feature requests or want to help shape future development, please get in touch. The CHERI-RISC-V standard is still being finalised and we encourage developers to share feedback while it is still open to changes.

## Resources
{: id="resources" }

- CHERI-seL4 GitHub: [https://github.com/CHERI-Alliance/CHERI-seL4](https://github.com/CHERI-Alliance/CHERI-seL4)
- CHERI-Microkit GitHub: [https://github.com/CHERI-Alliance/CHERI-Microkit](https://github.com/CHERI-Alliance/CHERI-Microkit)
- CHERI-seL4 Exercises and Tutorials: [https://cheri-alliance.github.io/CHERI-seL4-Exercises](/CHERI-seL4-Exercises/)
- CHERI-seL4 RFC: [https://github.com/seL4/rfcs/pull/21](https://github.com/seL4/rfcs/pull/21)
- seL4 upstream PRs: [https://github.com/seL4/seL4/pull/1469](https://github.com/seL4/seL4/pull/1469)
- CHERI-seL4 Working Group: [https://cheri-alliance.org/who-we-are/working-groups/cheri-sel4/](/groups/cheri-for-sel4/)

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
{: .collection-detail__back }
