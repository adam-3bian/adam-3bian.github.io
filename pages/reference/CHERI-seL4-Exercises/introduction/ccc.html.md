---
title: Helper scripts
permalink: /reference/CHERI-seL4-Exercises/introduction/ccc.html
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

# Helper scripts

Because the command line required to compile exercises is quite unwieldy, we've created a wrapper script to help out, shown below. If you've checked out this repository it's present in tools/ccc. The usage is:

```text
ccc <arch> [...]

Supported architectures:
	aarch64         - conventional AArch64
	morello-hybrid  - AArch64 Morello supporting CHERI
	morello-purecap - AArch64 Morello pure-capability
	riscv64         - conventional RISC-V 64-bit
	riscv64-hybrid  - RISC-V 64-bit supporting CHERI
	riscv64-purecap - RISC-V 64-bit pure-capability
```

and it can be used in place of your compiler.

For the exercises in this book you will use the riscv64 and riscv64-purecap architectures. The riscv64-hybrid architecture instantiates appropriately annotated pointers as capabilities leaving the rest as conventional integer addresses, but is not used here.

If you have built a compiler and sysroot using cheribuild in the default location (\~/cheri) then it should work out of the box. If you've configured a different location you can set the CHERIBUILD\_SDK environment variable to point to to the location of your SDK. Alternatively, you can set the CLANG variable to point to the respective location.

#!/bin/sh

\#

\# ccc - Cross compilation script

set -e

set -u

name=$(basename "$0")

VERBOSE=${VERBOSE:-0}

QUIET=${QUIET:-0}

usage()

{

cat \<\<EOF

$name \<arch\> \<board\> \[...\]

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

echo \>&2 "$@"

exit "$ret"

}

warn()

{

echo \>&2 "$@"

}

debug()

{

if \[ "$VERBOSE" -ne 0 \]; then

echo \>&2 "$@"

fi

}

info()

{

if \[ "$QUIET" -eq 0 \]; then

echo \>&2 "$@"

fi

}

run()

{

debug	# add space before normal multiline output

info "Running:" "$@"

"$@"

}

if \[ $# -eq 0 \]; then

usage

fi

arch=$1

shift

if \[ -n "${1:-}" \]; then

board="$1"

shift

fi

cheri\_arch\_basename=${arch%%-\*}

cheri\_sdk\_name=sdk

case $arch in

morello-aarch64)

cheri\_arch\_basename=morello

cheri\_sdk\_name=morello-sdk

arch\_flags="-target aarch64-none-elf -march=armv8"

microkit\_ldflags="-lmicrokit -lutils"

board="${board:-morello\_qemu}"

arch="morello-aarch64"

;;

morello-hybrid)

cheri\_sdk\_name=morello-sdk

arch\_flags="-target aarch64-unknown-freebsd -march=morello -Xclang -morello-vararg=new"

microkit\_ldflags="-lmicrokit -lutils"

board="${board:-morello\_qemu}"

;;

morello-purecap)

cheri\_sdk\_name=morello-sdk

arch\_flags="-target aarch64-none-elf -march=morello -mabi=purecap -Xclang -morello-vararg=new"

microkit\_ldflags="-lmicrokit\_purecap -lutils\_purecap -Wl,--local-caprelocs=legacy"

board="${board:-morello\_qemu}"

;;

riscv64)

cheri\_sdk\_name=cheri-alliance-sdk

arch\_flags="-target riscv64-unknown-elf -march=rv64gc -mabi=lp64d -mno-relax"

microkit\_ldflags="-lmicrokit -lutils"

board="${board:-qemu\_virt\_riscv64}"

;;

riscv64-hybrid)

cheri\_sdk\_name=cheri-alliance-sdk

arch\_flags="-target riscv64-unknown-elf -march=rv64gc\_zcherihybrid -mabi=lp64d -mno-relax"

microkit\_ldflags="-lmicrokit -lutils"

board="${board:-qemu\_virt\_riscv64}"

;;

riscv64-purecap)

cheri\_sdk\_name=cheri-alliance-sdk

arch\_flags="-target riscv64-unknown-elf -march=rv64gc\_zcherihybrid -mabi=l64pc128d -mno-relax"

