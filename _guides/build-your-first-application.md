---
title: Build Your First Application
---

1. Build
2. Developers
3. Build Your First Application
{: .source-breadcrumbs }

# Build Your First Application
{: id="page-hero-title" .page-hero-title }

Build a small program, confirm it runs as capability-aware code, and observe a controlled bounds violation in the target environment.
{: .page-hero-summary }

Your first CHERI application should answer three separate questions:

1. Can the toolchain compile and link for the selected target?
2. Is the program running in the intended capability mode?
3. Does an invalid access fail in the way the platform documents?

A hello-world message answers only the first question.

## A small pointer example
{: id="a-small-pointer-example" }

Create `first-cheri.c`:

~~~
#include <stdio.h>

static int sum(const int *values, size_t count) {
    int total = 0;

    for (size_t i = 0; i < count; i++) {
        total += values[i];
    }

    return total;
}

int main(void) {
    int readings[] = {4, 8, 15, 16, 23, 42};

    printf("Total: %d\n", sum(readings, 6));
    return 0;
}
~~~

This is ordinary C. The useful difference is how a CHERI-aware compiler and application binary interface (ABI) represent `values` and the pointer received by `sum`.

## Build inside CheriBSD
{: id="build-inside-cheribsd" }

If you have booted a pure-capability CheriBSD image, create the file inside the guest and run:

~~~
cc -Wall -Wextra -O2 first-cheri.c -o first-cheri
./first-cheri
~~~

Expected output:

~~~
Total: 108
~~~

Use the target’s binary inspection tools to confirm the ABI. Exact output and flags vary by architecture, but `file`, `readelf`, and the platform documentation should identify a pure-capability binary.

## Build as CHERIoT firmware
{: id="build-as-cheriot-firmware" }

CHERIoT applications are firmware images rather than Unix processes. Add the source to one of the real-time operating system (RTOS) example projects or create a project using the software development kit’s (SDK’s) `compartment()` and `firmware()` build helpers.

Configure the documented simulator or board target, then build and run:

~~~
xmake config --sdk=/cheriot-tools --board=<supported-board>
xmake
xmake run
~~~

Use the [CHERIoT Programmer’s Guide](https://cheriot.org/book/) for the current project layout, entry-point signature, and serial-console or simulator output interface. Begin from a supplied example so that the board description, linker configuration, and RTOS dependencies are known to work.

## Observe an invalid access safely
{: id="observe-an-invalid-access-safely" }

After the valid program works, create a separate development-only test. Keep intentional undefined behaviour out of production code.

For a Unix-like pure-capability environment:

~~~
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
~~~

Build it without optimising away the invalid operation:

~~~
cc -Wall -Wextra -O0 bounds-fault.c -o bounds-fault
./bounds-fault
~~~

A suitable pure-capability allocator and runtime should return a capability bounded to the allocation. Reading `values[2]` then exceeds that bound and should produce a capability fault. Capture the full diagnostic.

This example demonstrates spatial protection, not temporal safety. Reading through `values` after `free(values)` tests a different property and the result depends on the platform’s allocator and revocation mechanism.

## If the program does not fault
{: id="if-the-program-does-not-fault" }

A missing fault does not by itself mean that CHERI failed. Check the configuration first:

- Is the binary pure-capability, hybrid, or conventional?
- Did the compiler remove the undefined access?
- Did the allocator return bounds wider than the requested size because of representability or allocation granularity?
- Are you running the binary built by the CHERI compiler rather than a host binary?
- Does this platform document subobject or allocation bounds for the case you tested?

Use the platform test suite for authoritative validation. Small C examples are learning aids, not conformance tests.

## Record a useful result
{: id="record-a-useful-result" }

Keep the following with your output:

- source code and build flags
- compiler version and target
- operating-system or RTOS revision
- architecture, ABI, and simulator or board
- valid program output
- complete fault diagnostic from the invalid test

You now have a reproducible baseline. The next useful step is to build an existing library or move the example behind a compartment boundary.

## Where next
{: .where-next-title }

### [Port Existing Software](/guides/port-existing-software/)
{: .where-next-card-title }





[Porting software to CHERI is a process of finding assumptions about pointers, integers, objects, bounds, provenance, lifetimes, and interfaces.](/guides/port-existing-software/)
{: .where-next-summary }



[Continue](/guides/port-existing-software/)
{: .source-card-label }

## Related content
{: .related-pages-title }

### [Choose a Platform](/guides/choose-a-platform/)
{: .related-pages-item-title }





[A CHERI platform combines more than an instruction set.](/guides/choose-a-platform/)
{: .related-pages-item-summary }



[Read this page](/guides/choose-a-platform/)
{: .source-card-label }





### [Install a Toolchain](/guides/install-a-toolchain/)
{: .related-pages-item-title }





[A guide to the main toolchain components used to build CHERI software and where platform-specific setup differs.](/guides/install-a-toolchain/)
{: .related-pages-item-summary }



[Read this page](/guides/install-a-toolchain/)
{: .source-card-label }
