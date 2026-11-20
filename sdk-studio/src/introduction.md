# About this book

The *Clementina SDK & Studio Guide* is for people who write games and
programs for Clementina on a modern computer. Write code in a text editor,
and make graphics and music in Clementina Studio. The SDK builds the files
Clementina loads from an SD card.

You can run the result in the emulator, debug it in VS Code, and copy it to
a card for the real machine.

You need to know some Clementina BASIC or 65C02 assembly language. The
*Programmer's Reference Guide* teaches both. Here you will learn how to
organize a project, make assets, build a program, and run, debug and test it.

## How the book is organized

- **Part I** installs the tools and takes a first project, a BASIC program
  with an assembly routine, and then a program that is all assembly, to the
  screen.
- **Part II** covers the project: the `clementina.yaml` manifest, the asset
  files, and Studio's editors that make them.
- **Part III** covers the build: how a program gets onto the machine, what
  the SDK does for BASIC code and for assembly, and the
  Clementina library, the SDK's 6502 routines for assembly programs.
- **Part IV** covers running the result: the emulator, the debugger,
  automated checks and AI agents, performance, and testing on a real board.
- **Part V** shows techniques in small, complete projects from the SDK's
  examples: BASIC calling assembly, making room for it, graphics from
  Studio in BASIC, assets and sound from assembly, and a faster CPU.
- **The appendices** are reference: every CLI command, every field of every
  file format, the asset limits, the library routines on one page, the
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

In `clementina.yaml`, addresses can use `$14000` or `0x14000`. The examples
use hex. When the SDK saves the manifest, it preserves the address spelling
you used.

Terminal commands are shown without a shell prompt. Their output appears in
a separate block:

```sh
clementina project validate
```

```text
Validation passed.
```

Commands typed on Clementina itself, in BASIC, are shown without a prompt.

## What this book describes

The book describes the released SDK, Studio, emulator and video client at
the versions recorded in this repository's `manifest.json`.

Every command, project and program in this book was run against those
versions while it was written.