microkit\_ldflags="-lmicrokit\_purecap -lutils\_purecap"

board="${board:-qemu\_virt\_riscv64}"

;;

\*)

err 1 "Unsupported architecture '$arch'"

;;

esac

\# Find our SDK, using the first of these that expands only defined variables:

\#  ${CHERIBUILD\_SDK\_${cheri\_sdk\_name}} (if that syntax worked)

\#  ${CHERIBUILD\_SDK}

\#  ${CHERIBUILD\_OUTPUT}/${cheri\_sdk\_name}

\#  ${CHERIBUILD\_SOURCE}/output/${cheri\_sdk\_name}

\#  \~/cheri/output/${cheri\_sdk\_name}

SDKDIR\_SOURCE=${CHERIBUILD\_SOURCE:-${HOME}/cheri}

SDKDIR\_OUTPUT=${CHERIBUILD\_OUTPUT:-${SDKDIR\_SOURCE}/output}

SDKDIR\_SDK=${CHERIBUILD\_SDK:-${SDKDIR\_OUTPUT}/${cheri\_sdk\_name}}

SDKDIR=$(eval echo \\${CHERIBUILD\_SDK\_"${cheri\_arch\_basename}":-})

SDKDIR=${SDKDIR:-${SDKDIR\_SDK}}

enverr()

{

echo \>&2 $1

echo "Perhaps set or adjust one of the following environment variables:"

for v in SOURCE OUTPUT SDK; do

echo " " CHERIBUILD\_$v \\(currently: \\

$(eval echo \\${CHERIBUILD\_$v:-unset, tried \\$SDKDIR\_$v})\\)

done

A="CHERIBUILD\_SDK\_${cheri\_arch\_basename}"

echo " " "$A" \\(currently: $(eval echo \\${$A:-unset, tried \\$SDKDIR})\\)

echo " " "$2" \\(currently: $(eval echo \\${$2:-unset, tried \\$SDK\_$2})\\)

err 1 "Please check your build environment"

}

SDK\_CLANG=${CLANG:-${SDKDIR}/bin/clang}

case $name in

\*clang|\*cc)	prog="${SDK\_CLANG}" ;;

\*clang++|\*c++)	prog="${SDK\_CLANG}++" ;;

\*)	err 1 "Unsupported program name '$name'" ;;

esac

if \[ ! -x "$prog" \]; then

enverr "Target compiler '$prog' not found." "CLANG"

fi

debug "prog: $prog"

MICROKIT\_SDK=${MICROKIT\_SDK:-${SDKDIR}/baremetal/baremetal-${arch}/microkit-sdk-2.0.1-dev}

if \[ ! -d "$MICROKIT\_SDK" \]; then

enverr "Microkit '$MICROKIT\_SDK' does not exist." "MICROKIT\_SDK"

fi

debug "microkit: $MICROKIT\_SDK"

debug "arch\_flags: $arch\_flags"

debug\_flags="-g"

debug "debug\_flags: $debug\_flags"

opt\_flags="-O2"

debug "opt\_flags: $opt\_flags"

microkit\_flags="-Wl,-L'$MICROKIT\_SDK/board/$board/cheri/lib' -I'$MICROKIT\_SDK/board/$board/cheri/include' -Wl,-Tmicrokit.ld -nostdlib -ffreestanding"

debug "microkit\_flags: $microkit\_flags"

linker\_flags="-fuse-ld=lld"

debug "linker\_flags: $linker\_flags"

diag\_flags="-Wall -Wcheri"

debug "diag\_flags: $diag\_flags"

all\_flags="$arch\_flags $debug\_flags $opt\_flags $linker\_flags $diag\_flags $microkit\_flags $microkit\_ldflags -DBOARD\_$board "

all\_flags\_rev=

\# shellcheck disable=SC2086 # intentional

eval 'for flag in '$all\_flags'; do

all\_flags\_rev="'"'"'$flag'"'"'${all\_flags\_rev:+ $all\_flags\_rev}"

done'

\# shellcheck disable=SC2086 # intentional

