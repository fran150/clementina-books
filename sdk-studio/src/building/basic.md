# Programming in BASIC with the SDK

A project's BASIC program is a text file of numbered lines. The SDK compiles
it into the same format Clementina's `SAVE` writes, so it runs as though you
typed it on the machine.

This chapter covers source files, build output, graphics and editor support.
For the language itself, use the *Programmer's Reference Guide*.

## The source file

`program.entry` names one `.cbas` source file. The `.BAS` extension is for
tokenized files that `SAVE` writes and `LOAD` reads. The source follows
BASIC's rules:

- Every line starts with a line number, 0 to 63999.
- A line is at most 80 characters, line number included.
- Only printable ASCII (7-bit) characters.
- Lines may come in any order: the build stores them sorted. A repeated
  number replaces the earlier line, and a number with nothing after it
  deletes that line, as when you type them.

The build turns the text into tokens the way Clementina's BASIC does when
you press Return, and it follows the same rules, including the surprising
ones:

- Letters become uppercase, except inside quotes and after `DATA` and `REM`.
- `?` becomes `PRINT`.
- Keywords are found anywhere, with no word boundary: in `MONEY` the `ON` is
  the keyword `ON`, as it is on the machine. Avoid variable names that
  contain keywords.
- Spaces after the line number are dropped; other spaces are kept.

Styled strings (text with per-character colors, typed on Clementina with the
pen statements) can't be written in a text file, which has no colors. A
program builds them at run time instead.

## What the build makes

`build.basic.outputName` names the compiled file: `game` makes `GAME.BAS`
in `build/sd`. The optional `build.basic.memoryTop` leaves room for assembly
above BASIC ([Code that returns to
BASIC](assembly.md#code-that-returns-to-basic)).

The `.BAS` file contains the program's lines, with no PRG header. Clementina
reads it with `LOAD` or `RUN "GAME.BAS"`.

Each stored line links to the next. The compiled file has placeholder links;
`LOAD` rebuilds them for the machine's current BASIC program area. Load the
file before running it.

`clementina basic compile` does the same for any file, outside a project:

```sh
clementina basic compile src/hello.cbas build/HELLO.BAS
```

```text
Compiled src/hello.cbas to build/HELLO.BAS (22 bytes).
```

Copy the result to a card and `LOAD "HELLO.BAS"`. The `.cbas` source and
the tokenized `.BAS` file have different names, so the compiled file never
replaces the source, even on macOS and Windows, where file names ignore case.

## Graphics in a BASIC program

The build loads a palette config and tilesets for a BASIC program before it
starts (`build.video`, in [How a program reaches the
machine](loading.md#before-the-program-buildvideo)). From there, BASIC's
own statements do the rest: `SPRBANK`, `SPRITE` and its relatives for
sprites, `BGBANK`, `BGCHAR`, `BGMODE` and `SCROLL` for the background,
`TRACK` for music.

This project puts the player tileset in CHR bank 2 and moves a sprite with
`A` and `D`:

```yaml
build:
  outputDirectory: build
  basic:
    outputName: game
  video:
    paletteConfigId: palette-config:main
    tilesets:
      - {tilesetId: tileset:player, bank: 2}
```

```basic
10 REM MOVE A SPRITE WITH A AND D
20 SPRBANK 2:SPRCOUNT 0:SPRON
30 X=160
40 SPRITE 0,0,X,100,0,0
50 GET A$
60 IF A$="A" THEN X=X-4
70 IF A$="D" THEN X=X+4
80 GOTO 40
```

`SPRBANK 2` points the sprites at the tileset, `SPRCOUNT 0` makes the
renderer scan only sprite 0, and `SPRITE` sets sprite 0's tile, position,
palette and flags.

Backgrounds, overlays, shapes, animations, songs and sound effects reach the
card through the asset build. That build needs assembly because the library
routines that use those assets are 6502 code.

A BASIC program can draw backgrounds and play music with BASIC statements.
It can also load raw data with `NTLOAD`, `ATRLOAD`, `OAMLOAD`, `PALLOAD`,
`CHRLOAD` and `MIALOAD`. To call assembly built in the same project, use
`SYS` ([Code that returns to BASIC](assembly.md#code-that-returns-to-basic)).

## Editing BASIC in VS Code

The Clementina extension ([Installing](../start/installing.md#the-vs-code-extension))
recognizes `.cbas` files as Clementina BASIC and runs the SDK's BASIC
language server. It knows the ROM's exact keyword tables, so what it reports
is what the machine would do:

- **Errors as you type**, for the whole file at once: bad line numbers,
  lines too long, a program too big for memory, a `GOTO` or `GOSUB` to a
  line that doesn't exist, a function called with the wrong number of
  arguments.
- **Hover** on a keyword shows its syntax, a one-line summary and the
  token's bytes.
- **Completion** of keywords (statements where a statement goes, functions
  in expressions) and of variables the file already uses.
- **Signature help** while typing a statement's or function's arguments.
- **Go to definition** on a line number after `GOTO`, `GOSUB`, `THEN`,
  `RUN` or `ON ... GOTO`.
- **Rename** a variable, or a line number and every static reference to it.
- **Format** the document into `LIST` style: lines sorted, keywords in
  uppercase.
- **Clementina BASIC: Renumber Program…**, from the command palette, asks
  for a start and a step, renumbers every line and updates every static
  `GOTO`, `GOSUB` and `THEN` target. A target that doesn't exist is left
  alone, so its error stays visible.

[Debugging in VS Code](../running/debugging.md) covers breakpoints and
stepping through BASIC lines.
