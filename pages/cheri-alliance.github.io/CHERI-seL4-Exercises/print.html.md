---
title: Adversarial CHERI Exercises and Missions on CHERI-seL4 microkernel and CHERI-Microkit
layout: source
permalink: /sources/cheri-alliance.github.io/html-pages/CHERI-seL4-Exercises/print.html
---

# [Adversarial CHERI Exercises and Missions on CHERI-seL4 microkernel and CHERI-Microkit](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#adversarial-cheri-exercises-and-missions-on-cheri-sel4-microkernel-and-cheri-microkit)
{: id="adversarial-cheri-exercises-and-missions-on-cheri-sel4-microkernel-and-cheri-microkit" }

Robert N. M. Watson (University of Cambridge), Brooks Davis (SRI
International), Wes Filardo (Microsoft Research), Jessica Clarke (University of
Cambridge), John Baldwin (Ararat River Consulting), and Hesham Almatary
(Capabilities Limited).

This repository contains a series of skills development and adversarial
exercises for [CHERI](http://cheri-cpu.org), specifically aimed at the
CHERI-RISC-V implementation, running on an experimental CHERI-seL4 microkernel
and its CHERI-Microkit userspace framework.

## [Acknowledgements](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#acknowledgements)
{: id="acknowledgements" }

The authors gratefully acknowledge Reuben Broadfoot, Lawrence Esswood, Brett
Gutstein, Joe Kiniry, Alex Richardson, Austin Roach, and Daniel Zimmerman for
their feedback and support in developing these exercises.

*Some portions of this document remain a work-in-progress. Feedback and
contributions are welcomed. Please see our [GitHub
Repository](https://github.com/CHERI-Alliance/CHERI-seL4-Exercises) for the source
code and an issue tracker.*



# [Introduction](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#introduction)
{: id="introduction" }

This set of exercises and adversarial missions is intended to:

- Build a baseline skillset with RISC-V and CHERI-RISC-V, as well as awareness
  of some of the dynamics of CHERI-enabled software, through skills development
  exercises.
- Develop adversarial experience with CHERI-RISC-V performing basic
  investigation around gradations of CHERI feature deployment through focused
  adversarial missions.

These activities supplement existing experience
with reverse engineering and exploitation on conventional architectures
and software stacks.

## [Platform](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#platform)
{: id="platform" }

These exercises are designed to be run on the CHERI-seL4 microkernel (in hybrid
mode) and its CHERI-Microkit userspace framework that enables pure-capability
protection domain environment.
They can be run on various instantiations of CHERI-RISC-V, including on QEMU
and on FPGA implementations.
QEMU-CHERI is a convenient instruction-set-level emulator, and is usually the
best starting point for most users (even those intending to eventually run on
hardware).
You can use our [cheribuild](https://github.com/CTSRD-CHERI/cheribuild) tool
to build the CHERI-RISC-V SDK, CHERI-seL4, CHERI-Microkit, and QEMU on macOS,
FreeBSD, and Linux.

## [Skills development exercises](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#skills-development-exercises)
{: id="skills-development-exercises" }

**Skills development exercises** are intended to take 1-2 hours each,
and ask you to build and perform minor modifications to simple
RISC-V and CHERI-RISC-V C/C++ programs. These exercises
facilitate building skills such as compiling, executing,
and debugging RISC-V and CHERI-RISC-V programs, as well as to build basic
understanding of CHERI C/C++ properties. We highlight some key edge
cases in CHERI, including the effects of bounds imprecision, subobject
bounds, weaker temporal safety, and C type confusion.

These exercises take for granted a strong existing understanding of:

- The C/C++ languages
- UNIX program compilation, execution, and debugging
- RISC ISAs and binary structures/reverse engineering (e.g., on MIPS or ARMv8)
- seL4 and Microkit concepts and development

## [Focused adversarial missions](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#focused-adversarial-missions)
{: id="focused-adversarial-missions" }

**Focused adversarial missions** are intended to take
1-3 days, and ask you to exploit, first on RISC-V, and
then on CHERI-RISC-V, documented vulnerabilities in simple "potted"
C/C++-language programs provided by the CHERI-RISC-V team. These missions
engage you more specifically in RISC-V exploitation, and CHERI's
security objectives and mechanisms.

**These take for granted good existing experience with
memory-safety-related attack techniques, such as buffer overflows,
integer-pointer type confusion, Return-Oriented Programming (ROP), and
Jump-Oriented Programming (JOP).**

Successful exploitation of RISC-V variants depends only upon
widely published understanding and techniques (e.g., buffer overflows
combined with ROP). For those familiar with conventional low-level
attack techniques, this will also act as a warm-up exercise on the
baseline RISC-V architecture and expand experience with RISC-V reverse
engineering and exploitation.

The CHERI-RISC-V team has confirmed exploitability for the RISC-V binary
in advance. We strongly recommend exploiting the RISC-V version of the code
first, as a starting point for understanding potential CHERI-RISC-V
exploitability.



# [Background reading](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#background-reading)
{: id="background-reading" }

To perform these exercises most effectively, we recommend first building a
working knowledge of CHERI and seL4. The most critical references will be the
*Introduction to CHERI* and *CHERI C/C++ Programming Guide*, but there is a
broad variety of other reference material available regarding CHERI, seL4,
and Microkit:

- [An Introduction to CHERI](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-941.pdf) - An overview of the CHERI architecture, security model, and programming models.
- [CHERI C/C++ Programming Guide](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-947.pdf) - This use of CHERI capabilities to represent C/C++ pointers requires modest changes to the way C and C++ are used. This document describes those changes.
- [Capability Hardware Enhanced RISC Instructions:
  CHERI Instruction-Set Architecture (Version 9)](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-987.pdf) - Instruction reference and design discussion.
- [CHERI-RISC-V specification](https://github.com/riscv/riscv-cheri/releases/tag/riscv-isa-release-e234d45-2025-06-24) - RISC-V Specification for CHERI Extensions.
- [seL4's Microkit](https://github.com/seL4/microkit/blob/main/docs/manual.md) - Microkit User Manual.
- [seL4 Manual](https://sel4.systems/Info/Docs/seL4-manual-latest.pdf) - seL4 Reference Manual.
- [CheriABI: Enforcing Valid Pointer Provenance and Minimizing Pointer Privilege in the POSIX C Run-time Environment](https://www.cl.cam.ac.uk/research/security/ctsrd/pdfs/201904-asplos-cheriabi.pdf) - This paper describes the CheriABI pure-capability process environment. An extended [technical report](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-932.pdf) is also available. CheriABI is not implemented in CHERI-Microkit, but it is worth reading.
- [Complete spatial safety for C and C++ using CHERI capabilities](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-949.pdf) - This PhD dissertation provides an extensive overview of the CHERI-MIPS linking model (also relevant to the current CHERI-RISC-V model), an implementation of opportunistic subobject bounds, and general C/C++ compatibility issues.



# [Cross compilation and execution](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#cross-compilation-and-execution)
{: id="cross-compilation-and-execution" }

### [Building a cross build environment with cheribuild](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#building-a-cross-build-environment-with-cheribuild)
{: id="building-a-cross-build-environment-with-cheribuild" }

First, clone the cheribuild repo:

~~~
git clone https://github.com/CTSRD-CHERI/cheribuild.git -b std-cheri-riscv-microkit
~~~

The [README.md](https://github.com/CTSRD-CHERI/cheribuild/blob/master/README.md) file contains considerable information, but to get started, you'll need to bootstrap an LLVM compiler and a CHERI-Microkit build.
Make sure you install all host dependencies for cheribuild, and [Microkit](https://github.com/seL4/microkit/blob/main/README.md) (mainly Rust and libxml2-utils) first. Those could be found in their READMEs. For instance, on Debian-like Linux distributions, install
the followings for Microkit.

~~~
curl https://sh.rustup.rs -sSf | sh
rustup target add x86_64-unknown-linux-musl
apt install libxml2-utils
~~~

After you install the host dependencies, you can then build the CHERI-Microkit SDK. This will build LLVM, QEMU, OpenSBI, CHERI-seL4, and CHERI-Microkit. The easiest path to doing this is:

~~~
cheribuild.py cheri-microkit-baremetal-riscv64-zpurecap --cheri-microkit/build_all -d
~~~

This will churn away, prompting occasionally as it bootstraps assorted dependencies. It should build SDKs to get CHERI-LLVM, CHERI-QEMU, CHERI-GDB, RISC-V's OpenSBI, CHERI-seL4, and CHERI-Microkit SDK.

Upon completion, you will find a usable Clang compiler in `~/cheri/output/cheri-alliance-sdk/bin/clang` and a CHERI-Microkit SDK in `~/cheri/output/cheri-alliance-sdk/baremetal/baremetal-riscv64-zpurecap/microkit-sdk-2.0.1-dev` (unless you have altered `cheribuild`'s default paths).

## [Compiler command line](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#compiler-command-line)
{: id="compiler-command-line" }

In this set of exercises we cross compile in two basic modes.
Conventional RISC-V ABI and the pure-capability ABI.

### [Common elements](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#common-elements)
{: id="common-elements" }

All command lines will share some comment elements to target 64-bit RISC-V, select the linker, and indicate where to find the CHERI-Microkit SDK.

Some conventions:

- `$MICROKIT_SDK` is the path to your CHERI-Microkit SDK.
- `MICROKIT_TOOL` `$(MICROKIT_SDK)/bin/microkit` is a host tool to package and generate a single CHERI-Microkit bootable image.
- `$MICROKIT_CONFIG` is the build config for CHERI-Microkit. This could/should always be just "cheri".
- `$CHERISDK_BINDIR` `~/cheri/output/cheri-alliance-sdk/bin/` (unless you have altered `cheribuild`'s default paths).
- `$BOARD` is the platform to build CHERI-Microkit for. This should be `qemu_virt_riscv64` for running on QEMU.
- `$CLANG` is the path to your compiler, eg `$CHERISDK_BINDIR/clang`.
- All compiler commands begin with `$CLANG -target riscv64-unknown-elf -fuse-ld=lld -mno-relax`
- As a rule, you will want to add `-g` to the command line to compile with debug symbols.
- You will generally want to compile with `-O2` as the unoptimized assembly is verbose and hard to follow.
- We strongly recommend you compile with warnings on including `-Wall` and `-Wcheri`.

### [RISC-V](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#risc-v)
{: id="risc-v" }

Two additional arguments are required to specify the supported architectural features and ABI. For conventional RISC-V, those are:  `-march=rv64gc -mabi=lp64d`.
Putting it all together:

~~~
$CLANG -g -O2 -target riscv64-unknown-elf -fuse-ld=lld -mno-relax -march=rv64gc -mabi=lp64d -Wall -Wcheri
~~~

### [CHERI-RISC-V (purecap)](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#cheri-risc-v-purecap)
{: id="cheri-risc-v-purecap" }

For CHERI-RISC-V, the architecture and ABI flags are:
`-march=rv64gc_zcherihybrid -mabi=l64pc128d`.
Putting it all together:

~~~
$CLANG -g -O2 -target riscv64-unknown-elf -fuse-ld=lld -mno-relax -march=rv64gc_zcherihybrid -mabi=l64pc128d -Wall -Wcheri
~~~

## [Executing binaries](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#executing-binaries)
{: id="executing-binaries" }

CHERI-Microkit supports running RISC-V and CHERI-RISC-V side-by-side on the same instance, so provided the instance has all features available for the exercise or mission in question, you should be able to complete it on a single CHERI-Microkit instance.

CHERI-LLVM and the elfutils also recognise the relevant ELF flags. For example, CHERI-LLVM on the host used for cross-compiling will report:

~~~
# llvm-readelf -h riscv-binary | grep Flags
  Flags:                             0x5, RVC, double-float ABI
# llvm-readelf -h cheri-binary | grep Flags
  Flags:                             0x30005, RVC, double-float ABI, cheriabi, capability mode
~~~

In CHERI-Microkit, a host tool is run to package and generate a single bootable binary image that contains an ELF loader, the CHERI-seL4 microkernel, Microkit's run-time libraries, and user ELFs (protection domains) with an XML security policy file. This single image gets loaded at run-time and executes
after OpenSBI (acting as a bios) for RISC-V. For each exercise here, we will need to cross-compile it as a user ELF (Microkit's protection domain), generate an entire system binary image, then load and run it (on QEMU). An example sequence of doing that looks like:

~~~
# $CLANG -g -O2 -target riscv64-unknown-elf -fuse-ld=lld -mno-relax -march=rv64gc_zcherihybrid -mabi=l64pc128d -Wall -Wcheri --sysroot=$MICROKIT_SDK/board/$BOARD/$MICROKIT_CONFIG -Tmicrokit.ld -nostdlib -ffreestanding -lmicrokit_purecap -lutils_purecap $EXERCISE.c -o $EXERCISE.elf
# $MICROKIT_TOOL $(EXERCISE).system --search-path $(BUILD_DIR) --board $(BOARD) --config $(MICROKIT_CONFIG) -o $(IMAGE_FILE) -r $(REPORT_FILE)
# $CHERISDK_BINDIR/qemu-system-riscv64cheri -machine virt -cpu codasip-a730 -serial mon:stdio -nographic -smp 1 -m size=2G -kernel $(IMAGE_FILE)
~~~

In the following section, we provide helper scripts to easily build and run the exercises on QEMU to use at your convenience. Those scripts automate the above commands so that you don't need to type them every time you change an exercise.



# [Helper scripts](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#helper-scripts)
{: id="helper-scripts" }

Because the command line required to compile exercises is quite unwieldy, we've created a wrapper script to help out, shown below. If you've checked out this repository it's present in `tools/ccc`. The usage is:

~~~
ccc <arch> [...]

Supported architectures:
	aarch64         - conventional AArch64
	morello-hybrid  - AArch64 Morello supporting CHERI
	morello-purecap - AArch64 Morello pure-capability
	riscv64         - conventional RISC-V 64-bit
	riscv64-hybrid  - RISC-V 64-bit supporting CHERI
	riscv64-purecap - RISC-V 64-bit pure-capability
~~~

and it can be used in place of your compiler.

For the exercises in this book you will use the `riscv64` and `riscv64-purecap` architectures. The `riscv64-hybrid` architecture instantiates appropriately annotated pointers as capabilities leaving the rest as conventional integer addresses, but is not used here.

If you have built a compiler and sysroot using `cheribuild` in the default location (`~/cheri`) then it should work out of the box. If you've configured a different location you can set the `CHERIBUILD_SDK` environment variable to point to to the location of your SDK. Alternatively, you can set the `CLANG` variable to point to the respective location.

~~~sh
#!/bin/sh
#
# ccc - Cross compilation script
set -e
set -u

name=$(basename "$0")

VERBOSE=${VERBOSE:-0}
QUIET=${QUIET:-0}

usage()
{
	cat <<EOF
$name <arch> <board> [...]

Supported architectures:
	morello-aarch64 - conventional AArch64
	morello-hybrid  - AArch64 Morello supporting CHERI
	morello-purecap - AArch64 Morello pure-capability
	riscv64         - conventional RISC-V 64-bit
	riscv64-hybrid  - RISC-V 64-bit supporting CHERI
	riscv64-purecap - RISC-V 64-bit pure-capability
EOF
	exit 1
}

err()
{
	ret=$1
	shift
	echo >&2 "$@"
	exit "$ret"
}

warn()
{
	echo >&2 "$@"
}

debug()
{
	if [ "$VERBOSE" -ne 0 ]; then
		echo >&2 "$@"
	fi
}

info()
{
	if [ "$QUIET" -eq 0 ]; then
		echo >&2 "$@"
	fi
}

run()
{
	debug	# add space before normal multiline output
	info "Running:" "$@"
	"$@"
}

if [ $# -eq 0 ]; then
	usage
fi

arch=$1
shift

if [ -n "${1:-}" ]; then
  board="$1"
  shift
fi

cheri_arch_basename=${arch%%-*}
cheri_sdk_name=sdk
case $arch in
morello-aarch64)
	cheri_arch_basename=morello
	cheri_sdk_name=morello-sdk
	arch_flags="-target aarch64-none-elf -march=armv8"
	microkit_ldflags="-lmicrokit -lutils"
	board="${board:-morello_qemu}"
	arch="morello-aarch64"
	;;
morello-hybrid)
	cheri_sdk_name=morello-sdk
	arch_flags="-target aarch64-unknown-freebsd -march=morello -Xclang -morello-vararg=new"
	microkit_ldflags="-lmicrokit -lutils"
	board="${board:-morello_qemu}"
	;;
morello-purecap)
	cheri_sdk_name=morello-sdk
	arch_flags="-target aarch64-none-elf -march=morello -mabi=purecap -Xclang -morello-vararg=new"
	microkit_ldflags="-lmicrokit_purecap -lutils_purecap -Wl,--local-caprelocs=legacy"
	board="${board:-morello_qemu}"
	;;
riscv64)
	cheri_sdk_name=cheri-alliance-sdk
	arch_flags="-target riscv64-unknown-elf -march=rv64gc -mabi=lp64d -mno-relax"
	microkit_ldflags="-lmicrokit -lutils"
	board="${board:-qemu_virt_riscv64}"
	;;
riscv64-hybrid)
	cheri_sdk_name=cheri-alliance-sdk
	arch_flags="-target riscv64-unknown-elf -march=rv64gc_zcherihybrid -mabi=lp64d -mno-relax"
	microkit_ldflags="-lmicrokit -lutils"
	board="${board:-qemu_virt_riscv64}"
	;;
riscv64-purecap)
	cheri_sdk_name=cheri-alliance-sdk
	arch_flags="-target riscv64-unknown-elf -march=rv64gc_zcherihybrid -mabi=l64pc128d -mno-relax"
	microkit_ldflags="-lmicrokit_purecap -lutils_purecap"
	board="${board:-qemu_virt_riscv64}"
	;;
*)
	err 1 "Unsupported architecture '$arch'"
	;;
esac

# Find our SDK, using the first of these that expands only defined variables:
#  ${CHERIBUILD_SDK_${cheri_sdk_name}} (if that syntax worked)
#  ${CHERIBUILD_SDK}
#  ${CHERIBUILD_OUTPUT}/${cheri_sdk_name}
#  ${CHERIBUILD_SOURCE}/output/${cheri_sdk_name}
#  ~/cheri/output/${cheri_sdk_name}

SDKDIR_SOURCE=${CHERIBUILD_SOURCE:-${HOME}/cheri}
SDKDIR_OUTPUT=${CHERIBUILD_OUTPUT:-${SDKDIR_SOURCE}/output}
SDKDIR_SDK=${CHERIBUILD_SDK:-${SDKDIR_OUTPUT}/${cheri_sdk_name}}
SDKDIR=$(eval echo \${CHERIBUILD_SDK_"${cheri_arch_basename}":-})
SDKDIR=${SDKDIR:-${SDKDIR_SDK}}

enverr()
{
	echo >&2 $1
	echo "Perhaps set or adjust one of the following environment variables:"
	for v in SOURCE OUTPUT SDK; do
		echo " " CHERIBUILD_$v \(currently: \
		  $(eval echo \${CHERIBUILD_$v:-unset, tried \$SDKDIR_$v})\)
	done

	A="CHERIBUILD_SDK_${cheri_arch_basename}"
	echo " " "$A" \(currently: $(eval echo \${$A:-unset, tried \$SDKDIR})\)

	echo " " "$2" \(currently: $(eval echo \${$2:-unset, tried \$SDK_$2})\)

	err 1 "Please check your build environment"
}

SDK_CLANG=${CLANG:-${SDKDIR}/bin/clang}

case $name in
*clang|*cc)	prog="${SDK_CLANG}" ;;
*clang++|*c++)	prog="${SDK_CLANG}++" ;;
*)	err 1 "Unsupported program name '$name'" ;;
esac
if [ ! -x "$prog" ]; then
	enverr "Target compiler '$prog' not found." "CLANG"
fi
debug "prog: $prog"

MICROKIT_SDK=${MICROKIT_SDK:-${SDKDIR}/baremetal/baremetal-${arch}/microkit-sdk-2.0.1-dev}
if [ ! -d "$MICROKIT_SDK" ]; then
       enverr "Microkit '$MICROKIT_SDK' does not exist." "MICROKIT_SDK"
fi
debug "microkit: $MICROKIT_SDK"

debug "arch_flags: $arch_flags"

debug_flags="-g"
debug "debug_flags: $debug_flags"

opt_flags="-O2"
debug "opt_flags: $opt_flags"

microkit_flags="-Wl,-L'$MICROKIT_SDK/board/$board/cheri/lib' -I'$MICROKIT_SDK/board/$board/cheri/include' -Wl,-Tmicrokit.ld -nostdlib -ffreestanding"
debug "microkit_flags: $microkit_flags"

linker_flags="-fuse-ld=lld"
debug "linker_flags: $linker_flags"

diag_flags="-Wall -Wcheri"
debug "diag_flags: $diag_flags"

all_flags="$arch_flags $debug_flags $opt_flags $linker_flags $diag_flags $microkit_flags $microkit_ldflags -DBOARD_$board "

all_flags_rev=
# shellcheck disable=SC2086 # intentional
eval 'for flag in '$all_flags'; do
	all_flags_rev="'"'"'$flag'"'"'${all_flags_rev:+ $all_flags_rev}"
done'

# shellcheck disable=SC2086 # intentional
eval 'for flag in '$all_flags_rev'; do
	set -- "$flag" "$@"
done'

run "$prog" "$@"
~~~

The second script is to generate a bootable image and run it on QEMU; it's present in `tools/run_qemu`. The usage is:

~~~
run_qemu <image.elf | image.img>
~~~

If you pass it an ELF file generated by `ccc`, it will wrap it, along with the CHERI-seL4 kernel, CHERI-Microkit libraries, loader, monitor, etc. to give you a bootable image and run it directly on QEMU by passing it as a -kernel image. The following is the script's content:

~~~sh
#!/bin/sh

set -e

# --- Configuration ---
# Find path to this script and to gen_image
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
GEN_IMAGE="$SCRIPT_DIR/gen_image"

cheri_sdk_name=cheri-alliance-sdk
# Setup SDK path
SDKDIR_SOURCE=${CHERIBUILD_SOURCE:-$HOME/cheri}
SDKDIR_OUTPUT=${CHERIBUILD_OUTPUT:-$SDKDIR_SOURCE/output}
SDKDIR_SDK=${CHERIBUILD_SDK:-$SDKDIR_OUTPUT/${cheri_sdk_name}}
SDKDIR=${SDKDIR:-$SDKDIR_SDK}

QEMU_BIN="$SDKDIR/bin/qemu-system-riscv64cheri"

# Default BIOS path, relative to SDKDIR
BIOS="$SDKDIR/cheri-alliance-opensbi/riscv64/share/opensbi/l64pc128/generic/firmware/fw_jump.elf"

# --- Input Parsing ---
if [ $# -lt 1 ]; then
    echo "Usage: $0 <image.elf | image.img>"
    exit 1
fi

INPUT="$1"
shift  # Remaining args are passed to QEMU
QEMU_EXTRA_ARGS="$@"

# --- ELF detection using 'file' ---
FILE_TYPE=$(file -b "$INPUT")
case "$FILE_TYPE" in
    *"ELF "*)
        echo "Detected ELF binary. Generating image..."
        "$GEN_IMAGE" "$INPUT"
        KERNEL_IMAGE="loader.img"
        ;;
    *)
        echo "Detected non-ELF image. Using it directly."
        KERNEL_IMAGE="$INPUT"
        ;;
esac

# --- Run QEMU ---
CMD="$QEMU_BIN -M virt -cpu codasip-a730,cheri_levels=2 -smp 1 -serial pty -m 2G -nographic -bios \"$BIOS\" -kernel \"$KERNEL_IMAGE\" $QEMU_EXTRA_ARGS"
echo "Running QEMU command:"
echo "$CMD"
eval "$CMD"
~~~

This `run_qemu` script uses another `gen_image` script that generates a bootable CHERI-Microkit image as shown below:

~~~sh
#!/bin/sh
#
# gen_image - Generate bootable Microkit image script
set -e
set -u

name=$(basename "$0")

VERBOSE=${VERBOSE:-0}
QUIET=${QUIET:-0}

# Print usage information
usage() {
    echo "Usage: $0 [-a arch] [-o output_image] input1 [input2 ...]"
    echo ""
    echo "  -a arch           Target architecture (riscv64, riscv64-purecap, morello-aarch64, morello-purecap)"
    echo "  -b board          Target board (qemu_virt_riscv64, morello_qemu, ariane)"
    echo "  -o output_image   Optional output image name (default: loader.img)"
    echo "  inputN            One or more input ELF (or binary) files"
    echo ""
    echo "Example:"
    echo "  $0 -a riscv64-purecap -o myos.img hello foo bar"
    exit 1
}

err()
{
    ret=$1
    shift
    echo >&2 "$@"
    exit "$ret"
}

warn()
{
    echo >&2 "$@"
}

debug()
{
    if [ "$VERBOSE" -ne 0 ]; then
        echo >&2 "$@"
    fi
}

info()
{
    if [ "$QUIET" -eq 0 ]; then
        echo >&2 "$@"
    fi
}

run()
{
    debug   # add space before normal multiline output
    info "Running:" "$@"
    "$@"
}

if [ $# -eq 0 ]; then
    usage
fi

# Defaults
TARGET=""
OUTPUT_FILE="generated.system"
IMAGE_NAME="loader.img"
INPUT_FILES=""
SEARCH_PATH="$(pwd)"

# Parse args
while [ $# -gt 0 ]; do
    case "$1" in
        -a)
            shift
            [ $# -eq 0 ] && echo "Error: -a requires an argument" && usage
            TARGET="$1"
            ;;
        -b)
            shift
            [ $# -eq 0 ] && echo "Error: -b requires an argument" && usage
            BOARD="$1"
            ;;
        -o)
            shift
            [ $# -eq 0 ] && echo "Error: -o requires an argument" && usage
            IMAGE_NAME="$1"
            ;;
        -*)
            echo "Error: Unknown option: $1"
            usage
            ;;
        *)
            INPUT_FILES="$INPUT_FILES $1"
            ;;
    esac
    shift
done

[ -z "$INPUT_FILES" ] && echo "Error: No input files provided" && usage
[ -z "$TARGET" ] && echo "Error: -a (arch) is required" && usage

# Pick board + SDK based on architecture
case "$TARGET" in
    riscv64|riscv64-purecap)
        BOARD="${BOARD:-qemu_virt_riscv64}"
        cheri_sdk_name="cheri-alliance-sdk"
        ;;
    morello-aarch64|morello-purecap)
        BOARD="${BOARD:-morello_qemu}"
        cheri_sdk_name="morello-sdk"
        ;;
    *)
        err 1 "Unknown target architecture: $TARGET"
        ;;
