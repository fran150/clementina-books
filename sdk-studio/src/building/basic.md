# Programming in BASIC with the SDK

A BASIC project's source is a text file of numbered lines, edited on your
computer. The SDK compiles it into the same file Clementina's `SAVE` would
write, and the program runs exactly as if it had been typed in. This chapter
covers the source format, what the build does, how a BASIC program gets its
graphics, and the editor support. The language itself is in the
*Programmer's Reference Guide*.

## The source file

`program.entry` names one `.bas` file; a BASIC program is one file. The
rules are BASIC's own:

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

`build.basic.outputName` names the output: `game` makes
`build/game.bas`. The file is exactly what `SAVE` writes: the program's
lines from the start of BASIC's program area to the start of its variables,
with no header. It is not a PRG, and `BLOAD` can't read it; `LOAD` can.

Each stored line starts with a link to the next line. The build doesn't know
where BASIC's program area starts (it moves whenever the ROM changes), so it
writes placeholder links, and `LOAD` rebuilds them as it reads the file. The
file must therefore go through `LOAD` before it runs.

`clementina basic compile` does the same for any file, outside a project:

```text
$ clementina basic compile src/hello.bas build/HELLO.BAS
Compiled src/hello.bas to build/HELLO.BAS (22 bytes).
```

Copy the result to a card and `LOAD "HELLO.BAS"`. Never write the output
over the source: the compiled file is binary. On macOS and Windows, where
file names ignore case, `hello.bas` and `HELLO.BAS` in the same folder are
the same file, so keep them in different folders.

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

The other kinds of asset (backgrounds, overlays, shapes, animations, songs,
sound effects) reach the card only through the asset build, which needs an
assembly program, because the routines that use them are 6502 code. A BASIC
program draws its backgrounds and plays its music with BASIC statements, and
can load raw data it saved earlier with `NTLOAD`, `ATRLOAD`, `OAMLOAD`,
`PALLOAD`, `CHRLOAD` and `MIALOAD`. A project that mixes BASIC with the
asset runtime is what the reserved `mixed` kind is for.

## Editing BASIC in VS Code

The Clementina extension ([Installing](../start/installing.md#the-vs-code-extension))
recognizes `.bas` files as Clementina BASIC and runs the SDK's BASIC
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

Other editors can use the same server: it is `clementina-basic-lsp`, in the
SDK's `packages/basic-lsp`, and it speaks the Language Server Protocol over
standard input and output.

[Debugging in VS Code](../running/debugging.md) covers breakpoints and
stepping through BASIC lines.