eval 'for flag in '$all\_flags\_rev'; do

set -- "$flag" "$@"

done'

run "$prog" "$@"

The second script is to generate a bootable image and run it on QEMU; it's present in tools/run\_qemu. The usage is:

```text
run_qemu <image.elf | image.img>
```

If you pass it an ELF file generated by ccc, it will wrap it, along with the CHERI-seL4 kernel, CHERI-Microkit libraries, loader, monitor, etc. to give you a bootable image and run it directly on QEMU by passing it as a -kernel image. The following is the script's content:

#!/bin/sh

set -e

\# --- Configuration ---

\# Find path to this script and to gen\_image

SCRIPT\_DIR=$(cd "$(dirname "$0")" && pwd)

GEN\_IMAGE="$SCRIPT\_DIR/gen\_image"

cheri\_sdk\_name=cheri-alliance-sdk

\# Setup SDK path

SDKDIR\_SOURCE=${CHERIBUILD\_SOURCE:-$HOME/cheri}

SDKDIR\_OUTPUT=${CHERIBUILD\_OUTPUT:-$SDKDIR\_SOURCE/output}

SDKDIR\_SDK=${CHERIBUILD\_SDK:-$SDKDIR\_OUTPUT/${cheri\_sdk\_name}}

SDKDIR=${SDKDIR:-$SDKDIR\_SDK}

QEMU\_BIN="$SDKDIR/bin/qemu-system-riscv64cheri"

\# Default BIOS path, relative to SDKDIR

BIOS="$SDKDIR/cheri-alliance-opensbi/riscv64/share/opensbi/l64pc128/generic/firmware/fw\_jump.elf"

\# --- Input Parsing ---

if \[ $# -lt 1 \]; then

echo "Usage: $0 \<image.elf | image.img\>"

exit 1

fi

INPUT="$1"

shift  # Remaining args are passed to QEMU

QEMU\_EXTRA\_ARGS="$@"

\# --- ELF detection using 'file' ---

FILE\_TYPE=$(file -b "$INPUT")

case "$FILE\_TYPE" in

\*"ELF "\*)

echo "Detected ELF binary. Generating image..."

"$GEN\_IMAGE" "$INPUT"

KERNEL\_IMAGE="loader.img"

;;

\*)

echo "Detected non-ELF image. Using it directly."

KERNEL\_IMAGE="$INPUT"

;;

esac

\# --- Run QEMU ---

CMD="$QEMU\_BIN -M virt -cpu codasip-a730,cheri\_levels=2 -smp 1 -serial pty -m 2G -nographic -bios \\"$BIOS\\" -kernel \\"$KERNEL\_IMAGE\\" $QEMU\_EXTRA\_ARGS"

echo "Running QEMU command:"

echo "$CMD"

eval "$CMD"

This run\_qemu script uses another gen\_image script that generates a bootable CHERI-Microkit image as shown below:

#!/bin/sh

\#

\# gen\_image - Generate bootable Microkit image script

set -e

set -u

name=$(basename "$0")

VERBOSE=${VERBOSE:-0}

QUIET=${QUIET:-0}

\# Print usage information

usage() {

echo "Usage: $0 \[-a arch\] \[-o output\_image\] input1 \[input2 ...\]"

echo ""

echo "  -a arch           Target architecture (riscv64, riscv64-purecap, morello-aarch64, morello-purecap)"

echo "  -b board          Target board (qemu\_virt\_riscv64, morello\_qemu, ariane)"

echo "  -o output\_image   Optional output image name (default: loader.img)"

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

echo \>&2 "$@"

exit "$ret"

}

warn()

{

echo \>&2 "$@"

}

debug()

{

if \[ "$VERBOSE" -ne 0 \]; then

echo \>&2 "$@"

fi

}

info()

{

if \[ "$QUIET" -eq 0 \]; then

echo \>&2 "$@"

fi

}

run()

{

debug   # add space before normal multiline output

info "Running:" "$@"

"$@"

}

