# About this manual

This manual is for anyone who wants to use a Clementina: set it up, type
and run BASIC programs, draw on the screen, play music, read a gamepad and
keep their work on an SD card. You don't need to know how to program.
Chapter 5 starts from `PRINT`.

There are two ways to have a Clementina:

- **The Clementina board**: the real computer, a 65C02 with a Raspberry Pi
  Pico 2 W called MIA beside it.
- **The emulator**: a program that runs the same kernel and BASIC on your
  computer, with an emulated MIA.

Both show their screen in the same window, the **video client**, so after
chapter 2 everything in this manual works the same on either. Where they
differ, the text says so.

## How to read the examples

What you type is shown in a box, like this:

```basic
PRINT "HELLO"
```

Press RETURN (Enter on your computer's keyboard) at the end of each line.
Lines that start with a number are program lines: BASIC stores them, and
`RUN` runs them. Lines without a number run as soon as you press RETURN.

When the manual shows what Clementina prints, it shows it like this:

```text
HELLO

READY.
```

Keys are written in capitals: RETURN, ESC, HOME, and `Ctrl+C` for holding
Ctrl while pressing C. Numbers are decimal unless they start with `$`, which
marks a hexadecimal number (`$C000` is 49152). BASIC understands both.

Every example program in this manual was typed into the emulator and run
before the manual was published. The screenshots come from those runs.

## The other books

This manual teaches what a beginner needs. The other books in the
Clementina library go deeper:

- **Programmer's Reference Guide**: every BASIC keyword in full, 65C02
  machine language, and programming MIA directly.
- **Mapping Clementina**: every address in the 6502's memory and in MIA's
  RAM, and what lives there.
- **SDK & Studio Guide**: building programs and games on your computer with
  the Clementina SDK, drawing graphics and music in Clementina Studio, and
  the emulator as a development tool.
- **Hardware & MIA Technical Reference**: the board, its chips and
  connectors, building one, and how MIA works inside.

The manual describes the machine as built from `main` of every Clementina
repository on the date in the library's `manifest.json`.
