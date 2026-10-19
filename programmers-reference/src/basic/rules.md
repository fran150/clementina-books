# Programming rules

Clementina BASIC is Microsoft BASIC for the 6502, the same family as the
Commodore 64's BASIC V2, extended with about 110 statements and functions for
Clementina's video, sound, input, files and MIA memory. Anyone who has
programmed a Commodore or an Apple II in BASIC will find the core familiar.
This chapter covers the rules that hold for every program.

## The READY prompt

After power-on the screen shows:

```text
**** CLEMENTINA V1.0 BASIC V2 ****
(C) 2026 PACHISOFT, 1977 MICROSOFT
 23647 BYTES FREE
COPYRIGHT 1977 BY MICROSOFT CO.
READY.
```

`READY.` means BASIC is waiting for a line. What you type is either a
**direct command**, which runs as soon as you press RETURN, or a **program
line**, which starts with a line number and is stored for later.

```basic
PRINT 2+2
```

prints ` 4` at once. A line that starts with a number is stored instead:

```basic
10 PRINT "HELLO"
20 GOTO 10
```

and runs when you type `RUN`. Press Ctrl-C to stop it: BASIC prints
`BREAK IN  10` (or the line it was on) and `READY.`.

## Program lines

- **Line numbers** run from 0 to 63999. BASIC keeps the lines in number
  order whatever order you type them in, so it is usual to number in tens and
  leave room to insert lines later.
- **Typing a line with an existing number replaces it.** Typing the number
  alone deletes the line.
- **Several statements fit on one line**, separated by colons:
  `10 A=1:B=2:PRINT A+B`.
- **A line is at most 80 characters**, two screen rows, including the line
  number. The screen editor hands BASIC at most two rows: if you type on
  into a third row, BASIC gets only the last two, which usually ends in
  `?SYNTAX ERROR`.
- `LIST` shows the program, `RUN` runs it, `NEW` erases it. `SAVE` and `LOAD`
  keep it on the SD card (see [Files and the SD card](files.md)).

Some statements work only in a program: `INPUT`, `GET` and `DEF` give
`?ILLEGAL DIRECT ERROR` when typed as a direct command.

## The screen editor

The screen is the editor, as on the Commodore 64. The cursor can go anywhere
on the screen with the arrow keys, and pressing RETURN hands BASIC the whole
line under the cursor, whatever is typed on it. To change a program line,
`LIST` it, move the cursor up onto it, edit it in place and press RETURN.

| Key | Code | Action |
| --- | --- | --- |
| Arrows | `$11` `$91` `$1D` `$9D` | Move the cursor down, up, right, left. |
| Home | `$13` | Move the cursor to the top-left corner. |
| Backspace | `$08` | Delete the character to the left of the cursor and close the gap. |
| Delete | `$7F` | Delete the character under the cursor and close the gap. |
| Insert | `$94` | Open a space at the cursor. |
| RETURN | `$0D` | Hand the line under the cursor to BASIC. |
| Esc | `$1B` | Start an editor command: color, reverse, flip, glyph set (see [Styled strings](styled-strings.md)). |
| Ctrl-C | `$03` | Stop a running program. |

A line that runs past column 39 continues on the next row, and the editor
remembers that the two rows are one **logical line**: RETURN on either row
hands BASIC both. The keys reach Clementina from the video client's keyboard
over Wi-Fi or from a terminal on MIA's USB console; both send the same codes
(see [Input](input.md)).

## Keywords, case and spaces

BASIC turns each keyword into a one- or two-byte **token** when it stores a
line, which saves memory and time. Some consequences:

- **Case does not matter.** Outside quoted strings, `REM` and `DATA`, BASIC
  converts letters to uppercase as it stores the line, so `print`, `Print` and
  `PRINT` are the same keyword and `a` is the same variable as `A`. Inside
  quotes, lowercase stays lowercase and prints as lowercase.
- **Spaces are optional.** `FORI=1TO10` works. Spaces you type are kept in
  the listing, except right after the line number.
- **Keywords are found anywhere.** BASIC looks for keywords inside names too,
  so a variable cannot contain one: `FORT` is read as `FOR T`, and `SCORE`
  contains `OR`. Keep variable names short (see
  [Numbers, strings and variables](variables.md)).
- **`?` is short for `PRINT`.** `?A` lists as `PRINT A`. There are no other
  abbreviations.

The full list of keywords and their token values is in
[Appendix A](../appendix/keywords.md).

## Running, stopping and continuing

- `RUN` clears all variables and starts from the first line; `RUN 100` starts
  at line 100. `GOTO 100` in direct mode starts at line 100 without clearing
  variables.
- `END` ends the program quietly. `STOP` ends it with `BREAK IN` and the line
  number, as Ctrl-C does.
- `CONT` continues a program stopped by `STOP`, Ctrl-C or an empty `INPUT`
  line, from where it stopped. Variables can be inspected and changed with
  direct commands in between. Editing the program, an error, `CLEAR`, `NEW`
  or `RUN` makes continuing impossible (`?CAN'T CONTINUE ERROR`).
- An error stops the program with a message such as
  `?SYNTAX ERROR IN 20`. The messages are listed in
  [Error messages](errors.md).

Stopping a program for any reason, an error included, also stops background
music started with `TRACK` and `BAND`.

## Where the program lives

The kernel, WozMon and BASIC itself are loaded into RAM from `$0400` up at
power-on. BASIC's **workspace** follows them and runs to `$BFFF`: about
23 KiB that hold the program, its variables, its arrays and its strings, in
that order from the bottom, with strings growing down from the top.
[Numbers, strings and variables](variables.md) explains how the space is
shared; *Mapping Clementina*'s
[BASIC's workspace](../../../mapping/src/cpu/basic-workspace.md) has the
exact addresses.

The upper 16 KiB of the workspace, `$8000-$BFFF`, is bank 0 of Clementina's
extended RAM. BASIC needs bank 0 there at all times. Statements that work
with the other 31 banks (`BANK`, `PEEK`, `POKE`, `SYS`, `BLOAD`, `BSAVE`,
`BRUN`) switch them in only for as long as they need them, see
[Extended RAM and banking](../ml/banking.md).
