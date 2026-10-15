---
title: Permissions
permalink: /build/technology/permissions/
summary: Capability permissions let software grant read, write, execute, and other authority separately instead
  of treating every pointer as equally powerful.
image_url: null
updated_date: null
parent: /build/
next_page_url: /build/technology/provenance/
related:
  pages:
  - /build/technology/capabilities/
  - /build/technology/bounds/
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides: []
  policies: []
navigation:
  header:
    category: Build
    subcategory: Technology
    parent: how-cheri-capabilities-work
    order: 3
---

# Permissions

A pointer to a configuration object may need to read settings but should not change them. A code pointer may need to execute instructions but should not authorise data writes. A logging component may be allowed to submit an event without gaining access to the logger’s internal state.

CHERI permissions let capabilities express these differences in hardware-enforced authority.

## Common permission categories

The precise permission set varies by CHERI architecture, but it commonly includes authority related to:

- loading ordinary data
- storing ordinary data
- fetching or executing instructions
- loading capabilities from memory
- storing capabilities to memory
- sealing or unsealing protected objects
- accessing privileged or system resources

Separating data access from capability access is especially useful. A component may be allowed to copy ordinary bytes from a buffer while being prevented from loading and acquiring capabilities stored inside it.

## Removing permissions

Software can derive a less powerful capability by clearing permissions. For example:

```text
Original:  read + write + load-capability + store-capability
Derived:   read
```

The derived capability can be passed to a parser that needs to inspect input but must not modify it or acquire embedded authority.

Clearing permissions follows the same monotonic model as narrowing bounds. The holder cannot restore a removed permission unless it retained or receives another capability that still carries that authority.

## Permission checks happen on use

The processor checks the permission required by each operation. A store through a capability without write authority faults even if the target address is inside the bounds and the virtual-memory page is writable.

CHERI checks complement page-table permissions. A page may be writable for one part of a process while a particular capability passed to a component is read-only.

This gives software a finer boundary than page-granularity protection.

## Read-only is more than an interface promise

In conventional C, const helps the compiler and documents intent, but another alias may still write to the same object. It also does not normally cause the processor to reject every store through the underlying address.

A capability with write permission removed creates an architectural restriction for accesses through that capability. Other capabilities with write authority may still modify the object, so the system must control aliases if immutability is part of the security policy.

## Execute authority

Executable capabilities authorise instruction fetch within defined bounds. Architectures and operating systems can combine this with sealing, sentries, and page permissions to create controlled entry points.

A caller may receive authority to enter a service at an approved function without receiving a writable capability for the service’s code or data. This is one building block for compartment calls.

## Capability load and store permissions

Consider a buffer that contains ordinary data and a stored capability. A load-data permission may let a component read the bytes, while a separate load-capability permission controls whether loading the aligned capability also transfers its valid tag and authority.

Similarly, store-capability permission can control whether a component may place tagged capabilities into memory. Exact behaviour is architecture-specific, but the security goal is consistent: control not only information flow, but also the movement of authority.

## Apply least privilege

When creating an interface, ask which individual operations are necessary:

- Parse input: Provide a capability bounded to the input, make it read-only, and remove capability-load permission where the architecture supports it.
- Fill output: Provide a capability bounded to the output, make it writable, and remove execute permission.
- Call one service: Provide a sealed or sentry entry capability for that service.
- Execute code: Provide execute authority without permission to write the code as data.
- Share immutable data: Provide read-only authority and avoid giving the recipient another writable reference to the same data.

Start narrow and add a permission only when a documented operation requires it.

## Important limits

Permission names and combinations differ across CHERI-RISC-V, Morello, and CHERIoT.

A read capability can still leak every byte within its bounds.

Write permission does not validate the meaning of the value being written.

Removing permission from one capability does not change other aliases.

Software policy and operating-system support determine who receives the original authority.

Permissions answer “what operations may this capability authorise?” Bounds answer “where?”, while Provenance and tags answer “how did this authority remain valid?”
