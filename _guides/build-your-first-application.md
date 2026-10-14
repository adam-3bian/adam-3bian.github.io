---
title: Build Your First Application
image_url: /assets/guides/build-your-first-application/placeholder.svg
repository_urls: []
updated_date: null
authors: []
related:
  working-groups: []
  hardware:
  - cheriot
  software:
  - cheribsd
---

# Build Your First Application

Build a small program, confirm it runs as capability-aware code, and observe a controlled bounds violation in the target environment.

Your first CHERI application should answer three separate questions:

- Can the toolchain compile and link for the selected target?
- Is the program running in the intended capability mode?
- Does an invalid access fail in the way the platform documents?

A hello-world message answers only the first question.

## A small pointer example

Create first-cheri.c:

```c
#include <stdio.h>
static int sum(const int *values, size_t count) {
    int total = 0;
    for (size_t i = 0; i < count; i++) {
        total += values[i];
    }
    return total;
}
```

```c
int main(void) {
    int readings[] = {4, 8, 15, 16, 23, 42};
    printf("Total: %d\n", sum(readings, 6));
    return 0;
}
```

This is ordinary C. The useful difference is how a CHERI-aware compiler and application binary interface (ABI) represent values and the pointer received by sum.

## Build inside CheriBSD

If you have booted a pure-capability [CheriBSD](/software/cheribsd/) image, create the file inside the guest and run:

```bash
cc -Wall -Wextra -O2 first-cheri.c -o first-cheri
```

```bash
./first-cheri
```

Expected output:

Total: 108

Use the target’s binary inspection tools to confirm the ABI. Exact output and flags vary by architecture, but file, readelf, and the platform documentation should identify a pure-capability binary.

## Build as CHERIoT firmware

[CHERIoT](/hardware/cheriot/) applications are firmware images rather than Unix processes. Add the source to one of the real-time operating system (RTOS) example projects or create a project using the software development kit’s (SDK’s) compartment() and firmware() build helpers.

Configure the documented simulator or board target, then build and run:

```bash
xmake config --sdk=/cheriot-tools --board=<supported-board>
xmake
xmake run
```

Use the [CHERIoT Programmer’s Guide](https://cheriot.org/book/) for the current project layout, entry-point signature, and serial-console or simulator output interface. Begin from a supplied example so that the board description, linker configuration, and RTOS dependencies are known to work.

## Observe an invalid access safely

After the valid program works, create a separate development-only test. Keep intentional undefined behaviour out of production code.

For a Unix-like pure-capability environment:

```c
#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *values = malloc(2 * sizeof(*values));
    if (values == NULL) {
        return 1;
    }
    values[0] = 10;
    values[1] = 20;
    printf("%d\n", values[2]);
    free(values);
    return 0;
}
```

Build it without optimising away the invalid operation:

```bash
cc -Wall -Wextra -O0 bounds-fault.c -o bounds-fault
```

```bash
./bounds-fault
```

A suitable pure-capability allocator and runtime should return a capability bounded to the allocation. Reading values\[2\] then exceeds that bound and should produce a capability fault. Capture the full diagnostic.

This example demonstrates spatial protection, not temporal safety. Reading through values after free(values) tests a different property and the result depends on the platform’s allocator and revocation mechanism.

## If the program does not fault

A missing fault does not by itself mean that CHERI failed. Check the configuration first:

- Is the binary pure-capability, hybrid, or conventional?
- Did the compiler remove the undefined access?
- Did the allocator return bounds wider than the requested size because of representability or allocation granularity?
- Are you running the binary built by the CHERI compiler rather than a host binary?
- Does this platform document subobject or allocation bounds for the case you tested?

Use the platform test suite for authoritative validation. Small C examples are learning aids, not conformance tests.

## Record a useful result

Keep the following with your output:

- source code and build flags
- compiler version and target
- operating-system or RTOS revision
- architecture, ABI, and simulator or board
- valid program output
- complete fault diagnostic from the invalid test

You now have a reproducible baseline. The next useful step is to build an existing library or move the example behind a compartment boundary.