esac

# SDK paths
SDKDIR_SOURCE=${CHERIBUILD_SOURCE:-${HOME}/cheri}
SDKDIR_OUTPUT=${CHERIBUILD_OUTPUT:-${SDKDIR_SOURCE}/output}
SDKDIR_SDK=${CHERIBUILD_SDK:-${SDKDIR_OUTPUT}/${cheri_sdk_name}}
SDKDIR=${SDKDIR:-${SDKDIR_SDK}}

enverr()
{
    echo >&2 $1
    echo "Perhaps set or adjust one of the following environment variables:"
    for v in SOURCE OUTPUT SDK; do
        echo " " CHERIBUILD_$v \(currently: \
          $(eval echo \${CHERIBUILD_$v:-unset, tried \$SDKDIR_$v})\)
    done

    err 1 "Please check your build environment"
}

SDK_MICROKIT=${CLANG:-${SDKDIR}/bin/clang}

MICROKIT_SDK=${MICROKIT_SDK:-${SDKDIR}/baremetal/baremetal-${TARGET}/microkit-sdk-2.0.1-dev}
if [ ! -d "$MICROKIT_SDK" ]; then
       enverr "Microkit '$MICROKIT_SDK' does not exist." "MICROKIT_SDK"
fi
debug "microkit: $MICROKIT_SDK"

MICROKIT_TOOL=${MICROKIT_SDK}/bin/microkit
debug "MICROKIT_TOOL: $MICROKIT_TOOL"

# Generate XML
{
    echo '<?xml version="1.0" encoding="UTF-8"?>'
    echo '<system>'
    for file in $INPUT_FILES; do
        base=$(basename "$file")
        echo "    <protection_domain name=\"$base\">"
        echo "        <program_image path=\"$base\" />"
        echo "    </protection_domain>"
    done
    echo '</system>'
} > "$OUTPUT_FILE"

echo "Generated $OUTPUT_FILE from input files:$INPUT_FILES"
echo "Running Microkit tool to generate image: $IMAGE_NAME"
echo "$MICROKIT_TOOL $OUTPUT_FILE -o $IMAGE_NAME --search-path $SEARCH_PATH --board $BOARD --config cheri"

"$MICROKIT_TOOL" "$OUTPUT_FILE" -o "$IMAGE_NAME" --search-path "$SEARCH_PATH" --board "$BOARD" --config "cheri"
~~~

Thus, over these exercises, you'll usually be using mostly using just two scripts (given you either include them in your $PATH, or use relative/absolute paths when running them):

~~~
# ccc riscv64-purecap exercise_c_files.c -o exercise.elf
# run_qemu exercise.elf
~~~



# [Skills Development Exercises](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#skills-development-exercises-1)
{: id="skills-development-exercises-1" }

For a researcher to contribute effectively to CHERI-RISC-V evaluation,
they will need a baseline skill-set that includes significant existing
experience with:

- C/C++-language memory-safety vulnerabilities
- Binary reverse engineering for at least one ISA, such as x86, MIPS, ARMv7, or ARMv8
- Low-level aspects of program representation, such as ELF, GOTs, and PLTs, as well as mechanisms such as dynamic linking and system-call handling
- Attack techniques against program control flow and underlying data structures including ROP and JOP

However, we expect that researchers may need to build specific
additional skills with respect to the specifics of RISC-V machine code,
assembly, language, and linkage, as well as knowledge about the CHERI
C/C++ protection model and CHERI-RISC-V extensions to RISC-V. These
exercises are intended to assist in these latter two areas, faulting
in missing knowledge and experience while building on existing skills
gained on other architectures (such as x86-64 and ARMv8). Participants
successfully completing these exercises will be able to:

- Compile, run, disassemble, and debug RISC-V compiled C/C++ programs
- Compile, run, disassemble, and debug CHERI-RISC-V compiled C/C++ programs
- Use specific debugging tools such as GDB and llvm-objdump with RISC-V and CHERI-RISC-V programs
- Understand some of the implications of CHERI protections for specific aspects of C/C++ and process execution

Each exercise includes:

- Sample source code and build instructions
- A short document describing what the program does and the objectives
- Where there are exercise questions, sample answers