if \[ $# -eq 0 \]; then

usage

fi

\# Defaults

TARGET=""

OUTPUT\_FILE="generated.system"

IMAGE\_NAME="loader.img"

INPUT\_FILES=""

SEARCH\_PATH="$(pwd)"

\# Parse args

while \[ $# -gt 0 \]; do

case "$1" in

-a)

shift

\[ $# -eq 0 \] && echo "Error: -a requires an argument" && usage

TARGET="$1"

;;

-b)

shift

\[ $# -eq 0 \] && echo "Error: -b requires an argument" && usage

BOARD="$1"

;;

-o)

shift

\[ $# -eq 0 \] && echo "Error: -o requires an argument" && usage

IMAGE\_NAME="$1"

;;

-\*)

echo "Error: Unknown option: $1"

usage

;;

\*)

INPUT\_FILES="$INPUT\_FILES $1"

;;

esac

shift

done

\[ -z "$INPUT\_FILES" \] && echo "Error: No input files provided" && usage

\[ -z "$TARGET" \] && echo "Error: -a (arch) is required" && usage

\# Pick board + SDK based on architecture

case "$TARGET" in

riscv64|riscv64-purecap)

BOARD="${BOARD:-qemu\_virt\_riscv64}"

cheri\_sdk\_name="cheri-alliance-sdk"

;;

morello-aarch64|morello-purecap)

BOARD="${BOARD:-morello\_qemu}"

cheri\_sdk\_name="morello-sdk"

;;

\*)

err 1 "Unknown target architecture: $TARGET"

;;

esac

\# SDK paths

SDKDIR\_SOURCE=${CHERIBUILD\_SOURCE:-${HOME}/cheri}

SDKDIR\_OUTPUT=${CHERIBUILD\_OUTPUT:-${SDKDIR\_SOURCE}/output}

SDKDIR\_SDK=${CHERIBUILD\_SDK:-${SDKDIR\_OUTPUT}/${cheri\_sdk\_name}}

SDKDIR=${SDKDIR:-${SDKDIR\_SDK}}

enverr()

{

echo \>&2 $1

echo "Perhaps set or adjust one of the following environment variables:"

for v in SOURCE OUTPUT SDK; do

echo " " CHERIBUILD\_$v \\(currently: \\

$(eval echo \\${CHERIBUILD\_$v:-unset, tried \\$SDKDIR\_$v})\\)

done

err 1 "Please check your build environment"

}

SDK\_MICROKIT=${CLANG:-${SDKDIR}/bin/clang}

MICROKIT\_SDK=${MICROKIT\_SDK:-${SDKDIR}/baremetal/baremetal-${TARGET}/microkit-sdk-2.0.1-dev}

if \[ ! -d "$MICROKIT\_SDK" \]; then

enverr "Microkit '$MICROKIT\_SDK' does not exist." "MICROKIT\_SDK"

fi

debug "microkit: $MICROKIT\_SDK"

MICROKIT\_TOOL=${MICROKIT\_SDK}/bin/microkit

debug "MICROKIT\_TOOL: $MICROKIT\_TOOL"

\# Generate XML

{

echo '\<?xml version="1.0" encoding="UTF-8"?\>'

echo '\<system\>'

for file in $INPUT\_FILES; do

base=$(basename "$file")

echo "    \<protection\_domain name=\\"$base\\"\>"

echo "        \<program\_image path=\\"$base\\" /\>"

echo "    \</protection\_domain\>"

done

echo '\</system\>'

} \> "$OUTPUT\_FILE"

echo "Generated $OUTPUT\_FILE from input files:$INPUT\_FILES"

echo "Running Microkit tool to generate image: $IMAGE\_NAME"

echo "$MICROKIT\_TOOL $OUTPUT\_FILE -o $IMAGE\_NAME --search-path $SEARCH\_PATH --board $BOARD --config cheri"

"$MICROKIT\_TOOL" "$OUTPUT\_FILE" -o "$IMAGE\_NAME" --search-path "$SEARCH\_PATH" --board "$BOARD" --config "cheri"

Thus, over these exercises, you'll usually be using mostly using just two scripts (given you either include them in your $PATH, or use relative/absolute paths when running them):

```text
# ccc riscv64-purecap exercise_c_files.c -o exercise.elf
# run_qemu exercise.elf
```
