---
title: CHERI and Rust
permalink: /discover/why-cheri/cheri-and-rust/
summary: Rust and CHERI are complementary, not competing approaches.
image_url: null
updated_date: null
parent: /discover/
next_page_url: /build/technology/cheri-and-rust-technical/
related:
  pages:
  - /discover/understand/cheri-and-existing-software/
  people: []
  organisations: []
  working-groups:
  - rust-plus-cheri
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides: []
  policies: []
---

# CHERI and Rust

Rust and CHERI address memory safety at different layers. Together, they provide stronger protection than either approach alone. Why choose one when you can have both?

Rust helps prevent many memory-safety vulnerabilities from being introduced into new software. CHERI helps constrain what software can access at runtime, including unsafe code, native libraries, third-party components, operating systems, drivers, and other elements outside Rust’s control.

For a detailed technical comparison of Rust and CHERI, see CHERI and Rust - Technical Overview.

## Why Rust alone is not the whole story

Rust provides strong protection for safe Rust code. This makes Rust a strong choice for new software. However, real systems rarely consist entirely of safe Rust.

![Impossible to control all code](/assets/shared/source-assets/a9f89a0614af-rust-and-cheri.webp){: .image-full }

Most applications rely on more than just their own code. They also depend on unsafe Rust code, existing C and C++ libraries, third-party components, operating systems, drivers, runtimes, memory allocators, and firmware.

The security of the whole system depends on every layer, not just the application itself.

## What CHERI adds

CHERI provides hardware-enforced memory protection beneath the programming language.

This means that mistakes in unsafe Rust or native code can be detected and constrained by the processor. CHERI can also support fine-grained compartmentalisation, allowing software components to access only the data and services they genuinely need.

Rust catches many problems before software is deployed. CHERI continues enforcing memory protection while the software is running.

CHERI can also reduce the impact of vulnerabilities in third-party software by limiting the data and services that external components are allowed to access.

## Better together

Rust and CHERI solve different parts of the problem:

- Rust helps prevent vulnerabilities from being introduced
- CHERI helps contain vulnerabilities that still occur
- Compartmentalisation, enforced by CHERI, limits the impact of compromise

Together they provide multiple layers of protection, consistent with the layered approach described by ETSI TS 104 198. This complementarity is increasingly recognised across industry and academia. The CHERI Alliance’s Rust+CHERI working group focuses specifically on advancing these technologies together.

## Simple example

A Rust application might call an image-decoding library. On a conventional system, an error in the library might let it read other memory in the process.

Rust can help ensure the application calls the library safely. CHERI can ensure that even if the decoder contains a vulnerability, it only receives access to the image data it needs, rather than unrestricted access to the entire application.

## Key takeaways

- Rust and CHERI are complementary technologies
- Rust helps prevent vulnerabilities in new code
- CHERI constrains unsafe code and native components at runtime
- CHERI enables fine-grained compartmentalisation and least privilege
- Together they provide stronger protection than either approach alone