# [Compile and run RISC-V and CHERI-RISC-V programs](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#compile-and-run-risc-v-and-cheri-risc-v-programs)
{: id="compile-and-run-risc-v-and-cheri-risc-v-programs" }

This exercise steps you through getting up and running with code compilation
and execution for RISC-V and CHERI-RISC-V programs.

The first test program is written in conventional C, and can be compiled
to RISC-V or CHERI-RISC-V targets:

1. Compile `print-pointer.c` with a RISC-V target and a binary name of
   `print-pointer-riscv`.

**print-pointer.c:**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

void
init(void)
{
	printf("size of pointer: %zu\n", sizeof(void *));
	/* XXX: ideally we'd use ptraddr_t below */
	printf("size of address: %zu\n", sizeof(size_t));
}

void notified(void){}
~~~

2. Run the binary.
3. Compile `print-pointer.c` with a CHERI-RISC-V target and a binary name
   of `print-pointer-cheri`.
4. Run the binary: it should print a pointer size of `16` and address size
   of `8`.

The second test program is written in CHERI C:

5. Compile `print-capability.c` with a CHERI-RISC-V target and a binary name
   of `print-capability`.

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

void
init(void)
{
	int i;
	char *c;
	void *cap_to_int = &i;
	void *cap_to_cap = &c;

	printf("cap to int length: %lu\n", __builtin_cheri_length_get(cap_to_int));
	printf("cap to cap length: %lu\n", __builtin_cheri_length_get(cap_to_cap));
}

void notified(void){}
~~~

6. Run the binary: note how the length of the capability depends on the size of
   the type it points to.



# [Answers - Compile and run RISC-V and CHERI-RISC-V programs](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers---compile-and-run-risc-v-and-cheri-risc-v-programs)
{: id="answers---compile-and-run-risc-v-and-cheri-risc-v-programs" }

This exercise explores the difference in size between addresses and
pointers, drawing attention to the pointer-focused nature of CHERI memory
protection.

2. Expected output:

~~~
# run_qemu ./print-pointer-riscv
...
size of pointer: 8
size of address: 8
~~~

4. Expected output:

~~~
# run_qemu ./print-pointer-cheri
...
size of pointer: 16
size of address: 8
~~~

6. Expected output:

~~~
...
# run_qemu ./print-capability
cap to int length: 4
cap to cap length: 16
~~~



# [Disassemble and debug RISC-V and CHERI-RISC-V programs](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#disassemble-and-debug-risc-v-and-cheri-risc-v-programs)
{: id="disassemble-and-debug-risc-v-and-cheri-risc-v-programs" }

This exercise steps you through disassembling and debugging
RISC-V and CHERI-RISC-V programs. It draws attention to differences in
program structure and code generation, particularly relating to control
flow, between the two compilation targets.

First, use `llvm-objdump` on the host (which you can find at
`~/cheri/output/cheri-alliance-sdk/bin/llvm-objdump`, unless you have altered `cheribuild`'s
default paths) to disassemble and explore the two binaries from the previous
exercise:

1. Using `llvm-objdump -dS`, disassemble the `print-pointer-riscv` and
   `print-pointer-cheri` binaries.
2. What instructions are generated to load `printf()`'s format string argument
   in `print-pointer-riscv`? Where does the target address for the string
   pointer originate?
3. What instructions are generated to load `printf()`'s format string argument
   in `print-pointer-cheri`? Where does the target capability for the string
   pointer originate? (Hint, you may find it helpful to add the `-s` flag to
   your `llvm-objdump` command to see all sections.)

Next use GDB to explore binary execution for RISC-V:

4. Run `print-pointer-riscv` under GDB (same path as llvm-objdump),
   setting a breakpoint at the start of `printf()`.
   *Note:* You will need to run QEMU in halted mode and make it wait for GDB
   connections, then, from another shell, run GDB on the ELF, connect to QEMU,
   then debug. An example sequence of commands will look like the following:

~~~
# run_qemu print-pointer-riscv -s -S

# gdb print-pointer-riscv
Reading symbols from print-pointer-riscv...
(gdb) target remote :1234
Remote debugging using :1234
0x0000000000001000 in ?? ()
(gdb) break printf_
Breakpoint 1 at 0x200090: file src/printf.c, line 1151.
(gdb) c
Breakpoint 1, printf_ (format=0x201f5d "size of pointer: %zu\n") at src/printf.c:1151
~~~

5. Run the program and at the breakpoint, print out the value of the
   string pointer argument.
6. Print out the program counter (`info reg pc`).
   What memory mapping is it derived from?

And for CHERI-RISC-V:

7. Run `print-pointer-cheri` under GDB, setting a breakpoint at the start
   of `printf()`.
8. Print out the value of the string pointer argument.
9. Print out the program counter (`info reg pcc`).
   Where do its bounds appear to originate from?
10. Print out the register file using `info registers`.
    What mappings do the capabilities in the register file point to?
    Notice that some capabilities have `S` in their permissions which means they
    are sentries. Sentry capabilities are sealed (cannot be modified or used to
    load or store), but can be used as a jump target (where they are unsealed and
    installed in `pcc`).
    What implications does this have for attackers?



# [Answers - Disassemble and debug RISC-V and CHERI-RISC-V programs](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers---disassemble-and-debug-risc-v-and-cheri-risc-v-programs)
{: id="answers---disassemble-and-debug-risc-v-and-cheri-risc-v-programs" }

2. The target address of the string pointer is constructed as an integer by
   emitting lui/addi to form a literal number. The sequence looks like:

~~~
  200050: 37 25 20 00   lui     a0, 514
  200054: 13 05 d5 f5   addi    a0, a0, -163
~~~

3. The target capability pointer for the string is loaded from the `.captable`
   section by a sequence like:

~~~
  20005c: 17 35 00 00   auipc   ca0, 3
  200060: 0f 45 45 0f   lc      ca0, 244(ca0)
~~~

4. Example session:

~~~
(gdb) break printf_
Breakpoint 1 at 0x200090: file src/printf.c, line 1151.
(gdb) c
Breakpoint 1, printf_ (format=0x201f5d "size of pointer: %zu\n") at src/printf.c:1151
~~~

5. Example session:

~~~
(gdb) c
Breakpoint 1, printf_ (format=0x201f5d "size of pointer: %zu\n") at src/printf.c:1151
(gdb) info reg a0
a0             0x3fffffef78     274877902712
~~~

6. Example session:

~~~
(gdb) info reg pc
pc             0x200090 0x200090 <printf_+22>
~~~

7. Example session:

~~~
(gdb) info reg pc
pc             0x401bf640       1075574336
~~~

8. Example session:

~~~
(gdb) info reg ca0
ca0            0x1ee580005b4e6bd00000000002026bd        0x2026bd [V:1111:C:r..C.l..:1:.:0x2026bd-0x2026d3]
~~~

9. Example session:

~~~
(gdb) info reg pcc
pcc            0x1eed800000180020000000000200098        0x200098 <printf_+12> [V:1111:C:r.xC.l..:1:.:0x200000-0x204000]
~~~

10. Left as an exercise to the reader.



# [Demonstrate CHERI Tag Protection](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#demonstrate-cheri-tag-protection)
{: id="demonstrate-cheri-tag-protection" }

This exercise demonstrates CHERI's *capability provenance tags*, in particular
by showing that capabilities and their constituent bytes are subtly different
things!

1. Compile `cheri-tags.c` for the baseline architecture to the binary
   `cheri-tags-baseline` and for the CHERI-aware architecture to
   `cheri-tags-cheri`.
2. Run both programs and observe the output.
3. Inspect the error thrown to the CHERI program, and the registers dump.
4. Examine the disassembly of the construction of `q`,

   ~~~
   uint8_t *q = (uint8_t*)(((uintptr_t)p.ptr) & ~0xFF);
   ~~~

   and the byte-wise mutation of `p.ptr` to construct `r`,

   ~~~
   p.bytes[0] = 0;
   uint8_t *r = p.ptr;
   ~~~

   in both baseline and CHERI-enabled programs.

   What stands out?
5. Given that `q` and `r` appear to have identical byte representation in
   memory, why does the CHERI version crash when dereferencing `r`?

## [Source](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#source)
{: id="source" }

**cheri-tags.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (c) 2022 Microsoft Corporation
 */
#include <stdint.h>
#include <printf.h>

#ifdef __CHERI_PURE_CAPABILITY__
#include <cheri.h>
#define PRINTF_PTR "#p"
#else
#define PRINTF_PTR "p"
#endif

void
init(void)
{
	char buf[0x1FF];

	volatile union {
		char *ptr;
		char bytes[sizeof(char*)];
	} p;

	for (size_t i = 0; i < sizeof(buf); i++) {
		buf[i] = i;
	}
	p.ptr = &buf[0x10F];

	printf("buf=%" PRINTF_PTR " &p=%" PRINTF_PTR "\n", buf, &p);
	printf("p.ptr=%" PRINTF_PTR " (0x%zx into buf) *p.ptr=%02x\n",
	    p.ptr, p.ptr - buf, *p.ptr);

	/* One way to align the address down */
	char *q = (char*)(((uintptr_t)p.ptr) & ~0xFF);
	printf("q=%" PRINTF_PTR " (0x%zx into buf)\n", q, q - buf);

	printf("*q=%02x\n", *q);

	/* Maybe another, assuming a little-endian machine. */
	p.bytes[0] = 0;
	char *r = p.ptr;

	printf("r=%" PRINTF_PTR " (0x%zx)\n", r, r - buf);
	printf("*r=%02x\n", *r);
}

void notified(void){}
~~~



# [Answers](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers)
{: id="answers" }

2. Example output for the baseline program:

   ~~~
    buf=0000003FFFFFEDA9 &p=0000003FFFFFEDA0
    p.ptr=0000003FFFFFEEB8 (0x10f into buf) *p.ptr=0f
    q=0000003FFFFFEE00 (0x57 into buf)
    *q=57
    r=0000003FFFFFEE00 (0x57)
    *r=57
   ~~~

   And for the CHERI-enabled program:

   ~~~
    init=0x200058 [rxCM1111,0x200000-0x202db0] (capmode) (sentry)
    buf=0x3fffffed41 [rwCM1111,0x3fffffed41-0x3fffffef40] &p=0x3fffffed30 [rwCM1111,0x3fffffed30-0x3fffffed40]
    p.ptr=0x3fffffee50 [rwCM1111,0x3fffffed41-0x3fffffef40] (0x10f into buf) *p.ptr=0f
    q=0x3fffffee00 [rwCM1111,0x3fffffed41-0x3fffffef40] (0xbf into buf)
    *q=bf
    r=0x3fffffee00 [rwCM1111,0x3fffffed41-0x3fffffef40] (invalid) (0xbf)
    MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
    MON|ERROR: faulting PD: cheri-tags-cheri
   ~~~
3. The CHERI-Microkit's `MONITOR` should report something like

   ~~~
    MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
    MON|ERROR: faulting PD: cheri-tags-cheri
    Registers:
    ddc : 0x0
    pcc : 0x200132 [rxCM1111,0x200000-0x204000] (capmode)
    cra : 0x200132 [rxCM1111,0x200000-0x204000] (capmode) (sentry)
    csp : 0x3fffffed10 [rwCM1111,0x3fffffe000-0x3ffffff000]
    cgp : 0x0
    cs0 : 0x3fffffed41 [rwCM1111,0x3fffffed41-0x3fffffef40]
    cs1 : 0x3fffffee00
    cs2 : 0x0
    cs3 : 0x203000 [rwCM1111,0x203000-0x203010]
    cs4 : 0x0
    cs5 : 0x0
    cs6 : 0x0
    cs7 : 0x0
    cs8 : 0x0
    cs9 : 0x0
    cs10 : 0x0
    cs11 : 0x0
    ca0 : 0x43
    ca1 : 0x3fffffecef [rwCM1111,0x3fffffecef-0x3fffffecf0]
    ca2 : 0x43
    ca3 : 0xffffffffffffffff
    ca4 : 0x0
    ca5 : 0x0
    ca6 : 0x0
    ca7 : 0xfffffffffffffff4
    ct0 : 0x78
    ct1 : 0x201d94 [rxCM1111,0x200000-0x202db0] (capmode)
    ct2 : 0x0
    ct3 : 0x0
    ct4 : 0x100
    ct5 : 0x0
    ct6 : 0x0
    ctp : 0x0
    MON|ERROR: CHERI Security Violation: ip=0x0000000000200132  fault_addr=0x0000003fffffee00  fsr=0x0000000000000810  (data fault)
    MON|ERROR: description of fault: Tag violation
    MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO
    <<seL4(CPU 0) [receiveIPC/142 T0xffffffc0fffe6400 "rootserver" @8a000460]: Reply object already has unexecuted reply!>>
   ~~~

   This tells you there was an attempt to access an untagged CHERI pointer at PC=0x200132. The faulting address of the CHERI pointer
   is 0x3fffffee00. if you look at the registers dump, you will find `cs1` holding that address, without any capability metadata.
   This means it is an invalid pointer capability, and thus it only prints its address field. If you use llvm-obdjump or QEMU/GDB
   to investiage further what instruction that is, you would find something similar to the following:

   ~~~
   200132: 83 c5 04 00   lbu     a1, 0(cs1)
   200136: 17 35 00 00   auipc   ca0, 3
   20013a: 0f 45 a5 1a   lc      ca0, 426(ca0)
   20013e: 2e e0         sd      a1, 0(csp)
   200140: 97 00 00 00   auipc   cra, 0
   200144: e7 80 60 01   jalr    22(cra)
   ~~~
4. Constructing `r` is very similar on the two targets, differing only by the
   use of integer- or capability-based memory instructions:

   |  | Baseline | CHERI |
   | --- | --- | --- |
   | Store | `sb zero, 0(sp)` | `sb zero, 32(csp)` |
   | Load | `ld s0, 0(sp)` | `lc cs1, 32(csp)` |

   The significant difference is in the construction of `q`. On the baseline
   architecture, it is a direct bitwise `and` of a pointer loaded from memory:

   ~~~
   ld   a0, 0(sp)
   andi s0, a0, -256
   ~~~

   On CHERI, on the other hand, the program makes explicit use of capability
   manipulation instructions to...

   | Instruction | Action |
   | --- | --- |
   | `lc ca0, 32(csp)` | Load the capability from memory |
   | `andi a1, a0, -256` | Perform the mask operation on integer/address (field of) registers |
   | `scaddr cs1, ca0, a1` | Update the address field |

   This longer instruction sequence serves to prove to the processor that the
   resulting capability (in `cs1`) was constructed using valid transformations.
   In particular, the `scaddr` allows the processor to check that the
   combination of the old capability (in `ca0`) and the new address (in `a1`)
   remains *representable*.
5. While the in-memory, byte representation of `q` and `r` are identical, `r`
   has been manipulated as *bytes* rather than as a *capability* and so has had
   its tag zeroed. (Specifically, the `sb zero, 32(csp)` instruction cleared
   the tag associated with the 16-byte granule pointed to by `32(csp)`; the
   subsequent `lc` transferred this zero tag to `cs1`.)



# [Exercise an inter-stack-object buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#exercise-an-inter-stack-object-buffer-overflow)
{: id="exercise-an-inter-stack-object-buffer-overflow" }

This exercise demonstrates an inter-object buffer overflow on baseline and
CHERI-enabled architectures, and asks you to characterize and fix the bug
detected by CHERI bounds enforcement. It also asks you to use GDB for
debugging purposes.

