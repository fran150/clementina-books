# BASIC's workspace

From the end of the image up to `$BFFF`

BASIC keeps a program and its data in one block of RAM, from the first byte
after the image up to `$BFFF`, the last byte below the I/O area. In the build
this book describes that is `$63A0-$BFFF`, 23,648 bytes; the ROM's `make`
prints the figure for each build. The block crosses `$8000`, so its top
16 KiB is extended RAM bank 0 ([Extended RAM](extended-ram.md)).

## The pointers

Six zero-page pointers divide the workspace. The program grows up from the
bottom, its variables and arrays follow it, and strings grow down from the
top:

```text
TXTTAB  ($33) ┌────────────────────────┐ end of the image
              │ Program lines          │
VARTAB  ($35) ├────────────────────────┤
              │ Simple variables       │ 7 bytes each
ARYTAB  ($37) ├────────────────────────┤
              │ Arrays                 │
STREND  ($39) ├────────────────────────┤
              │ Free                   │ FRE(0)
FRETOP  ($3B) ├────────────────────────┤
              │ Strings                │ grow down
MEMSIZ  ($3F) └────────────────────────┘ $C000 at cold start
```

| Pointer | Address | Points at |
| --- | --- | --- |
| `TXTTAB` | `$33-$34` (51-52) | The first program line. Set at cold start to the first byte after the image. |
| `VARTAB` | `$35-$36` (53-54) | The first simple variable, right after the program. |
| `ARYTAB` | `$37-$38` (55-56) | The first array, after the simple variables. |
| `STREND` | `$39-$3A` (57-58) | One past the last array: the bottom of free memory. |
| `FRETOP` | `$3B-$3C` (59-60) | The lowest string: the top of free memory. |
| `MEMSIZ` | `$3F-$40` (63-64) | One past the top of BASIC's memory. `$C000` at cold start. |

`FRESPC` (`$3D-$3E`) points at the string most recently made.

Entering or deleting a line moves everything above the program, and `RUN`
and `CLEAR` throw the variables, arrays and strings away. When a new string
doesn't fit between `STREND` and `FRETOP`, BASIC collects the garbage: it
packs the strings still in use against `MEMSIZ` and tries again.

BASIC's cold start takes `TXTTAB` from the build instead of probing for RAM,
because the probe writes test patterns and would overwrite the running image.

## Program lines

A stored line is:

```text
[link lo][link hi][number lo][number hi][tokenized text ...][$00]
```

The link is the address of the next line; a link with a zero high byte ends
the program. Keywords are stored as one-byte tokens, everything else as
typed.

Clementina keeps the colors you typed in string literals. A line with styled
literals carries a *style sidecar* after its `$00`, which the interpreter
skips when it walks from line to line:

```text
[$CE][$FF][sidecar length][record count]
then one record per literal: [offset][length][attribute 0] ... [attribute n-1]
```

`$FF` can never be the high byte of a link in base RAM, so a sidecar can't be
mistaken for a line. A line whose literals don't fit in the tokenizer's
42-byte scratch (`STYLE_SIDE_BUF`, page 3) is stored without style.

## Variables

A simple variable takes 7 bytes: a two-byte name and five bytes of value.
The name's bit 7s give its type, as on the C64:

| Type | First name byte | Second name byte | Value |
| --- | --- | --- | --- |
| Floating point (`A`) | bit 7 clear | bit 7 clear | 5 bytes: exponent and four mantissa bytes |
| Integer (`A%`) | bit 7 set | bit 7 set | 2 bytes, high byte first; 3 unused |
| String (`A$`) | bit 7 clear | bit 7 set | 3-byte descriptor (length, address low, address high); 2 unused |

A one-letter name stores a zero second byte. `FN` definitions are stored
among the simple variables too.

## Arrays

Each array has a header followed by its elements:

```text
[name][name][size lo][size hi][dimensions][count hi][count lo] ... elements
```

The size counts the whole array, header included, so BASIC finds the next
array by adding it. Each dimension stores its element count, high byte
first; `DIM A(10)` stores 11. Elements take 5 bytes for floating point, 2
for integers and 3 (a descriptor) for strings. An array used without `DIM`
gets 11 elements per dimension.

## Strings

A string descriptor holds the string's length `N` and its address. Strings
made while the program runs live between `FRETOP` and `MEMSIZ`, and each one
takes 2`N` bytes: `N` characters, then `N` attribute bytes, one per
character, in the overlay's attribute format. Strings made without a style,
by `CHR$` or `STR$` for example, get the default attribute in every
position. Because the attribute run follows the characters directly,
copying a descriptor (`A$=B$`) shares both, and garbage collection moves the
string as one block. A literal in the program that has no style record is
not copied: its descriptor points into the program text, and it prints with
BASIC's current pen. A styled literal is copied into string space with its
attributes when the line runs.

## Reserving RAM

`MEMSIZ` can be lowered to keep part of the top of the workspace away from
BASIC, as `POKE 55/56` does on the C64:

```basic
POKE 63,0:POKE 64,176:CLEAR
```

frees `$B000-$BFFF` (4 KiB) until the next cold start. The keyword is
`CLEAR`, not the C64's `CLR`. Reserved RAM from `$8000` up is in bank 0,
which is always mapped while BASIC runs.

## Where machine code can go

`BLOAD` and `BRUN` put a file wherever its header or address says; Clementina
doesn't protect any region, and choosing a safe place is the programmer's job.

- **Code that returns to BASIC** (called with `SYS` or `USR`) must leave
  BASIC intact. It fits in the 120 free bytes at `$0280-$02F7`
  ([Page 2](page-2.md)), in extended RAM banks 1-31
  ([Extended RAM](extended-ram.md)), or above a lowered `MEMSIZ`.
- **Code that takes over the machine** (started with `BRUN`) may overwrite
  BASIC: anything from `$1600` up. Below `$1600` is the kernel, which holds
  the loader itself, so a load there crashes in the middle of the copy. The
  SDK's templates use `$1800`.

## A known problem

`INPUT` misreads its buffer, and asks `??` again, when the program text
starts somewhere in about `$39FE-$3AC0`. The cause is not found yet. `TXTTAB`
is far above that range today, so it only matters if the image ever shrinks
that much.
