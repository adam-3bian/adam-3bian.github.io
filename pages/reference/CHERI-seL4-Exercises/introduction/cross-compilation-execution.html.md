---
title: Cross compilation and execution
permalink: /reference/CHERI-seL4-Exercises/introduction/cross-compilation-execution.html
summary: null
image_url: null
updated_date: null
parent: /CHERI-seL4-Exercises/
next_page_url: null
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

# Cross compilation and execution

### Building a cross build environment with cheribuild

First, clone the cheribuild repo:

git clone https://github.com/CTSRD-CHERI/cheribuild.git -b std-cheri-riscv-microkit

The README.md file contains considerable information, but to get started, you'll need to bootstrap an LLVM compiler and a CHERI-Microkit build. Make sure you install all host dependencies for cheribuild, and Microkit (mainly Rust and libxml2-utils) first. Those could be found in their READMEs. For instance, on Debian-like Linux distributions, install the followings for Microkit.

curl https://sh.rustup.rs -sSf | sh

rustup target add x86\_64-unknown-linux-musl

apt install libxml2-utils

After you install the host dependencies, you can then build the CHERI-Microkit SDK. This will build LLVM, QEMU, OpenSBI, CHERI-seL4, and CHERI-Microkit. The easiest path to doing this is:

cheribuild.py cheri-microkit-baremetal-riscv64-zpurecap --cheri-microkit/build\_all -d

This will churn away, prompting occasionally as it bootstraps assorted dependencies. It should build SDKs to get CHERI-LLVM, CHERI-QEMU, CHERI-GDB, RISC-V's OpenSBI, CHERI-seL4, and CHERI-Microkit SDK.

Upon completion, you will find a usable Clang compiler in \~/cheri/output/cheri-alliance-sdk/bin/clang and a CHERI-Microkit SDK in \~/cheri/output/cheri-alliance-sdk/baremetal/baremetal-riscv64-zpurecap/microkit-sdk-2.0.1-dev (unless you have altered cheribuild's default paths).

## Compiler command line

In this set of exercises we cross compile in two basic modes. Conventional RISC-V ABI and the pure-capability ABI.

### Common elements

All command lines will share some comment elements to target 64-bit RISC-V, select the linker, and indicate where to find the CHERI-Microkit SDK.

Some conventions:

$MICROKIT\_SDK is the path to your CHERI-Microkit SDK.

MICROKIT\_TOOL $(MICROKIT\_SDK)/bin/microkit is a host tool to package and generate a single CHERI-Microkit bootable image.

$MICROKIT\_CONFIG is the build config for CHERI-Microkit. This could/should always be just "cheri".

$CHERISDK\_BINDIR \~/cheri/output/cheri-alliance-sdk/bin/ (unless you have altered cheribuild's default paths).

$BOARD is the platform to build CHERI-Microkit for. This should be qemu\_virt\_riscv64 for running on QEMU.

$CLANG is the path to your compiler, eg $CHERISDK\_BINDIR/clang.

All compiler commands begin with $CLANG -target riscv64-unknown-elf -fuse-ld=lld -mno-relax

As a rule, you will want to add -g to the command line to compile with debug symbols.

You will generally want to compile with -O2 as the unoptimized assembly is verbose and hard to follow.

We strongly recommend you compile with warnings on including -Wall and -Wcheri.

### RISC-V

Two additional arguments are required to specify the supported architectural features and ABI. For conventional RISC-V, those are: -march=rv64gc -mabi=lp64d. Putting it all together:

$CLANG -g -O2 -target riscv64-unknown-elf -fuse-ld=lld -mno-relax -march=rv64gc -mabi=lp64d -Wall -Wcheri

### CHERI-RISC-V (purecap)

For CHERI-RISC-V, the architecture and ABI flags are: -march=rv64gc\_zcherihybrid -mabi=l64pc128d. Putting it all together:

$CLANG -g -O2 -target riscv64-unknown-elf -fuse-ld=lld -mno-relax -march=rv64gc\_zcherihybrid -mabi=l64pc128d -Wall -Wcheri

## Executing binaries

CHERI-Microkit supports running RISC-V and CHERI-RISC-V side-by-side on the same instance, so provided the instance has all features available for the exercise or mission in question, you should be able to complete it on a single CHERI-Microkit instance.

CHERI-LLVM and the elfutils also recognise the relevant ELF flags. For example, CHERI-LLVM on the host used for cross-compiling will report:

\# llvm-readelf -h riscv-binary | grep Flags

Flags:                             0x5, RVC, double-float ABI

\# llvm-readelf -h cheri-binary | grep Flags

Flags:                             0x30005, RVC, double-float ABI, cheriabi, capability mode

In CHERI-Microkit, a host tool is run to package and generate a single bootable binary image that contains an ELF loader, the CHERI-seL4 microkernel, Microkit's run-time libraries, and user ELFs (protection domains) with an XML security policy file. This single image gets loaded at run-time and executes after OpenSBI (acting as a bios) for RISC-V. For each exercise here, we will need to cross-compile it as a user ELF (Microkit's protection domain), generate an entire system binary image, then load and run it (on QEMU). An example sequence of doing that looks like:

\# $CLANG -g -O2 -target riscv64-unknown-elf -fuse-ld=lld -mno-relax -march=rv64gc\_zcherihybrid -mabi=l64pc128d -Wall -Wcheri --sysroot=$MICROKIT\_SDK/board/$BOARD/$MICROKIT\_CONFIG -Tmicrokit.ld -nostdlib -ffreestanding -lmicrokit\_purecap -lutils\_purecap $EXERCISE.c -o $EXERCISE.elf

\# $MICROKIT\_TOOL $(EXERCISE).system --search-path $(BUILD\_DIR) --board $(BOARD) --config $(MICROKIT\_CONFIG) -o $(IMAGE\_FILE) -r $(REPORT\_FILE)

\# $CHERISDK\_BINDIR/qemu-system-riscv64cheri -machine virt -cpu codasip-a730 -serial mon:stdio -nographic -smp 1 -m size=2G -kernel $(IMAGE\_FILE)

In the following section, we provide helper scripts to easily build and run the exercises on QEMU to use at your convenience. Those scripts automate the above commands so that you don't need to type them every time you change an exercise.
