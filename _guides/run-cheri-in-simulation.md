---
title: Run CHERI in Simulation
image_url: null
repository_urls:
- https://github.com/CTSRD-CHERI/cheribuild
updated_date: null
authors: []
related:
  groups: []
  hardware: []
  software: []
---

# Run CHERI in Simulation

Use simulation to boot a CHERI environment, build capability-aware code, and observe hardware-enforced faults without owning a development board.

## Before you start

You do not need CHERI hardware for most learning, porting, or experimentation tasks. Both CheriBSD and CHERIoT provide simulator-based environments that allow you to compile software, exercise capability enforcement, and investigate faults on a standard workstation.

## Route A: CheriBSD on CHERI-RISC-V QEMU

CheriBSD is the easiest way to explore a full CHERI operating-system environment. The cheribuild tool automates the setup of the compiler, emulator, operating system, and disk image.

### Host requirements

Use a supported Unix-like development host with Python 3, Git, CMake, Ninja, and the other packages listed by cheribuild. Linux is the most direct route. macOS can build many targets, while a Linux virtual machine or container may be easier for a complete environment.

### Clone the build tool

git clone https://github.com/CTSRD-CHERI/cheribuild.git

cd cheribuild

### Build and run the pure-capability system

./cheribuild.py --include-dependencies run-riscv64-purecap

The first build downloads sources and compiles a substantial stack, so it can take time and disk space. Later runs reuse the build outputs.

When QEMU reaches the login prompt, sign in as root. You are now in a CheriBSD user space where ordinary language pointers use capabilities.

### Confirm the target

Inside CheriBSD, run:

uname -a

cc --version

When reporting results or sharing benchmarks, record the architecture, CheriBSD revision, compiler version, and build configuration.

The exact target names and prerequisites can change. The cheribuild repository is the source of truth.

## Route B: CHERIoT in a simulator

The CHERIoT development container packages the toolchain, real-time operating-system (RTOS) dependencies, and simulator support.

### Clone the RTOS and examples

git clone --recursive https://github.com/CHERIoT-Platform/cheriot-rtos.git

cd cheriot-rtos

Open the repository in Visual Studio Code and select Reopen in Container, or use the published development-container image through another compatible editor or container workflow.

Inside the container, choose an example and configure it for a simulator using the board name documented by that example. A typical build follows this pattern:

xmake config --sdk=/cheriot-tools --board=sail

xmake

xmake run

Board identifiers evolve with the platform. If sail is not offered by the current checkout, use the simulator target listed in the CHERIoT getting-started guide.

## Prove that capability enforcement is active

A successful hello-world message proves that the build and run path works. It does not prove that your code is using the intended protection mode.

One possible experiment is to intentionally access memory outside an object boundary and observe whether capability enforcement detects the resulting invalid access:

#include \<stddef.h\>

int main(void) {

volatile int values\[2\] = {1, 2};

volatile int \*outside = values + 2;

return \*outside;

}

In a correctly configured pure-capability environment with useful array bounds, the invalid dereference should produce a capability-related fault. The exact diagnostic differs by architecture, compiler optimisation, and operating system. An undefined-behaviour example is not a conformance suite; use the project’s own tests for formal validation.

## What simulation can and cannot tell you

Simulation is well suited to:

learning the programming model

compiling and functionally testing ports

inspecting capability registers and faults

testing malformed inputs

running continuous integration

comparing software modes when the simulator supports them

An instruction-set simulator alone cannot establish:

production performance

processors comparison

silicon area or power

real-time startup or interrupt latency

cache or speculation behaviour

physical fault resistance

Move to FPGA or silicon when the question depends on implementation timing or hardware integration.

## Troubleshooting checklist

Confirm that submodules were cloned

Verify that the binary was actually built for the intended CHERI target and ABI, especially purecap versus conventional or hybrid targets

Keep the source, build, and output directories separate when cheribuild recommends it

Use the exact compiler from the selected software development kit (SDK) rather than the host compiler

Copy the complete capability-fault message when reporting a problem

Include the repository revisions and command line in bug reports

Once you can boot the environment, build a simple program, and observe a capability fault, you’re ready to start porting software or building your first CHERI-native application.
