# About this book

The *Clementina Programmer's Reference Guide* is for anyone who programs
Clementina, in BASIC or in 65C02 machine language. It follows the plan of the
*Commodore 64 Programmer's Reference Guide*: it teaches the rules of the
language, describes every keyword, and then goes down to the machine itself.

Clementina is a 65C02 computer with a companion chip called MIA. MIA is a
Raspberry Pi Pico 2 W that sits on the 6502's bus and does almost everything
that is not the CPU: it generates the clock, loads the kernel at power-on,
holds 256 KiB of video, sound, input and file memory, and talks to the outside
world over Wi-Fi and the SD card. A program reaches all of that through 32
registers at the top of the 6502's memory. Most of this book is about using
those two halves together.

The book has three parts:

- **Part I, BASIC**, covers Clementina BASIC: how programs are written, how
  numbers and strings work, and one chapter for each kind of thing a program
  does (text, graphics, sound, input, files, MIA memory, time). Then comes the
  BASIC dictionary, every one of the 183 keywords in alphabetical order, and
  the error messages.
- **Part II, Machine language**, introduces the 65C02, lists its instruction
  set, documents the kernel's 26 entry points, and shows how machine code
  handles interrupts, works with BASIC, switches the extended RAM banks and
  drives the VIA. It ends with WozMon, the built-in machine-code monitor.
- **Part III, Programming MIA**, explains MIA's programming model (index
  windows, configuration fields, commands, status, errors and interrupts) and
  then each of its subsystems from machine language: graphics, sound, input,
  the SD card and time.

The appendices collect the reference tables.

## The other books

This book explains how to *use* the machine. Its companions cover the rest:

- ***Mapping Clementina*** walks through every address in the 6502's 64 KiB
  and in MIA's 256 KiB of RAM. When this book uses an address that Mapping
  already describes, it links there instead of repeating it.
- The ***Clementina SDK & Studio Guide*** covers the toolchain: building
  programs with the SDK, the asset editors and the emulator. This book shows
  machine code in the assembler syntax the SDK uses, but leaves building and
  debugging to the SDK book.
- The ***Clementina User's Manual*** gets a new user from an empty table to
  the READY prompt.
- The ***Hardware & MIA Technical Reference*** covers the board, the bus and
  how MIA implements what this book describes, including the network
  protocols the video client speaks.

## Conventions

- Addresses and values are hexadecimal when they are written with `$`, and
  decimal otherwise. BASIC takes decimal (and hexadecimal with `$`, see
  [Numbers, strings and variables](basic/variables.md)), so an address you
  are likely to `PEEK` or `POKE` also appears in decimal: `$C000` (49152).
- A 6502 address has four hexadecimal digits (`$FFE0`); a MIA RAM address
  has five (`$14000`).
- A range includes both ends: `$8000-$BFFF` is 16,384 bytes.
- KiB is 1,024 bytes.
- In syntax lines, `[ ]` marks an optional part, `...` a part that may
  repeat, and `|` separates alternative forms. Names in *italics* in the
  text, or plain lowercase words in a syntax line, stand for values you
  supply.
- A name in `CODE` that is not a BASIC keyword is the label that the kernel,
  BASIC, MIA's firmware or the SDK's include files use for that address or
  value.
- Machine-language examples are in the syntax of `ca65`, the assembler the SDK
  uses, and include the SDK's `clementina.inc` for the names of the kernel
  entries, the VIA and MIA's registers. `clementina.inc` is described in
  [Introduction to 65C02 machine language](ml/intro.md).

## What this book describes

Nothing in Clementina has been released yet. The book describes the machine
built from `main` of every Clementina repository at the commits listed in the
library's `manifest.json`. The board itself has not been built, so every
example in this book was run on the emulator (`clementina-6502`), and the
book makes no claim about timing on real hardware. Where a speed matters, it
says what it depends on.

The reference tables in the appendices and in some chapters are generated
from the SDK's specification files, which the SDK checks against MIA's
firmware and the ROM build. If a table and the prose ever disagree, the table
is right.
