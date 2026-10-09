---
title: Helper scripts
layout: source
permalink: /sources/cheri-alliance.github.io/html-pages/CHERI-seL4-Exercises/introduction/ccc.html
---

# [Helper scripts](https://cheri-alliance.github.io/CHERI-seL4-Exercises/introduction/ccc.html#helper-scripts)
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
