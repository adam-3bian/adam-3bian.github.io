---
title: Porting Status
image_url: null
website_url: null
repository_urls: []
type: null
status: null
related:
  organisations: []
  hardware: []
  software:
  - debugging-tools
---

# Porting Status

CHERI software support is reported by platform, architecture, ABI, operating system, package set, and project revision rather than by one ecosystem-wide percentage.

CHERI porting is not one centrally versioned programme. It spans processor architectures, compilers, operating systems, real-time environments, runtimes, applications, packages, emulators, and hardware platforms maintained by different projects.

## Why status varies

A project can support capability instructions without providing a pure-capability application ABI. An operating system can boot before it has broad driver or package coverage. A library can compile while still depending on untested pointer assumptions. These are different forms of progress rather than steps on one universal scale.

Status claims also change with architecture revisions, toolchain branches, kernel versions, board support, and release processes.

## Current areas of public work

CheriBSD combines a capability-aware kernel, hybrid and pure-capability user space, developer tools, and a substantial history of third-party software ports.

CHERI Linux spans kernel, user-space, toolchain, and platform work across active branches and processor environments.

CHERIoT provides an embedded architecture, RTOS, compartment model, SDK, and growing application ecosystem designed together.

CHERI-enabled Zephyr and FreeRTOS bring capability work into established embedded operating-system communities.

Rust and managed runtimes extend CHERI beyond established C and C++ toolchains, with support varying between target projects.

## Where status is recorded

The most current information lives with the project that owns a branch, release, SDK, board configuration, package set, or test environment. Alliance Working Groups connect several of these projects and publish roadmaps, repositories, articles, and event updates where shared coordination is useful.

This page describes the structure of that landscape. Individual platform and software pages link to the corresponding public project records.
