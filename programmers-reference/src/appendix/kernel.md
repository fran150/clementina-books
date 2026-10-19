# C. The kernel jump table

The kernel's entry points, at fixed addresses from `$0400`. Programs call them
by these addresses, which stay the same when the kernel changes. How each one
is used is in [The kernel](../ml/kernel.md); the SDK's `clementina.inc` names
them all.

{{#include ../../../tables/kernel-abi.md}}

## Memory the kernel uses

{{#include ../../../tables/cpu-memory-map.md}}
