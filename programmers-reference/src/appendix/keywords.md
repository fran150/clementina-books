# A. BASIC keywords and tokens

Every keyword with its syntax and a one-line summary, in the order of the token
numbers. The full entries are in [the dictionary](../dictionary/index.md).

{{#include ../../../tables/basic-keywords.md}}

## Tokens

When BASIC stores a line, it replaces each keyword with a one-byte **token**,
`$80` or above; everything else stays as typed
([Mapping Clementina](../../../mapping/src/cpu/basic-workspace.md) shows the
layout of a stored line). A program that reads or writes BASIC's program text
needs these numbers.

{{#include ../../../tables/basic-tokens.md}}
