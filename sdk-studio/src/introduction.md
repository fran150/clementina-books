# About this book

The *Clementina SDK & Studio Guide* is for people who write games and
programs for Clementina on a modern computer. You write the program in a text
editor, draw the graphics and compose the music in Clementina Studio, and the
SDK turns all of it into files that Clementina loads from its SD card. You
test the result in the emulator, step through it in VS Code's debugger, and
copy it to a card for the real machine.

You need to know some Clementina BASIC or some 65C02 assembly language. The
*Programmer's Reference Guide* teaches both, and this book does not repeat
them. It teaches the tools: how a project is laid out, what each asset is,
what the build makes, and how to run, debug and test what it made.

## How the book is organized

- **Part I** installs the tools and takes one BASIC program and one assembly
  program from a template to the screen.
- **Part II** covers the project: the `clementina.yaml` manifest, the asset
  files, and Studio's editors that make them.
- **Part III** covers the build: how a program gets onto the machine, what
  the SDK does for a BASIC program and for an assembly program, and the
  asset runtime, the library of 6502 routines that loads and uses assets.
- **Part IV** covers running the result: the emulator, the debugger,
  automated checks and AI agents, performance, and testing on a real board.
- **The appendices** are reference: every CLI command, every field of every
  file format, the asset limits, the runtime routines on one page, the
  emulator automation protocol, and what to do when something goes wrong.

## The other books

| Book | Read it for |
| --- | --- |
| *Clementina User's Manual* | Setting up the machine and the video client; first steps in BASIC. |
| *Clementina Programmer's Reference Guide* | Every BASIC keyword; 65C02 machine language; programming MIA (index windows, commands, interrupts). |
| *Mapping Clementina* | What lives at each address of the 6502's 64 KiB and of MIA's 256 KiB, and who owns it. |
| *Clementina Hardware & MIA Technical Reference* | The board, the bus, the MIA firmware, and the video and input network protocols. |

This book links to *Mapping Clementina* whenever it names an address. The
links point at the book's source files in this repository, so they work when
you read the books on GitHub or from a checkout.

## Conventions

The book follows *Mapping Clementina*'s conventions:

- Addresses and values are hexadecimal, written with `$`, unless they are
  marked as decimal. A 6502 address has four hex digits (`$1800`); a MIA RAM
  address has five (`$14000`).
- A range includes both ends: `$8000-$BFFF` is 16,384 bytes.
- KiB is 1,024 bytes.

`clementina.yaml` is YAML, and YAML reads `0x14000` as a number, so the
examples write addresses in hex there too. The SDK itself writes them back in
decimal when it saves a manifest.

Commands you type in a terminal on your computer start with `$`, and what
they print follows without it:

```text
$ clementina project validate
Validation passed.
```

Commands typed on Clementina itself, in BASIC, are shown without a prompt.

## What this book describes

Nothing in Clementina is released yet: there are no tagged versions of the
SDK, Studio, the emulator or the video client, and no board has been built.
The book describes the tools as they are built from `main` of every
repository at the commits pinned in this repository's `manifest.json`, and
it says so where something only exists in the emulator so far.

Every command, project and program in this book was run against those
commits while it was written.