By contrast to [the globals-based example](https://cheri-alliance.github.io/CHERI-seL4-Exercises/exercises/buffer-overflow-global), this
example uses two *stack* objects to demonstrate the overflow. We will be able
to see the CHERI C compiler generate code to apply spatial bounds on the
capability used for the buffer pointer we pass around.

1. Compile `buffer-overflow-stack.c` for the baseline architecture to
   the binary `buffer-overflow-stack-baseline` and for the CHERI-aware
   architecture to `buffer-overflow-stack-cheri`.
2. Run both programs and observe their outputs.
3. Using GDB and/or the Monitor's error messages:
   Why has the CHERI program failed?
4. Compare and contrast the disassembly of the baseline and CHERI programs.
   In particular, focus on the `write_buf` function and `init`'s call to it
   and the information flow leading up to it.

## [Source](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#source-1)
{: id="source-1" }

**buffer-overflow-stack.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (c) 2022 Microsoft Corporation
 */
#include <stddef.h>
#include <printf.h>
#include <sel4/assert.h>

#pragma weak write_buf
void
write_buf(char *buf, size_t ix)
{
	buf[ix] = 'b';
}

void
init(void)
{
	char upper[0x10];
	char lower[0x10];

	printf("upper = %p, lower = %p, diff = %zx\n",
	    upper, lower, (size_t)(upper - lower));

	/* Assert that these get placed how we expect */
	seL4_Assert((ptraddr_t)upper == (ptraddr_t)&lower[sizeof(lower)]);

	upper[0] = 'a';
	printf("upper[0] = %c\n", upper[0]);

	write_buf(lower, sizeof(lower));

	printf("upper[0] = %c\n", upper[0]);
}

void notified(){}
~~~



# [Answers - Exercise an inter-stack-object buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers---exercise-an-inter-stack-object-buffer-overflow)
{: id="answers---exercise-an-inter-stack-object-buffer-overflow" }

2. Expected output:

   ~~~
   # run_qemu ./buffer-overflow-stack-baseline
   upper = 0000003FFFFFEFA0, lower = 0000003FFFFFEF90, diff = 10
   upper[0] = a
   upper[0] = b
   # run_qemu ./buffer-overflow-stack-cheri
   upper = 00000000000000000000003FFFFFEF30, lower = 00000000000000000000003FFFFFEF20, diff = 10
   upper[0] = a
   MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
   MON|ERROR: faulting PD: buffer-overflow-stack-cheri
   ~~~
3. An example of the Monitor's output for buffer-overflow-stack-cheri\` on CHERI-RISC-V:

   ~~~
    MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
    MON|ERROR: faulting PD: buffer-overflow-stack-cheri
    Registers:
    ddc : 0x0
    pcc : 0x200060 [rxCM1111,0x200000-0x204000] (capmode)
    cra : 0x2000ea [rxCM1111,0x200000-0x204000] (capmode) (sentry)
    csp : 0x3fffffeef0 [rwCM1111,0x3fffffe000-0x3ffffff000]
    cgp : 0x0
    cs0 : 0x3fffffef20 [rwCM1111,0x3fffffef20-0x3fffffef30]
    cs1 : 0x202693 [rCM1111,0x202693-0x2026a2]
    cs2 : 0x0
    cs3 : 0x203000 [rwCM1111,0x203000-0x203010]
    cs4 : 0x0
    cs5 : 0x0
    cs6 : 0x0
    cs7 : 0x0
    cs8 : 0x0
    cs9 : 0x0
    cs10 : 0x0
    cs11 : 0x0
    ca0 : 0x3fffffef30 [rwCM1111,0x3fffffef20-0x3fffffef30]
    ca1 : 0x62
    ca2 : 0xd
    ca3 : 0xffffffffffffffff
    ca4 : 0x0
    ca5 : 0x0
    ca6 : 0x0
    ca7 : 0xfffffffffffffff4
    ct0 : 0x0
    ct1 : 0x201d46 [rxCM1111,0x200000-0x202cf0] (capmode)
    ct2 : 0x0
    ct3 : 0x0
    ct4 : 0x0
    ct5 : 0x0
    ct6 : 0x0
    ctp : 0x0
    MON|ERROR: CHERI Security Violation: ip=0x0000000000200060  fault_addr=0x0000003fffffef30  fsr=0x0000000000000814  (data fault)
    MON|ERROR: description of fault: Bounds violation
    MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO
    <<seL4(CPU 0) [receiveIPC/142 T0xffffffc0fffe6400 "rootserver" @8a000460]: Reply object already has unexecuted reply!>
   ~~~

   Using GDB or llvm-objdump to see what instructions at the faulting PC (ip=0x000200060), we see:

   ~~~
   ;       buf[ix] = 'b';
   200060: 23 00 b5 00   sb      a1, 0(ca0)
   ~~~

   If we investigate the content of `ca0` (either using GDB's `info reg $ca0` or from the register dump), we can see it does have something
   like:

   ~~~
   ca0 : 0x3fffffef30 [rwCM1111,0x3fffffef20-0x3fffffef30]
   ~~~

   The capability in `ca0`, which is a pointer into the `lower` buffer, has been
   taken beyond the end of the allocation, as out of bounds store has been
   attempted (`Bounds violation`).

   But where did those bounds originate? Heading `up` a stack frame and
   `disass`embling, we see (eliding irrelevant instructions):

   ~~~
    (gdb) up
    #1  0x00000000002000ea in init () at buffer-overflow-stack.c:31
    31              write_buf(lower, sizeof(lower));
    (gdb) disass
    Dump of assembler code for function init:
       0x0000000000200066 <+0>:     c.addi16sp      csp,-128

       0x0000000000200074 <+14>:    c.addi4spn      a0,csp,48
       0x0000000000200076 <+16>:    scbndsi cs0,ca0,16

       0x00000000002000dc <+118>:   li      a1,16
       0x00000000002000de <+120>:   mv      ca0,cs0
       0x00000000002000e2 <+124>:   auipcc  cra,0x0
       0x00000000002000e6 <+128>:   jalr    -138(cra)
    => 0x00000000002000ea <+132>:   lbu     a0,64(csp)
   ~~~

   The compiler has arranged for `init` to allocate 128 bytes on the stack by
   decrementing the *capability stack pointer* register (`csp`) by 128 bytes.
   Further, the compiler has placed `lower` 48 bytes up into that allocation:
   `ca0` is made to point at its lowest address and then the pointer to `lower`
   is materialized in `cs0` by *bounding* the capability in `ca0` to be 16
   (`sizeof(lower)`) bytes long. This capability is passed to `write_buf` in
   `ca0`.
4. The code for `write_buf` function is only slightly changed. On
   RISC-V it compiles to

   ~~~
    20004c <write_buf>:
    20004c: 2e 95         add     a0, a0, a1
    20004e: 93 05 20 06   li      a1, 98
    200052: 23 00 b5 00   sb      a1, 0(a0)
    200056: 82 80         ret
   ~~~

   while on CHERI-RISC-V, it is

   ~~~
    200058 <write_buf>:
    200058: 33 05 b5 0c   cadd    ca0, ca0, a1
    20005c: 93 05 20 06   li      a1, 98
    200060: 23 00 b5 00   sb      a1, 0(ca0)
    200064: 82 80         ret
   ~~~

   In both cases, it amounts to displacing the pointer passed in `a0` (resp.
   `ca0`) by the offset passed in `a1` and then performing a store-byte
   instruction before returning. In the baseline case, the store-byte takes an
   *integer* address for its store, while in the CHERI case, the store-byte takes
   a *capability authorizing the store*. There are no conditional branches or
   overt bounds checks in the CHERI instruction stream; rather, the `sb`
   instruction itself enforces the requirement for authority to write to memory,
   in the shape of a valid, in-bounds capability.

   We have already seen the CHERI program's call site to `write_buf` in `init`,
   and the derivation of the capability to the `lower` buffer, above. In the
   baseline version, the corresponding instructions are shown as

   ~~~
    Breakpoint 1, init () at buffer-overflow-stack.c:23
    23                  upper, lower, (size_t)(upper - lower));
    (gdb) disassemble init
    Dump of assembler code for function init:
       0x0000000000200058 <+0>:     addi    sp,sp,-48

       0x00000000002000c0 <+104>:   mv      a0,sp
       0x00000000002000c2 <+106>:   li      a1,16
       0x00000000002000c4 <+108>:   auipc   ra,0x0
       0x00000000002000c8 <+112>:   jalr    -120(ra) # 0x20004c <write_buf>
   ~~~

   Here, the compiler has reserved only 48 bytes of stack space and has placed the
   `lower` buffer at the lowest bytes of this reservation. Thus, to pass a
   pointer to the `lower` buffer to `write_buf`, the program simply copies the
   stack pointer register (an *integer* register, holding an *address*) to the
   argument register `a0`. The subsequent address arithmetic derives an address
   out of bounds, clobbering a byte of the `upper` register.



# [Exercise an inter-global-object buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#exercise-an-inter-global-object-buffer-overflow)
{: id="exercise-an-inter-global-object-buffer-overflow" }

This exercise demonstrates an inter-object buffer overflow on baseline and
CHERI-enabled architectures, and asks you to characterize and fix the bug
detected by CHERI bounds enforcement. It also asks you to use GDB for
debugging purposes.

This example uses two *global* objects (in `.data`) to demonstrate an overflow.
It is worth pondering how the bounds for pointers to globals come to be set!

1. Compile `buffer-overflow-global.c` for the baseline architecture to
   the binary `buffer-overflow-global-baseline` and for the CHERI-aware
   architecture to `buffer-overflow-global-cheri`.

   **For this exercise, add `-G0` to your
   compiler flags** (this ensures `c` is not placed in the small data section
   away from `buffer`).
2. Run both programs and observe the output.
3. Using GDB on the core dump (or run the CHERI program under `gdb`):
   Why has the CHERI program failed?
4. Modify `buffer-overflow-global.c` to increase the buffer size from 128 bytes
   to 1Mbyte + 1 byte.
5. Recompile and re-run `buffer-overflow-global-cheri`. Why does it no longer
   crash, even though the buffer overflow exists in the source code? Is
   the adjacent field still corrupted (i.e., has spatial safety been
   violated between allocations)?
6. Modify `buffer-overflow-global.c` to restore the original buffer size of 128
   bytes, and fix the bug by correcting accesses to the allocated array.
7. Recompile and run `buffer-overflow-global-cheri` to demonstrate that the
   program is now able to continue.

## [Source Files](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#source-files)
{: id="source-files" }

**buffer-overflow-global.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <stdint.h>
#include <printf.h>

struct globals {
    char buffer[128];
    char c;
};

struct globals globals;

#define buffer globals.buffer
#define c      globals.c

#pragma weak fill_buf
void
fill_buf(char *buf, size_t len)
{
	for (size_t i = 0; i <= len; i++)
		buf[i] = 'b';
}

#include "main-asserts.inc"

void
init(void)
{
	(void)buffer;
	main_asserts();

	c = 'c';
	printf("c = %c\n", c);

	fill_buf(buffer, sizeof(buffer));

	printf("c = %c\n", c);
}

void notified(){}
~~~

### [Support code](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#support-code)
{: id="support-code" }

**main-asserts.inc**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <sel4/assert.h>
#include <stddef.h>
#ifdef __CHERI_PURE_CAPABILITY__
#include <cheriintrin.h>
#endif

#ifndef nitems
#define	nitems(x)	(sizeof((x)) / sizeof((x)[0]))
#endif

static void
main_asserts(void)
{
	/*
	 * Ensure that overflowing `buffer` by 1 will hit `c`.
	 * In the pure-capabilty case, don't assert if the size of
	 * `buffer` requires padding.
	 */
	seL4_Assert((ptraddr_t)&buffer[nitems(buffer)] == (ptraddr_t)&c
#ifdef __CHERI_PURE_CAPABILITY__
	    || sizeof(buffer) < cheri_representable_length(sizeof(buffer))
#endif
	    );
}
~~~



# [Answers - Exercise an inter-global-object buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers---exercise-an-inter-global-object-buffer-overflow)
{: id="answers---exercise-an-inter-global-object-buffer-overflow" }

2. Expected output:

   ~~~
   # run_qemu ./buffer-overflow-global-baseline
   c = c
   c = b
   # ./buffer-overflow-global-cheri
   c = c
   MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
   MON|ERROR: faulting PD: buffer-overflow-global-cheri
   ...
   MON|ERROR: CHERI Security Violation: ip=0x0000000000200064  fault_addr=0x0000000000203380  fsr=0x0000000000000814  (data fault)
   MON|ERROR: description of fault: Bounds violation
   MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO
   ~~~
3. Example session:

   ~~~
    ...
    (gdb) break *0x0000000000200064 if $a0 == 0x203380
    Breakpoint 3 at 0x200064: file buffer-overflow-global.c, line 16.
    (gdb) c
    Continuing.

    Breakpoint 3, fill_buf (buf=<optimized out>, len=<optimized out>) at buffer-overflow-global.c:16
    16                      buf[i] = 'b';
    (gdb) disassemble
    Dump of assembler code for function fill_buf:
       0x0000000000200058 <+0>:     addi    a1,a1,1
       0x000000000020005a <+2>:     seqz    a2,a1
       0x000000000020005e <+6>:     add     a1,a1,a2
       0x0000000000200060 <+8>:     li      a2,98
    => 0x0000000000200064 <+12>:    sb      a2,0(ca0)
       0x0000000000200068 <+16>:    addi    a1,a1,-1
       0x000000000020006a <+18>:    add     ca0,ca0,1
       0x000000000020006e <+22>:    bnez    a1,0x200064 <fill_buf+12>
       0x0000000000200070 <+24>:    ret
    End of assembler dump.
    (gdb) p $ca0
    $5 = () 0x203380 <c> [V:1111:C:rw.C.l..:1:.:0x203300-0x203380]
    (gdb) si
    MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
    MON|ERROR: faulting PD: buffer-overflow-global-cheri
    Registers:
    ddc : 0x0
    pcc : 0x200064 [rxCM1111,0x200000-0x204000] (capmode)
    cra : 0x2000ea [rxCM1111,0x200000-0x204000] (capmode) (sentry)
    csp : 0x3fffffef30 [rwCM1111,0x3fffffe000-0x3ffffff000]
    cgp : 0x0
    cs0 : 0x2026f7 [rCM1111,0x2026f7-0x2026ff]
    cs1 : 0x203380 [rwCM1111,0x203380-0x203381]
    cs2 : 0x0
    cs3 : 0x203000 [rwCM1111,0x203000-0x203010]
    cs4 : 0x0
    cs5 : 0x0
    cs6 : 0x0
    cs7 : 0x0
    cs8 : 0x0
    cs9 : 0x0
    cs10 : 0x0
    cs11 : 0x0
    ca0 : 0x203380 [rwCM1111,0x203300-0x203380]
    ca1 : 0x1
    ca2 : 0x62
    ca3 : 0xffffffffffffffff
    ca4 : 0x0
    ca5 : 0x0
    ca6 : 0x0
    ca7 : 0xfffffffffffffff4
    ct0 : 0x0
    ct1 : 0x200084 [rxCM1111,0x200000-0x202dc0] (capmode)
    ct2 : 0x0
    ct3 : 0x0
    ct4 : 0x0
    ct5 : 0x0
    ct6 : 0x0
    ctp : 0x0
    MON|ERROR: CHERI Security Violation: ip=0x0000000000200064  fault_addr=0x0000000000203380  fsr=0x0000000000000814  (data fault)
    MON|ERROR: description of fault: Bounds violation
    MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO
    <<seL4(CPU 0) [receiveIPC/142 T0xffffffc0fffe6400 "rootserver" @8a000460]: Reply object already has unexecuted reply!>>
   ~~~

   The array has been incremented beyond the end of the allocation as out
   of bounds store has been attempted (`Bounds violation`).
4. Expected output:

   ~~~
   # run_qemu ./buffer-overflow-global-cheri
   c = c
   c = c
   ~~~

   To see why this occurs, examine the bounds of the buffer in `fill_buf`.

   ~~~
   gdb ./buffer-overflow-global-cheri
   ...
   Reading symbols from ./buffer-overflow-global-cheri...
   (gdb) target remote :1234
   Remote debugging using :1234
   0x0000000000001000 in ?? ()
   (gdb) break fill_buf
   Breakpoint 1 at 0x200058: file buffer-overflow-global.c, line 15.
   (gdb) c
   ...
   c = c

   Breakpoint 1, fill_buf (buf=0x204000 <buffer> [V:1111:C:rw.C.l..:1:.:0x204000-0x304800] "", len=1048577) at buffer-overflow-global.c:15
   15              for (size_t i = 0; i <= len; i++)
   (gdb)
   ~~~

   This indicates that buffer has been allocated (1024 \* 1026) bytes. This
   is due to the padding required to ensure that the bounds of `buffer`
   don't overlap with other allocations. As a result, there as an area beyond
   the end of the C-language object that is nonetheless in bounds.
5. Solution:

   ~~~diff
   --- buffer-overflow-global.c
   +++ buffer-overflow-global.c
   @@ -6,7 +6,7 @@ char c;
    void
    fill_buf(char *buf, size_t len)
    {
   -       for (size_t i = 0; i <= len; i++)
   +       for (size_t i = 0; i < len; i++)
                   buf[i] = 'b';
    }
   ~~~
6. Expected output:

   ~~~
   # run_qemu ./buffer-overflow-global-cheri
   c = c
   c = c
   ~~~



# [Explore Subobject Bounds](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#explore-subobject-bounds)
{: id="explore-subobject-bounds" }

In the CHERI-Microkit run-time environment, bounds are typically associated with
memory region and mapped `setvar_vaddr` allocations rather than C types.
For example, if a memory region allocation is made for 1024 bytes, and the
structure within it is 768 bytes, then the bounds associated with a pointer
will be for the allocation size rather than the structure size.

## [Subobject Overflows](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#subobject-overflows)
{: id="subobject-overflows" }

With subobject bounds, enforcement occurs on C-language objects within
allocations.
This exercise is similar to earlier buffer-overflow exercises, but is for such
an intra-object overflow. In our example, we consider an array within
another structure, overflowing onto an integer in the same allocation.

1. Compile `subobject-bounds.c` with a baseline target and binary
   name of `subobject-bounds-baseline`, and with a CHERI-enabled
   target and binary name of `subobject-bounds-cheri`.
2. As in the prior exercises, run the binaries.
3. Explore why the CHERI binary didn't fail.
   Run `subobject-bounds-cheri` under `gdb` and examine the bounds
   of the `buffer` argument to `fill_buf()`.
   To what do they correspond?
4. Recompile the `subobject-bounds-cheri` binary with the compiler
   flags `-Xclang -cheri-bounds=subobject-safe`.
5. Run the program to demonstrate that the buffer overflow is now caught.
6. Run the program under `gdb` and examine the bounds again. What has changed?

## [Source Files](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#source-files-1)
{: id="source-files-1" }

### [Subobject Overflows](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#subobject-overflows-1)
{: id="subobject-overflows-1" }

**subobject-bounds.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

struct buf {
	char buffer[128];
	int i;
} b;

#pragma weak fill_buf
void
fill_buf(char *buf, size_t len)
{
	for (size_t i = 0; i <= len; i++)
		buf[i] = 'b';
}

void
init(void)
{
	b.i = 'c';
	printf("b.i = %c\n", b.i);

	fill_buf(b.buffer, sizeof(b.buffer));

	printf("b.i = %c\n", b.i);
}

void notified(void){}

#include "asserts.inc"
~~~

**asserts.inc**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <stddef.h>

_Static_assert(sizeof(b.buffer) == offsetof(struct buf, i),
    "There must be no padding in struct buf between buffer and i members");
~~~



# [Answers - Explore Subobject Bounds](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers---explore-subobject-bounds)
{: id="answers---explore-subobject-bounds" }

## [Exercise a subobject buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#exercise-a-subobject-buffer-overflow)
{: id="exercise-a-subobject-buffer-overflow" }

This exercise demonstrates how subobject bounds can correct and array in a
structure.

2. Expected output:

   ~~~
   # run_qemu ./subobject-bounds-riscv
   b.i = c
   b.i = b
   # run_qemu ./subobject-bounds-cheri
   b.i = c
   b.i = b
   ~~~
3. Example session:

   ~~~
   (gdb) target remote :1234
   (gdb) b fill_buf
   Breakpoint 1 at 0x200058: file subobject-bounds.c, line 16.
   (gdb) c

   b.i = c

   Breakpoint 1, fill_buf (buf=0x2032c0 <b> [V:1111:C:rw.C.l..:1:.:0x2032c0-0x203344] "", len=128) at subobject-bounds.c:16
   16              for (size_t i = 0; i <= len; i++)
   ~~~

   The bounds are `132` bytes corresponding to the size of the underlying object.
4. Expected output:

   ~~~
   # run_qemu ./subobject-bounds-cheri
   b.i = c
   MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
   MON|ERROR: faulting PD: subobject-bounds-cheri
   MON|ERROR: CHERI Security Violation: ip=0x0000000000200064  fault_addr=0x0000000000203340  fsr=0x0000000000000814  (data fault)
   MON|ERROR: description of fault: Bounds violation
   MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO
   ~~~
5. Example session:

   ~~~
   Breakpoint 1, fill_buf (buf=0x2032c0 <b> [V:1111:C:rw.C.l..:1:.:0x2032c0-0x203340] "", len=128) at subobject-bounds.c:16
   16              for (size_t i = 0; i <= len; i++)
   ~~~

   The pointer to the buffer is now bounded to the array rather than the object.

   Investigating further will reveal that the compiler has inserted a
   bounds-setting instruction prior to the call to `fill_buf` in `init`, that
   is, when the pointer to `b.buffer` is materialized.

   ~~~
    (gdb) up
    #1  0x00000000002000ba in init () at subobject-bounds.c:26
    26              fill_buf(b.buffer, sizeof(b.buffer));
    (gdb) disassemble
    Dump of assembler code for function init:
       0x0000000000200072 <+0>:     addi    sp,sp,-64
       ...
       0x00000000002000a6 <+52>:    li      a0,128
       0x00000000002000aa <+56>:    scbndsr ca0,cs1,a0
       0x00000000002000ae <+60>:    li      a1,128
       0x00000000002000b2 <+64>:    auipcc  cra,0x0
       0x00000000002000b6 <+68>:    jalr    -90(cra)
    => 0x00000000002000ba <+72>:    lw      a0,128(cs1)
   ~~~



# [Corrupt a control-flow pointer using a subobject buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#corrupt-a-control-flow-pointer-using-a-subobject-buffer-overflow)
{: id="corrupt-a-control-flow-pointer-using-a-subobject-buffer-overflow" }

This exercise demonstrates how CHERI pointer integrity protection prevents
a function pointer overwritten with data due to a buffer overflow from being
used for further memory access.

1. Compile `control-flow-pointer.c` with a RISC-V target and binary name
   of `control-flow-pointer-riscv`, and a CHERI-RISC-V target and binary
   name of `control-flow-pointer-cheri`. Do not enable compilation with
   subobject bounds protection when compiling with the CHERI-RISC-V target.

**control-flow-pointer.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

struct buf {
	size_t length;
	int buffer[30];
	size_t (*callback)(struct buf *);
};

void
fill_buf(struct buf *bp)
{
	bp->length = sizeof(bp->buffer)/sizeof(*bp->buffer);
	for (size_t i = 0; i <= bp->length; i++)
		bp->buffer[i] = 0xAAAAAAAA;
}

size_t
count_screams(struct buf *bp)
{
	int screams = 0;

	for (size_t i = 0; i < bp->length; i++)
		screams += bp->buffer[i] == 0xAAAAAAAA ? 1 : 0;
	return screams;
}

struct buf b = {.callback = count_screams};

void
init(void)
{
	fill_buf(&b);

	printf("Words of screaming in b.buffer %zu\n", b.callback(&b));
}

void notified(void) {}

#include "asserts.inc"
~~~

2. Run the RISC-V program under QEMU; why does it crash?
3. Run the CHERI-RISC-V program under QEMU; why does it crash?

## [Support code](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#support-code-1)
{: id="support-code-1" }

**asserts.inc**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <stddef.h>

_Static_assert(offsetof(struct buf, buffer) + sizeof(b.buffer) ==
    offsetof(struct buf, callback),
    "There must be no padding between buffer and callback members");
~~~



# [Answers - Corrupt a control-flow pointer using a subobject buffer overflow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers---corrupt-a-control-flow-pointer-using-a-subobject-buffer-overflow)
{: id="answers---corrupt-a-control-flow-pointer-using-a-subobject-buffer-overflow" }

2. Example session:

~~~
   # run_qemu ./control-flow-pointer-riscv
   ...
   MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
   MON|ERROR: faulting PD: control-flow-pointer-riscv
   Registers:
   ddc : 0x0 [rwxCM1111,0x0-0xffffffffffffffff]
   pcc : 0xaaaaaaaa [rwxCM1111,0x0-0xffffffffffffffff]
   cra : 0x20010e
   csp : 0x3fffffefb0
   cgp : 0x203888
   cs0 : 0x203000
   cs1 : 0x0
   cs2 : 0x0
   cs3 : 0x0
   cs4 : 0x0
   cs5 : 0x0
   cs6 : 0x0
   cs7 : 0x0
   cs8 : 0x0
   cs9 : 0x0
   cs10 : 0x0
   cs11 : 0x0
   ca0 : 0x203000
   ca1 : 0xaaaaaaaaaaaaaaaa
   ca2 : 0xaaaaaaaa
   ca3 : 0x0
   ca4 : 0x0
   ca5 : 0x0
   ca6 : 0x0
   ca7 : 0x0
   ct0 : 0x0
   ct1 : 0x0
   ct2 : 0x0
   ct3 : 0x0
   ct4 : 0x0
   ct5 : 0x0
   ct6 : 0x0
   ctp : 0x0
   MON|ERROR: VMFault: ip=0x00000000aaaaaaaa  fault_addr=0x00000000aaaaaaaa  fsr=0x0000000000000001  (instruction fault)
   MON|ERROR: description of fault: Instruction access fault
~~~

The program attempted an instruction fetch from a nonsensical address
`0xaaaaaaaa`.

3. Example session:

~~~
   # run_qemu ./control-flow-pointer-cheri
   ...
   MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
   MON|ERROR: faulting PD: control-flow-pointer-cheri
   Registers:
   ddc : 0x0
   pcc : 0x200134 [rxCM1111,0x200000-0x204000] (capmode)
   cra : 0x202384 [rxCM1111,0x200000-0x204000] (capmode) (sentry)
   csp : 0x3fffffef50 [rwCM1111,0x3fffffe000-0x3ffffff000]
   cgp : 0x0
   cs0 : 0x203000
   cs1 : 0x0
   cs2 : 0x0
   cs3 : 0x203090 [rwCM1111,0x203090-0x2030a0]
   cs4 : 0x0
   cs5 : 0x0
   cs6 : 0x0
   cs7 : 0x0
   cs8 : 0x0
   cs9 : 0x0
   cs10 : 0x0
   cs11 : 0x0
   ca0 : 0x203000 [rwCM1111,0x203000-0x203090]
   ca1 : 0xaaaaaaaa
   ca2 : 0xaaaaaaaa
   ca3 : 0x0
   ca4 : 0x0
   ca5 : 0x0
   ca6 : 0x0
   ca7 : 0x0
   ct0 : 0x0
   ct1 : 0x0
   ct2 : 0x0
   ct3 : 0x0
   ct4 : 0x0
   ct5 : 0x0
   ct6 : 0x0
   ctp : 0x0
   MON|ERROR: CHERI Security Violation: ip=0x0000000000200134  fault_addr=0x0000000000000000  fsr=0x0000000000000820  (data fault)
   MON|ERROR: description of fault: Tag violation
   MON|ERROR: CHERI fault type: CHERI jump or branch fault
~~~

If you examine further using GDB by setting a breakpoint on the faulting address, you can see the content of the faulting `ca2`
that the program tries to jump to:

~~~
(gdb) break *0x200134
Breakpoint 1 at 0x200134: file ./control-flow-pointer.c, line 38.
(gdb) c
Continuing.
...
Breakpoint 1, init () at ./control-flow-pointer.c:38
38              printf("Words of screaming in b.buffer %zu\n", b.callback(&b));
(gdb) disassemble
   0x0000000000200132 <+90>:    sw      a1,124(ca0)
=> 0x0000000000200134 <+92>:    jalr    ca2
(gdb) info reg $ca2
ca2            0x1eed8000993800300000000aaaaaaaa        0xaaaaaaaa [I:1111:C:r.xC.l..:1:S:0xaaaa8000-0xaaaaac90]
~~~

The program attempted to load an instruction via an untagged capability `ca2`.



# [Exercise integer-pointer type confusion bug](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#exercise-integer-pointer-type-confusion-bug)
{: id="exercise-integer-pointer-type-confusion-bug" }

This exercise demonstrates how CHERI distinguishes between integer and pointer
types, preventing certain types of type confusion.
In this example, a union allows an integer value to be used as a pointer,
which cannot then be dereferenced.

1. Compile `type-confusion.c` with a RISC-V target and binary name of
   `type-confusion-riscv`, and with a CHERI-RISC-V target and binary name
   `type-confusion-cheri`.

**type-confusion.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */
#include <printf.h>

const char hello[] = "Hello World!";

union long_ptr {
	long l;
	const char *ptr;
} lp = { .ptr = hello };

void
inc_long_ptr(union long_ptr *lpp)
{
	lpp->l++;
}

void
init(void)
{
	printf("lp.ptr %s\n", lp.ptr);
	inc_long_ptr(&lp);
	printf("lp.ptr %s\n", lp.ptr);
}

void notified(void){}
~~~

2. Run the RISC-V program. What is the result?
3. Run the CHERI-RISC-V program. What is the result?
   Run under QEMU and `gdb` and explain why the program crashes in the second `printf`.



# [Answers: Exercise integer-pointer type confusion bug](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers-exercise-integer-pointer-type-confusion-bug)
{: id="answers-exercise-integer-pointer-type-confusion-bug" }

When the integer value is updated, with CHERI-RISC-V compilation the
pointer side will no longer be dereferenceable, as the tag has been cleared.

2. Expected output:

~~~
# run_qemu ./type-confusion-riscv
lp.ptr Hello World!
lp.ptr ello World!
~~~

The `long` member was loaded and stored as an integer (this is identical
to the way it would have been handled if the pointer member were
incremented instead).

3. Expected output:

~~~
# run_qemu ./type-confusion-cheri
lp.ptr Hello World!
...
MON|ERROR: CHERI Security Violation: ip=0x0000000000200750  fault_addr=0x00000000002023f1  fsr=0x0000000000000810  (data fault)
MON|ERROR: description of fault: Tag violation
MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO
~~~

When the `long` member was loaded and stored, it caused the tag to be
cleared on the pointer.



# [Extending heap allocators for CHERI](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#extending-heap-allocators-for-cheri)
{: id="extending-heap-allocators-for-cheri" }

CHERI's architectural protection is driven by software -- the compiler,
linker, OS kernel, run-time linker, run-time libraries, and so on all manage
capabilities as part of their program execution. Heap allocators, which are
integrally tied into our notions of spatial and temporal safety, are typically
extended to use CHERI in five ways:

1. To implement spatial safety, bounds and permissions are set on returned
   pointers.
   *(In this exercise.)*
2. To prevent bounds overlap on larger allocations from arising due to
   imprecise bounds caused by capability compression, large allocations are
   aligned and padded more strongly.
   *(Not in this exercise.)*
3. If the allocator's `free()` implementation relies on reaching allocator
   metadata via its pointer argument (e.g., by looking immediately before or
   after to reach free-list pointers), then the implementation must be
   changed as access will otherwise be prevented by CHERI bounds and
   monotonicity.
   *(In this exercise.)*
4. To implement temporal safety, allocated memory is registered with a
   temporal-safety run-time library when allocated, to implement
   kernel-assisted revocation.
   On free, the memory is is held in quarantine until revocation has been
   performed.
   *(Not in this exercise.)*
5. To handle a further set of classes of misuse and pointer corruption, it is
   also important to perform validation of arguments to `free()`, such as by
   checking that the pointer is to the first byte of a valid allocation.
   *(Not in this exercise.)*

This exercise asks you to extend a simplified memory allocator with CHERI
focusing only on (1) and (3) above.
It supports only small fixed-size allocations that will not require further
alignment or padding, and we will not consider temporal safety in this
exercise.

The complete exercise is embodied in `cheri-allocator.c`, including the
simplified allocator and also a `main()` routine that initializes and uses the
allocator.
`main()` allocates memory, and then overflows the allocation to corrupt
internal allocator metadata, leading to a crash.
Heap metadata corruption is a powerful exploitation tool; CHERI assists with
mitigating it through pointer integrity features, but it is preferable to
deterministically close vulnerabilities (e.g., via spatial safety).

1. Compile `cheri-allocator.c` with a CHERI-enabled target.
   Run the binary, which will crash.
2. Use GDB to demonstrate to yourself that the overflow has corrupted
   allocator metadata, leading to an eventual crash during a later call to
   `alloc_allocate()`.
3. Modify the allocator to use the `cheri_bounds_set()` API to set suitable
   bounds on the pointer returned by `alloc_allocate()`.
   Recompile `cheri-allocator.c` with a CHERI-enabled target.
4. Use GDB to demonstrate to yourself that the overflow operation now causes
   an immediate crash as a result of attempting to store out of bounds, rather
   than triggering a later crash due to heap metadata corruption.
5. Remove the overflow (performed with `memset()`) from the program.
   Recompile `cheri-allocator.c` with a CHERI-enabled target.
6. Use GDB to explore why the program now crashes in `alloc_free()`: How did
   adding bounds during allocation break later freeing of that memory?
7. Correct the bug through the use of the `cheri_address_get()` and
   `cheri_address_set()` APIs, which allow transferring an address from one
   capability (with one set of bounds) to another (with a different set of
   bounds).
   What capability should we be using to provide the new bounds?
   Recompile `cheri-allocator.c` with a CHERI-enabled target.
8. Demonstrate that the program now runs successfully to completion.

The resulting allocator is now substantially safer with respect to spatial
safety, preventing underflows and overflows from corrupting allocator metadata
or the contents of other allocations.
However, to continue hardening the allocator against various attacks, further
work would be required, including better validating the argument of the
`free()` function.
This would ideally test that the pointer being freed points to memory managed
by the allocator, that the pointer is in bounds, and that it points to the
start of a current allocation.
Further temporal safety also requires quarantining freed memory until all
pointers to it have been revoked.

## [Source Files](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#source-files-2)
{: id="source-files-2" }

**cheri-allocator.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2022 Robert N. M. Watson
 */

#include <stdint.h>
#include <stddef.h>
#include <printf.h>
#include <sel4/assert.h>

#ifdef __CHERI_PURE_CAPABILITY__
#include <cheriintrin.h>
#endif

#define __containerof(ptr, type, member) \
    ((type *)((uintptr_t)(ptr) - offsetof(type, member)))

/*
 * Implement a very simple allocator for a fixed-size data type, with inline
 * metadata.  Calls to alloc_allocate() return a pointer to a fixed-size byte
 * array.  Calls to alloc_free() return it to the allocator for reuse.
 *
 * The implementation is simplistic, and is designed to support an exercise
 * relating to: (a) bounds setting; and (b) monotonicty and rederivation.
 * Each allocation is described by 'struct allocation', which consists of
 * free-list pointers and an array of bytes that make up the allocation
 * itself.  Those allocations are stored as a sequential array in a global
 * variable initialised by BSS:
 *
 *  /--------- index 0 ----------\ /--------- index 1 ----------\ /--...
 *
 * +--------+-----------------...-+--------+-----------------...-+---...
 * | a_next | a_bytes[ALLOC_SIZE] | a_next | a_bytes[ALLOC_SIZE] |
 * +--------+-----------------...-+--------+-----------------...-+---...
 *
 *                                ^                              ^
 *      \_________________________/    \_________________________/
 *        If unallocated, pointer        If unallocated, pointer
 *        to next free allocation.       to next free allocation.
 *
 * Allocation storage is sized below the threshold requiring extra alignment
 * or padding to account for capability bounds compression.
 */
#define	ALLOC_SIZE		128		/* Allocation data size. */
struct alloc_storage {
	struct alloc_storage	*a_next;		/* Free list. */
	uint8_t			 a_bytes[ALLOC_SIZE];	/* Allocated memory. */
};

#define	ALLOC_MAX	16			/* Availaable allocations. */
struct alloc_storage alloc_array[ALLOC_MAX];	/* Underlying storage. */
struct alloc_storage *alloc_nextfree;		/* Next available memory. */

/*
 * Initialise the free list, pointing alloc_nextfree at the array, and then
 * chaining array entries into the list.
 */
static void
alloc_init(void)
{
	int i;

	alloc_nextfree = &alloc_array[0];
	for (i = 0; i < ALLOC_MAX - 1; i++)
		alloc_array[i].a_next = &alloc_array[i + 1];
	alloc_array[ALLOC_MAX - 1].a_next = NULL;
	seL4_Assert(alloc_array[ALLOC_MAX - 1].a_next == NULL);
}

/*
 * Allocate memory, pulling it off the free list and updating pointers as
 * needed.
 */
static void *
alloc_allocate(void)
{
	struct alloc_storage *alloc;

	if (alloc_nextfree == NULL)
		return (NULL);
	alloc = alloc_nextfree;
	alloc_nextfree = alloc->a_next;
	alloc->a_next = NULL;

	/* Return pointer to allocated memory. */
	return (alloc->a_bytes);
};

/*
 * Free memory, inserting it back into the free list.  Note use of
 * __containerof() to convert pointer to a_bytes back into the container
 * struct pointer.
 */
static void
alloc_free(void *ptr)
{
	struct alloc_storage *alloc;

	/* Convert pointer to allocated memory into pointer to metadata. */
	alloc = __containerof(ptr, struct alloc_storage, a_bytes);
	alloc->a_next = alloc_nextfree;
	alloc_nextfree = alloc;
}

void
init(void)
{
	void *ptr1, *ptr2, *ptr3;

	/* Initialise allocator. */
	alloc_init();
	printf("Allocator initialised\n");

	/*
	 * Allocate some memory.
	 */
	printf("Allocating memory\n");
	ptr1 = alloc_allocate();
	printf("Allocation returned %p\n", ptr1);

	/*
	 * Run off the end of the memory allocation, corrupting the next
	 * allocation's metadata.  Free when done.
	 */
	printf("Preparing to overflow %p\n", ptr1);
	memset(ptr1 + ALLOC_SIZE, 'A', sizeof(void *));
	printf("Overflowed allocation %p\n", ptr1);

	printf("Freeing allocation %p\n", ptr1);
	alloc_free(ptr1);
	printf("Allocation %p freed\n", ptr1);

	/*
	 * Perform three sequential allocations to cause the allocator to
	 * dereference the corrupted pointer, performing a store.
	 */
	printf("Allocating memory\n");
	ptr1 = alloc_allocate();
	printf("Allocation returned %p\n", ptr1);

	printf("Allocating memory\n");
	ptr2 = alloc_allocate();
	printf("Allocation returned %p\n", ptr2);

	printf("Allocating memory\n");
	ptr3 = alloc_allocate();
	printf("Allocation returned %p\n", ptr3);

	/*
	 * Clear up the mess.
	 */
	printf("Freeing allocation %p\n", ptr3);
	alloc_free(ptr3);
	printf("Allocation %p freed\n", ptr3);

	printf("Freeing allocation %p\n", ptr2);
	alloc_free(ptr2);
	printf("Allocation %p freed\n", ptr2);

	printf("Freeing allocation %p\n", ptr1);
	alloc_free(ptr1);
	printf("Allocation %p freed\n", ptr1);
}

void notified(){}
~~~



# [Answers](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#answers-1)
{: id="answers-1" }

## [Introducing heap-allocator bounds](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#introducing-heap-allocator-bounds)
{: id="introducing-heap-allocator-bounds" }

2. QEMU and GDB will show a CHERI tag violation resulting from `memset()` overwriting
   the `a_next` field in the second allocation entry, which is tripped over by
   a later call to `alloc_allocate()`:

~~~
Allocator initialised
Allocating memory
Allocation returned 00000000000000000000000000203340
Preparing to overflow 00000000000000000000000000203340
Overflowed allocation 00000000000000000000000000203340
Freeing allocation 00000000000000000000000000203340
Allocation 00000000000000000000000000203340 freed
Allocating memory
Allocation returned 00000000000000000000000000203340
Allocating memory
Allocation returned 000000000000000000000000002033D0
Allocating memory
MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
MON|ERROR: faulting PD: cheri-allocator
Registers:
ddc : 0x0
pcc : 0x20023e [rxCM1111,0x200000-0x204000] (capmode)
cra : 0x200238 [rxCM1111,0x200000-0x204000] (capmode) (sentry)
csp : 0x3fffffeef0 [rwCM1111,0x3fffffe000-0x3ffffff000]
cgp : 0x0
cs0 : 0x203340 [rwCM1111,0x203330-0x203c30]
cs1 : 0x0
cs2 : 0x203c30 [rwCM1111,0x203c30-0x203c40]
cs3 : 0x203340 [rwCM1111,0x203330-0x203c30]
cs4 : 0x2033d0 [rwCM1111,0x203330-0x203c30]
cs5 : 0x0
cs6 : 0x0
cs7 : 0x0
cs8 : 0x0
cs9 : 0x0
cs10 : 0x0
cs11 : 0x0
ca0 : 0x4141414141414141
ca1 : 0x3fffffeecf [rwCM1111,0x3fffffeecf-0x3fffffeed0]
ca2 : 0x12
ca3 : 0xffffffffffffffff
ca4 : 0x0
ca5 : 0x0
ca6 : 0x0
ca7 : 0xfffffffffffffff4
ct0 : 0x0
ct1 : 0x201f4a [rxCM1111,0x200000-0x202fc0] (capmode)
ct2 : 0x0
ct3 : 0x20
ct4 : 0x21
ct5 : 0x0
ct6 : 0x0
ctp : 0x0
MON|ERROR: CHERI Security Violation: ip=0x000000000020023e  fault_addr=0x4141414141414141  fsr=0x0000000000000810  (data fault)
MON|ERROR: description of fault: Tag violation
MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO

(gdb) target remote :1234
Remote debugging using :1234
0x0000000000001000 in ?? ()
(gdb) break *0x20023e
Breakpoint 1 at 0x20023e: file cheri-allocator.c, line 82.
(gdb) c
Continuing.
Breakpoint 1, alloc_allocate () at cheri-allocator.c:82
82              alloc_nextfree = alloc->a_next;
(gdb) disassemble
Dump of assembler code for function init:
   0x0000000000200238 <+480>:   lc      ca0,0(cs2)
   0x000000000020023c <+484>:   beqz    a0,0x20024e <init+502>
=> 0x000000000020023e <+486>:   c.lc    ca1,0(ca0)

(gdb) p alloc
$1 = (struct alloc_storage *) 0x4141414141414141 [I:0101:C:r...a...:0:.:0x41414141400a0000-0x4141414140a80000]
(gdb) info reg $ca0
ca0            0x41414141414141414141414141414141       0x4141414141414141 [I:0101:C:r...a...:0:.:0x41414141400a0000-0x4141414140a80000]
~~~

3. When compiling for CHERI C, use `cheri_bounds_set()` to set bounds on the
   returned pointer:

~~~
        /* Return pointer to allocated memory. */
#ifdef __CHERI_PURE_CAPABILITY__
        return (cheri_bounds_set(alloc->a_bytes, ALLOC_SIZE));
#else
        return (alloc->a_bytes);
#endif
~~~

4. With this change, the `memset()` call in `init()` triggers a bounds
   violation exception on overflow:

~~~
# run_qemu ./cheri-allocator
...
Allocator initialised
Allocating memory
Allocation returned 00000000000000000000000000203340
Preparing to overflow 00000000000000000000000000203340
MON|ERROR: received message 0x00000006  badge: 0x0000000000000001  tcb cap: 0x8000000000000008
MON|ERROR: faulting PD: cheri-allocator
Registers:
ddc : 0x0
pcc : 0x202018 [rxCM1111,0x200000-0x204000] (capmode)
cra : 0x200172 [rxCM1111,0x200000-0x204000] (capmode) (sentry)
csp : 0x3fffffeef0 [rwCM1111,0x3fffffe000-0x3ffffff000]
cgp : 0x0
cs0 : 0x203340 [rwCM1111,0x203340-0x2033c0]
cs1 : 0x0
cs2 : 0x203c30 [rwCM1111,0x203c30-0x203c40]
cs3 : 0x203000 [rwCM1111,0x203000-0x203010]
cs4 : 0x0
cs5 : 0x0
cs6 : 0x0
cs7 : 0x0
cs8 : 0x0
cs9 : 0x0
cs10 : 0x0
cs11 : 0x0
ca0 : 0x2033c0 [rwCM1111,0x203340-0x2033c0]
ca1 : 0x41
ca2 : 0x10
ca3 : 0x2033c0 [rwCM1111,0x203340-0x2033c0]
ca4 : 0x0
ca5 : 0x0
ca6 : 0x0
ca7 : 0xfffffffffffffff4
ct0 : 0x0
ct1 : 0x201f6a [rxCM1111,0x200000-0x202fe0] (capmode)
ct2 : 0x0
ct3 : 0x20
ct4 : 0x21
ct5 : 0x0
ct6 : 0x0
ctp : 0x0
MON|ERROR: CHERI Security Violation: ip=0x0000000000202018  fault_addr=0x00000000002033c0  fsr=0x0000000000000814  (data fault)
MON|ERROR: description of fault: Bounds violation
MON|ERROR: CHERI fault type: CHERI data fault due to load, store or AMO
~~~

## [Reaching allocator metadata](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#reaching-allocator-metadata)
{: id="reaching-allocator-metadata" }

6. Following this change, `alloc_free()` crashes with a bounds violation,
   due to reaching outside the bounds of the passed memory allocation:

~~~
# gdb ./cheri-allocator
(gdb) break *0x000000000020018c # Faulting address (ip=...) extracted from a previous QEMU run
Breakpoint 1 at 0x20018c: file cheri-allocator.c, line 105.
(gdb) target remote :1234
Remote debugging using :1234
0x0000000000001000 in ?? ()
(gdb) c
Continuing.
...
Allocator initialised
Allocating memory
Allocation returned 00000000000000000000000000203340
Preparing to overflow 00000000000000000000000000203340
Overflowed allocation 00000000000000000000000000203340
Freeing allocation 00000000000000000000000000203340

Breakpoint 1, alloc_free (ptr=0x203340 <alloc_array+16> [V:1111:C:rw.C.l..:1:.:0x203340-0x2033c0]) at cheri-allocator.c:105
105             alloc->a_next = alloc_nextfree;
(gdb) p alloc
$1 = (struct alloc_storage *) 0x203330 <alloc_array> [V:1111:C:rw.C.l..:1:.:0x203340-0x2033c0]
~~~

7. We need to create a new capability, derived from `alloc_array` but with the
   address generated from pointer to the memory being freed.
   One way to do this is using the `cheri_address_get()` and
   `cheri_address_set()`, reading the address from one capability and setting
   it on the other:

~~~
#ifdef __CHERI_PURE_CAPABILITY__
        /*
         * Generate a new pointer to the allocation that is derived from the
         * one passed by the consumer.
         */
        ptr = cheri_address_set(alloc_array, cheri_address_get(ptr));
#endif
~~~

Note that this is not a complete solution to providing spatial safety here:
software could still accidentally pass an out-of-bounds pointer.



# [Focused Adversarial Missions](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#focused-adversarial-missions-1)
{: id="focused-adversarial-missions-1" }



# [Exploiting a buffer overflow to manipulate control flow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#exploiting-a-buffer-overflow-to-manipulate-control-flow)
{: id="exploiting-a-buffer-overflow-to-manipulate-control-flow" }

The objective of this mission is to demonstrate arbitrary code execution
through a control-flow attack, despite CHERI protections. You will attack three
different versions of the program:

1. A baseline RISC-V compilation, to establish that the vulnerability is
   exploitable without any CHERI protections.
2. A baseline CHERI-RISC-V compilation, offering strong spatial safety between
   heap allocations, including accounting for imprecision in the bounds of large
   capabilities.
3. A weakened CHERI-RISC-V compilation, reflecting what would occur if a memory
   allocator failed to pad allocations to account for capability bounds
   imprecision.

The success condition for an exploit, given attacker-provided input overflowing
a buffer, is to modify control flow in the program such that the `success`
function is executed.

1. Compile `buffer-overflow.c` and `btpalloc.c` together with a RISC-V target
   and exploit the binary to execute the `success` function. You also need
   to compile `serial_server.c` to an ELF and place it in a separate
   Microkit protection domain, with the highest priority, then generate an
   image using the Microkit tool.

**buffer-overflow.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include <stdint.h>
#include <printf.h>
#include <microkit.h>
#include <sel4/sel4.h>

#include "btpalloc.h"

#define SERIAL_CHANNEL 1

uintptr_t serial_to_client_vaddr;
uintptr_t client_to_serial_vaddr;

#define MOVE_CURSOR_UP "\033[5A"
#define CLEAR_TERMINAL_BELOW_CURSOR "\033[0J"
#define GREEN "\033[32;1;40m"
#define YELLOW "\033[39;103m"
#define DEFAULT_COLOUR "\033[0m"

void
success(void)
{
	printf("Exploit successful!");
}

void
failure(void)
{
	printf("Exploit unsuccessful!");
}

static uint16_t
ipv4_checksum(uint16_t *buf, size_t words)
{
	uint16_t *p;
	uint_fast32_t sum;

	sum = 0;
	for (p = buf; words > 0; --words, ++p) {
		sum += *p;
		if (sum > 0xffff)
			sum -= 0xffff;
	}

	return (~sum & 0xffff);
}

#include "main-asserts.inc"

static char getchar() {
    microkit_ppcall(SERIAL_CHANNEL, microkit_msginfo_new(1, 0));
    return ((char *)serial_to_client_vaddr)[0];
}

void
init(void)
{
	int ch;
	char *buf, *p;
	uint16_t sum;
	void (**fptr)(void);

	buf = btpmalloc(25000);
	fptr = btpmalloc(sizeof(*fptr));
	main_asserts(buf, fptr);

	*fptr = &failure;

	p = buf;
	while ((ch = getchar()) != -1) {
    if(ch == '\n' || ch == '\r')
        break;

		*p++ = (char)ch;
  }

	if ((uintptr_t)p & 1)
		*p++ = '\0';

	sum = ipv4_checksum((uint16_t *)buf, (p - buf) / 2);
	printf("Checksum: 0x%04x\n", sum);

	btpfree(buf);

	(**fptr)();

	btpfree(fptr);
}

void notified(microkit_channel channel) {
    switch (channel) {
        case SERIAL_CHANNEL: {
            char ch = ((char *)serial_to_client_vaddr)[0];
            microkit_dbg_putc(ch);
            break;
        }
    }
}
~~~

2. Recompile with a CHERI-RISC-V target, attempt to exploit the binary and, if
   it cannot be exploited, explain why.
3. Recompile with a CHERI-RISC-V target but this time adding
   `-DCHERI_NO_ALIGN_PAD`, attempt to exploit the binary and, if it cannot be
   exploited, explain why.

**btpalloc.c**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include "btpalloc.h"

#include <stddef.h>
#include <printf.h>
#include <sel4/assert.h>

#ifdef __CHERI_PURE_CAPABILITY__
#include <cheriintrin.h>
#endif

void *btpmem;
size_t btpmem_size;

void *
btpmalloc(size_t size)
{
	void *alloc;
	size_t allocsize;

	/* Microkit should have mapped and patched btpmem memory region during bootstrapping */
	seL4_Assert(btpmem != NULL);
	seL4_Assert(btpmem_size != 0);

	printf("btpmem = 0x%lx\n", (size_t) btpmem);
	printf("btpmemsize = 0x%lx\n", (size_t) btpmem_size);

	alloc = btpmem;
	/* RISC-V ABIs require 16-byte alignment */
	allocsize = __builtin_align_up(size, 16);

#if defined(__CHERI_PURE_CAPABILITY__) && !defined(CHERI_NO_ALIGN_PAD)
	allocsize = cheri_representable_length(allocsize);
	alloc = __builtin_align_up(alloc,
	    ~cheri_representable_alignment_mask(allocsize) + 1);
	allocsize += (char *)alloc - (char *)btpmem;
#endif

	if (allocsize > btpmem_size)
		return (NULL);

	btpmem = (char *)btpmem + allocsize;
	btpmem_size -= allocsize;
#ifdef __CHERI_PURE_CAPABILITY__
	alloc = cheri_bounds_set(alloc, size);
#endif
	printf("Returning alloc = 0x%lx\n", (size_t) alloc);
	return (alloc);
}

void
btpfree(void *ptr)
{
	(void)ptr;
}
~~~

## [Support code](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#support-code-2)
{: id="support-code-2" }

**btpalloc.h**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include <stddef.h>

void	*btpmalloc(size_t size);
void	 btpfree(void *ptr);
~~~

**serial\_server.c**

~~~C
#include <stdint.h>
#include <microkit.h>

#if defined(BOARD_qemu_virt_riscv64)
typedef uint8_t uart_reg_t;
#elif defined(BOARD_ariane)
typedef uint32_t uart_reg_t;
#else
#error "Unsupported board for the serial driver"
#endif
// This variable will have the address of the UART device
uintptr_t uart_base_vaddr;

/* QEMU RISC-V virt emulates a 16550 compatible UART. */
#define BIT(n) (1ul<<(n))

#define UART_IER_ERBFI   BIT(0)   /* Enable Received Data Available Interrupt */
#define UART_IER_ETBEI   BIT(1)   /* Enable Transmitter Holding Register Empty Interrupt */
#define UART_IER_ELSI    BIT(2)   /* Enable Receiver Line Status Interrupt */
#define UART_IER_EDSSI   BIT(3)   /* Enable MODEM Status Interrupt */

#define UART_FCR_ENABLE_FIFOS   BIT(0)
#define UART_FCR_RESET_RX_FIFO  BIT(1)
#define UART_FCR_RESET_TX_FIFO  BIT(2)
#define UART_FCR_TRIGGER_1      (0u << 6)
#define UART_FCR_TRIGGER_4      (1u << 6)
#define UART_FCR_TRIGGER_8      (2u << 6)
#define UART_FCR_TRIGGER_14     (3u << 6)

#define UART_LCR_DLAB    BIT(7)   /* Divisor Latch Access */

#define UART_LSR_DR      BIT(0)   /* Data Ready */
#define UART_LSR_THRE    BIT(5)   /* Transmitter Holding Register Empty */

typedef volatile struct {
    uart_reg_t rbr_dll_thr; /* 0x00 Receiver Buffer Register (Read Only)
                             *   Divisor Latch (LSB)
                             *   Transmitter Holding Register (Write Only)
                             */
    uart_reg_t dlm_ier;     /* 0x04 Divisor Latch (MSB)
                             *   Interrupt Enable Register
                             */
    uart_reg_t iir_fcr;     /* 0x08 Interrupt Identification Register (Read Only)
                             *   FIFO Control Register (Write Only)
                             */
    uart_reg_t lcr;         /* 0xC Line Control Register */
    uart_reg_t mcr;         /* 0x10 MODEM Control Register */
    uart_reg_t lsr;         /* 0x14 Line Status Register */
    uart_reg_t msr;         /* 0x18 MODEM Status Register */
} uart_regs_t;

#define REG_PTR(base, offset) ((volatile uint32_t *)((base) + (offset)))
/*
 *******************************************************************************
 * UART access primitives
 *******************************************************************************
 */

static int internal_uart_is_tx_empty(uart_regs_t *regs)
{
    /* The THRE bit is set when the FIFO is fully empty. On real hardware, there
     * seems no way to detect if the FIFO is partially empty only, so we can't
     * implement a "tx_ready" check. Since QEMU does not emulate a FIFO, this
     * does not really matter.
     */
    return (0 != (regs->lsr & UART_LSR_THRE));
}

static void internal_uart_tx_byte(uart_regs_t *regs, uint8_t byte)
{
    /* Caller has to ensure TX FIFO is ready */
    regs->rbr_dll_thr = byte;
}

static int internal_uart_is_rx_empty(uart_regs_t *regs)
{
    return (0 == (regs->lsr & UART_LSR_DR));
}


static int internal_uart_rx_byte(uart_regs_t *regs)
{
    /* Caller has to ensure RX FIFO has data */
    return regs->rbr_dll_thr;
}

void uart_init() {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;
    regs->dlm_ier = 0; // disable interrupts

    /* Baudrates and serial line parameters are not emulated by QEMU, so the
     * divisor is just a dummy.
     */
    uint16_t clk_divisor = 1; /* dummy, would be for 115200 baud */
    regs->lcr = UART_LCR_DLAB; /* baud rate divisor setup */
    regs->dlm_ier = (clk_divisor >> 8) & 0xFF;
    regs->rbr_dll_thr = clk_divisor & 0xFF;
    regs->lcr = 0x03; /* set 8N1, clear DLAB to end baud rate divisor setup */

    /* enable and reset FIFOs, interrupt for each byte */
    regs->iir_fcr = UART_FCR_ENABLE_FIFOS
                    | UART_FCR_RESET_RX_FIFO
                    | UART_FCR_RESET_TX_FIFO
                    | UART_FCR_TRIGGER_1;

    /* enable RX interrupts */
    regs->dlm_ier = UART_IER_ERBFI;
}

void uart_put_char(int c) {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;

    /* There is no way to check for "TX ready", the only thing we have is a
     * check for "TX FIFO empty". This is not optimal, as we might wait here
     * even if there is space in the FIFO. Seems the 16550 was built based on
     * the idea that software keeps track of the FIFO usage. A driver would
     * know how much space is left in the FIFO, so it can write new data
     * either immediately or buffer it. If the FIFO empty interrupt arrives,
     * data can be written from the buffer to fill the FIFO.
     * However, since QEMU does not emulate a FIFO, we can just implement a
     * simple model here and block - expecting to never block practically.
     */
    while (!internal_uart_is_tx_empty(regs)) {
        /* busy waiting loop */
    }

    /* Extract the byte to send, drop any flags. */
    uint8_t byte = (uint8_t)c;

    internal_uart_tx_byte(regs, byte);
}

void uart_handle_irq() {
}

void uart_put_str(char *str) {
    while (*str) {
        uart_put_char(*str);
        str++;
    }
}

int uart_get_char() {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;

    /* if UART is empty return an error */
    while(internal_uart_is_rx_empty(regs));

    return internal_uart_rx_byte(regs) & 0xFF;
}

void init(void) {
    // First we initialise the UART device, which will write to the
    // device's hardware registers. Which means we need access to
    // the UART device.
    uart_init();
    // After initialising the UART, print a message to the terminal
    // saying that the serial server has started.
    uart_put_str("SERIAL SERVER: starting\n");
}

#define UART_IRQ_CH 0
#define CLIENT_CH 2

uintptr_t serial_to_client_vaddr;
uintptr_t client_to_serial_vaddr;

microkit_msginfo protected(microkit_channel channel, microkit_msginfo msginfo)
{
    switch (channel) {
        case CLIENT_CH: {
            ((char *)serial_to_client_vaddr)[0] = (char) uart_get_char();
            return microkit_msginfo_new(0, 1);
            break;
        }
    }
    return microkit_msginfo_new(0, 0);
}

void notified(microkit_channel channel) {
    switch (channel) {
        case CLIENT_CH:
            uart_put_str((char *)client_to_serial_vaddr);
            break;
    }
}
~~~

**buffer-overflow-control-flow.system**

~~~XML
<?xml version="1.0" encoding="UTF-8"?>
<system>
    <!-- Define your system here -->

    <memory_region name="uart" size="0x1_000" phys_addr="0x10000000"/>
    <memory_region name="client_to_serial" size="0x1000" />
    <memory_region name="serial_to_client" size="0x1000" />
    <memory_region name="mr0" size="0x100000" />

    <protection_domain name="serial_server" priority="254">
        <program_image path="serial_server.elf" />
        <map mr="uart" vaddr="0x2000000" perms="rw" cached="false" setvar_vaddr="uart_base_vaddr"/>
        <map mr="serial_to_client" vaddr="0x4000000" perms="wr" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="r" setvar_vaddr="client_to_serial_vaddr"/>
    </protection_domain>

    <protection_domain name="buffer-overflow-control-flow" priority="253">
        <program_image path="buffer-overflow-control-flow.elf" />
        <map mr="serial_to_client" vaddr="0x4000000" perms="r" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="rw" setvar_vaddr="client_to_serial_vaddr"/>
        <map mr="mr0" vaddr="0x4002000" perms="rw" setvar_vaddr="btpmem" setvar_size="btpmem_size"/>
    </protection_domain>

    <channel>
        <end pd="buffer-overflow-control-flow" id="1" pp="true" />
        <end pd="serial_server" id="2" />
    </channel>
</system>
~~~

**main-asserts.inc**

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 Jessica Clarke
 */
#include <sel4/assert.h>
#include <stdint.h>
#ifdef __CHERI_PURE_CAPABILITY__
#include <cheriintrin.h>
#endif

static void
main_asserts(void *buf, void *fptr)
{
	uintptr_t ubuf = (uintptr_t)buf;
	uintptr_t ufptr = (uintptr_t)fptr;
#ifdef __CHERI_PURE_CAPABILITY__
	ptraddr_t ubuf_top;
#endif

#ifdef __CHERI_PURE_CAPABILITY__
	ubuf_top = cheri_base_get(ubuf) + cheri_length_get(ubuf);
#endif

#if defined(__CHERI_PURE_CAPABILITY__) && !defined(CHERI_NO_ALIGN_PAD)
	/*
	 * For the normal pure-capability case, `buf`'s allocation should be
	 * adequately padded to ensure precise capability bounds and `fptr`
	 * should be adjacent.
	 */
	seL4_Assert(ubuf_top == ufptr);
#else
	/*
	 * Otherwise `fptr` should be 8 bytes (not 0 due to malloc's alignment
	 * requirements) after the end of `buf`.
	 */
	seL4_Assert(ubuf + 25008 == ufptr);
#ifdef __CHERI_PURE_CAPABILITY__
	/*
	 * For pure-capability code this should result in the bounds of the
	 * large `buf` allocation including all of `fptr`.
	 */
	seL4_Assert(ubuf_top >= ufptr + sizeof(void *));
#endif
#endif
}
~~~



# [Exploiting an uninitialized stack frame to manipulate control flow](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#exploiting-an-uninitialized-stack-frame-to-manipulate-control-flow)
{: id="exploiting-an-uninitialized-stack-frame-to-manipulate-control-flow" }

The objective of this mission is to demonstrate arbitrary code
execution through the use of uninitialized variables on the stack,
despite CHERI protections. You will attack three different versions
of the program:

1. A baseline RISC-V compilation, to establish that the vulnerability is
   exploitable without any CHERI protections.
2. A hardened CHERI-RISC-V compilation with stack clearing, which
   should be non-exploitable.
3. A baseline CHERI-RISC-V compilation with no stack clearing, which
   should be non-exploitable due to pointer tagging.

The success condition for an exploit, given attacker-provided input
overriding an on-stack buffer, is to modify control flow in the program
such that the `success` function is executed.

### [Program overview](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#program-overview)
{: id="program-overview" }

Cookie monster is always hungry for more cookies. You can sate the
monster's hunger by providing cookies as standard input. Cookies are
provided as a pair of hexadecimal characters (case is ignored). Each
cookie is stored at successive bytes in an on-stack character array.
The character array aliases an uninitialized function pointer used in
a subsequent function. A minus character ('-') can be used to skip
over a character in the array without providing a new cookie. An
equals sign ('=') can be used to skip over the number of characters in
a pointer without providing any new cookies. Whitespace is ignored in
the input line. Input is terminated either by a newline or end of
file (EOF).

### [Building and running](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#building-and-running)
{: id="building-and-running" }

The hardened CHERI-RISC-V version with stack clearing is built by
adding `-ftrivial-auto-var-init=zero -enable-trivial-auto-var-init-zero-knowing-it-will-be-removed-from-clang`
to the compiler command line.

### [Source code](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#source-code)
{: id="source-code" }

***stack-mission.c***

~~~C
/*
 * SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016
 * Copyright (c) 2020 SRI International
 */

#include <sel4/assert.h>
#include <stdalign.h>
#include <stddef.h>
#include <stdint.h>
#include <printf.h>
#include <microkit.h>

#define SERIAL_CHANNEL 1
uintptr_t serial_to_client_vaddr;
uintptr_t client_to_serial_vaddr;

// Helper functions since we don't have a C library
// ------------------------------------------------ //
static char getchar() {
    microkit_ppcall(SERIAL_CHANNEL, microkit_msginfo_new(1, 0));
    return ((char *)serial_to_client_vaddr)[0];
}

static int isxdigit(int c) {
    return (c >= '0' && c <= '9') ||
           (c >= 'a' && c <= 'f') ||
           (c >= 'A' && c <= 'F');
}

static int digittoint(int c) {
    if (c >= '0' && c <= '9')
        return c - '0';
    if (c >= 'a' && c <= 'f')
        return c - 'a' + 10;
    if (c >= 'A' && c <= 'F')
        return c - 'A' + 10;
    return -1;  // Not a valid hex digit
}

static int isspace(int c) {
    return c == ' '  ||  // space
           c == '\t' ||  // horizontal tab
           c == '\n' ||  // newline
           c == '\v' ||  // vertical tab
           c == '\f' ||  // form feed
           c == '\r';    // carriage return
}

static void errx(int err, const char *msg) {
    printf("ERROR: %s\n", msg);
    microkit_internal_crash(err);  // Crash the component with a specific error code
}

static void exit(int status) {
    microkit_internal_crash(status);
}
// ------------------------------------------------ //

void
success(void)
{
	printf("Exploit successful, yum!\n");
	exit(42);
}

void
no_cookies(void)
{
	printf("No cookies??\n");
	exit(1);
}

#pragma weak init_pointer
void
init_pointer(void *p)
{
}

static void __attribute__((noinline))
init_cookie_pointer(void)
{
	void *pointers[12];
	void (* volatile cookie_fn)(void);

	for (size_t i = 0; i < sizeof(pointers) / sizeof(pointers[0]); i++)
		init_pointer(&pointers[i]);
	cookie_fn = no_cookies;
}

static void __attribute__((noinline))
get_cookies(void)
{
	alignas(void *) char cookies[sizeof(void *) * 32];
	char *cookiep;
	int ch, cookie;

	printf("Cookie monster is hungry, provide some cookies!\n");
	printf("'=' skips the next %zu bytes\n", sizeof(void *));
	printf("'-' skips to the next character\n");
	printf("XX as two hex digits stores a single cookie\n");
	printf("> ");

	cookiep = cookies;
	for (;;) {
		ch = getchar();

		if (ch == '\n' || ch == '\r' || ch == -1)
			break;

		if (isspace(ch))
			continue;

		if (ch == '-') {
			cookiep++;
			continue;
		}

		if (ch == '=') {
			cookiep += sizeof(void *);
			continue;
		}

		if (isxdigit(ch)) {
			cookie = digittoint(ch) << 4;
			ch = getchar();
			if (ch == -1)
				errx(1, "Half-eaten cookie, yuck!");
			if (!isxdigit(ch))
				errx(1, "Malformed cookie");
			cookie |= digittoint(ch);
			*cookiep++ = cookie;
			continue;
		}

		errx(1, "Malformed cookie");
	}
}

static void __attribute__((noinline))
eat_cookies(void)
{
	void *pointers[12];
	void (* volatile cookie_fn)(void);

	for (size_t i = 0; i < sizeof(pointers) / sizeof(pointers[0]); i++)
		init_pointer(&pointers[i]);
	cookie_fn();
}

void
init(void)
{
	init_cookie_pointer();
	get_cookies();
	eat_cookies();
}

void notified(microkit_channel channel) {
    switch (channel) {
        case SERIAL_CHANNEL: {
            char ch = ((char *)serial_to_client_vaddr)[0];
            microkit_dbg_putc(ch);
            break;
        }
    }
}
~~~

**serial\_server.c**

~~~C
#include <stdint.h>
#include <microkit.h>

#if defined(BOARD_qemu_virt_riscv64)
typedef uint8_t uart_reg_t;
#elif defined(BOARD_ariane)
typedef uint32_t uart_reg_t;
#else
#error "Unsupported board for the serial driver"
#endif
// This variable will have the address of the UART device
uintptr_t uart_base_vaddr;

/* QEMU RISC-V virt emulates a 16550 compatible UART. */
#define BIT(n) (1ul<<(n))

#define UART_IER_ERBFI   BIT(0)   /* Enable Received Data Available Interrupt */
#define UART_IER_ETBEI   BIT(1)   /* Enable Transmitter Holding Register Empty Interrupt */
#define UART_IER_ELSI    BIT(2)   /* Enable Receiver Line Status Interrupt */
#define UART_IER_EDSSI   BIT(3)   /* Enable MODEM Status Interrupt */

#define UART_FCR_ENABLE_FIFOS   BIT(0)
#define UART_FCR_RESET_RX_FIFO  BIT(1)
#define UART_FCR_RESET_TX_FIFO  BIT(2)
#define UART_FCR_TRIGGER_1      (0u << 6)
#define UART_FCR_TRIGGER_4      (1u << 6)
#define UART_FCR_TRIGGER_8      (2u << 6)
#define UART_FCR_TRIGGER_14     (3u << 6)

#define UART_LCR_DLAB    BIT(7)   /* Divisor Latch Access */

#define UART_LSR_DR      BIT(0)   /* Data Ready */
#define UART_LSR_THRE    BIT(5)   /* Transmitter Holding Register Empty */

typedef volatile struct {
    uart_reg_t rbr_dll_thr; /* 0x00 Receiver Buffer Register (Read Only)
                             *   Divisor Latch (LSB)
                             *   Transmitter Holding Register (Write Only)
                             */
    uart_reg_t dlm_ier;     /* 0x04 Divisor Latch (MSB)
                             *   Interrupt Enable Register
                             */
    uart_reg_t iir_fcr;     /* 0x08 Interrupt Identification Register (Read Only)
                             *   FIFO Control Register (Write Only)
                             */
    uart_reg_t lcr;         /* 0xC Line Control Register */
    uart_reg_t mcr;         /* 0x10 MODEM Control Register */
    uart_reg_t lsr;         /* 0x14 Line Status Register */
    uart_reg_t msr;         /* 0x18 MODEM Status Register */
} uart_regs_t;

#define REG_PTR(base, offset) ((volatile uint32_t *)((base) + (offset)))
/*
 *******************************************************************************
 * UART access primitives
 *******************************************************************************
 */

static int internal_uart_is_tx_empty(uart_regs_t *regs)
{
    /* The THRE bit is set when the FIFO is fully empty. On real hardware, there
     * seems no way to detect if the FIFO is partially empty only, so we can't
     * implement a "tx_ready" check. Since QEMU does not emulate a FIFO, this
     * does not really matter.
     */
    return (0 != (regs->lsr & UART_LSR_THRE));
}

static void internal_uart_tx_byte(uart_regs_t *regs, uint8_t byte)
{
    /* Caller has to ensure TX FIFO is ready */
    regs->rbr_dll_thr = byte;
}

static int internal_uart_is_rx_empty(uart_regs_t *regs)
{
    return (0 == (regs->lsr & UART_LSR_DR));
}


static int internal_uart_rx_byte(uart_regs_t *regs)
{
    /* Caller has to ensure RX FIFO has data */
    return regs->rbr_dll_thr;
}

void uart_init() {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;
    regs->dlm_ier = 0; // disable interrupts

    /* Baudrates and serial line parameters are not emulated by QEMU, so the
     * divisor is just a dummy.
     */
    uint16_t clk_divisor = 1; /* dummy, would be for 115200 baud */
    regs->lcr = UART_LCR_DLAB; /* baud rate divisor setup */
    regs->dlm_ier = (clk_divisor >> 8) & 0xFF;
    regs->rbr_dll_thr = clk_divisor & 0xFF;
    regs->lcr = 0x03; /* set 8N1, clear DLAB to end baud rate divisor setup */

    /* enable and reset FIFOs, interrupt for each byte */
    regs->iir_fcr = UART_FCR_ENABLE_FIFOS
                    | UART_FCR_RESET_RX_FIFO
                    | UART_FCR_RESET_TX_FIFO
                    | UART_FCR_TRIGGER_1;

    /* enable RX interrupts */
    regs->dlm_ier = UART_IER_ERBFI;
}

void uart_put_char(int c) {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;

    /* There is no way to check for "TX ready", the only thing we have is a
     * check for "TX FIFO empty". This is not optimal, as we might wait here
     * even if there is space in the FIFO. Seems the 16550 was built based on
     * the idea that software keeps track of the FIFO usage. A driver would
     * know how much space is left in the FIFO, so it can write new data
     * either immediately or buffer it. If the FIFO empty interrupt arrives,
     * data can be written from the buffer to fill the FIFO.
     * However, since QEMU does not emulate a FIFO, we can just implement a
     * simple model here and block - expecting to never block practically.
     */
    while (!internal_uart_is_tx_empty(regs)) {
        /* busy waiting loop */
    }

    /* Extract the byte to send, drop any flags. */
    uint8_t byte = (uint8_t)c;

    internal_uart_tx_byte(regs, byte);
}

void uart_handle_irq() {
}

void uart_put_str(char *str) {
    while (*str) {
        uart_put_char(*str);
        str++;
    }
}

int uart_get_char() {
    uart_regs_t *regs = (uart_regs_t *) uart_base_vaddr;

    /* if UART is empty return an error */
    while(internal_uart_is_rx_empty(regs));

    return internal_uart_rx_byte(regs) & 0xFF;
}

void init(void) {
    // First we initialise the UART device, which will write to the
    // device's hardware registers. Which means we need access to
    // the UART device.
    uart_init();
    // After initialising the UART, print a message to the terminal
    // saying that the serial server has started.
    uart_put_str("SERIAL SERVER: starting\n");
}

#define UART_IRQ_CH 0
#define CLIENT_CH 2

uintptr_t serial_to_client_vaddr;
uintptr_t client_to_serial_vaddr;

microkit_msginfo protected(microkit_channel channel, microkit_msginfo msginfo)
{
    switch (channel) {
        case CLIENT_CH: {
            ((char *)serial_to_client_vaddr)[0] = (char) uart_get_char();
            return microkit_msginfo_new(0, 1);
            break;
        }
    }
    return microkit_msginfo_new(0, 0);
}

void notified(microkit_channel channel) {
    switch (channel) {
        case CLIENT_CH:
            uart_put_str((char *)client_to_serial_vaddr);
            break;
    }
}
~~~

**uninitialized-stack-frame-control-flow.system**

~~~XML
<?xml version="1.0" encoding="UTF-8"?>
<system>
    <!-- Define your system here -->

    <memory_region name="uart" size="0x1_000" phys_addr="0x10000000"/>
    <memory_region name="client_to_serial" size="0x1000" />
    <memory_region name="serial_to_client" size="0x1000" />

    <protection_domain name="serial_server" priority="254">
        <program_image path="serial_server.elf" />
        <map mr="uart" vaddr="0x2000000" perms="rw" cached="false" setvar_vaddr="uart_base_vaddr"/>
        <map mr="serial_to_client" vaddr="0x4000000" perms="wr" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="r" setvar_vaddr="client_to_serial_vaddr"/>
    </protection_domain>

    <protection_domain name="uninitialized-stack-frame-control-flow" priority="253">
        <program_image path="uninitialized-stack-frame-control-flow.elf" />
        <map mr="serial_to_client" vaddr="0x4000000" perms="r" setvar_vaddr="serial_to_client_vaddr"/>
        <map mr="client_to_serial" vaddr="0x4001000" perms="rw" setvar_vaddr="client_to_serial_vaddr"/>
    </protection_domain>

    <channel>
        <end pd="uninitialized-stack-frame-control-flow" id="1" pp="true" />
        <end pd="serial_server" id="2" />
    </channel>
</system>
~~~



# [Appendix](https://cheri-alliance.github.io/CHERI-seL4-Exercises/print.html#appendix)
{: id="appendix" }

This book and related source code are released under the following license:

~~~
SPDX-License-Identifier: BSD-2-Clause-DARPA-SSITH-ECATS-HR0011-18-C-0016

Copyright (c) 2020 Jessica Clarke
Copyright (c) 2020, 2022 Robert N. M. Watson
Copyright (c) 2020 SRI International
Copyright (c) 2022 Microsoft Corporation
Copyright (c) 2025 Capabilities Limited

This software was developed by SRI International and the University of
Cambridge Computer Laboratory (Department of Computer Science and
Technology) under DARPA contract HR0011-18-C-0016 ("ECATS"), as part of the
DARPA SSITH research programme.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.
~~~
