# Files and the SD card

MIA has an SD card slot. The card holds an ordinary FAT file system, with
directories, so the same card can be read and written on any computer. In
the emulator, a folder on the host computer plays the part of the card.

Names are the usual FAT names; this book writes them in capitals because the
keyboard does. A path can name directories, separated by `/`. A path that
starts with `/` starts at the card's root; any other path starts at the
**current directory**, which `CD` changes. A path is always a string
expression, so it can be built: `"LEVEL"+MID$(STR$(N),2)+".BAS"` gives
`LEVEL5.BAS` when *N* is 5 (`MID$` drops the space `STR$` puts before a
positive number).

Every file error, from a missing file to a full card, gives
`?FILE I/O ERROR`.

## Programs

| Statement | Effect |
| --- | --- |
| `SAVE path` | Save the program in memory. |
| `LOAD path` | Replace the program in memory with a saved one. |

```basic
10 PRINT "HELLO"
SAVE "HELLO.BAS"
NEW
LOAD "HELLO.BAS"
LIST
```

```text
 10 PRINT "HELLO"
```

`LOAD` clears all variables, like `NEW`, and ends at `READY.`, even when a
running program calls it: a program can load another, but the user has to
type `RUN`. A `LOAD` that fails, because the file does not exist, leaves the
current program alone.

A program file holds the program exactly as BASIC stores it in memory, styles
included, with no header ([Appendix H](../appendix/formats.md)). The
`.BAS` ending is a convention, not a rule.

## Directories

| Statement | Effect |
| --- | --- |
| `DIR` | List the current directory: one name a line, directories with a `/` after the name. |
| `DIR path` | List another directory. |
| `CD path` | Change the current directory. `CD "/"` goes back to the root, `CD ".."` up one level. |
| `MKDIR path` | Make a directory. Its parent must exist. |
| `RMDIR path` | Remove an empty directory. |
| `KILL path` | Delete a file or an empty directory. |
| `NAME old AS new` | Rename a file or directory, or move it to another directory. |
| `FSTAT path,s,a,d,t` | Read a file's size, attributes, date and time into four variables. |
| `DISKFREE(0)` | The free bytes on the card. |

```basic
MKDIR "GAMES"
CD "GAMES"
SAVE "HELLO.BAS"
CD "/"
DIR "GAMES"
```

```text
HELLO.BAS
```

`FSTAT` puts the size in bytes in *s* (0 for a directory) and the FAT
attributes in *a*: read-only 1, hidden 2, system 4, directory 16, archive 32,
added. *d* is the date packed as `(year-1980)*512 + month*32 + day` and *t*
the time as `hour*2048 + minute*32 + second/2`. Use floating-point variables
for them; a date does not fit an integer variable. The current directory
stays until the next `CD`, also after the program ends. If the card is
swapped, it goes back to the root.

## Data files

A program reads and writes its own files one **byte** at a time. Clementina
BASIC has no `PRINT#` or `INPUT#`: text is written as character codes.

| Statement or function | Effect |
| --- | --- |
| `OPEN path FOR mode AS #n` | Open a file as file number *n*, 1-16. |
| `CLOSE #n` | Close it, writing anything still waiting. |
| `BPUT#n,value` | Write one byte, 0-255. |
| `BGET#n,variable` | Read one byte into a numeric variable. |
| `EOF(n)` | 1 once the position has reached the end of the file, else 0. |
| `SEEK#n,position` | Move to a byte position; the first byte is 0. |
| `FPOS(n)`, `FSIZE(n)` | The current position and the file's size. |
| `FLUSH #n` | Write everything waiting to the card, without closing. |

`BGET#`, `BPUT#` and `SEEK#` are written with the `#` directly after the
word, with no space; the other statements put a space before `#`.

The modes:

| Mode | Opens for | The file |
| --- | --- | --- |
| `INPUT` | Reading. | Must exist. |
| `OUTPUT` | Writing. | Created, or emptied if it exists. |
| `APPEND` | Writing at the end. | Created if it does not exist. |
| `UPDATE` | Reading and writing, from the start. | Created if it does not exist; not emptied. |

A file number that is already open gives `?FILE I/O ERROR`. `LOAD` and `SAVE`
use file number 16 themselves, so a program that loads or saves should leave
it closed.

This program writes a string to a file, then reads it back:

```basic
10 A$="HIGH SCORE 12500"
20 OPEN "SCORE.TXT" FOR OUTPUT AS #1
30 FOR I=1 TO LEN(A$): BPUT#1,ASC(MID$(A$,I,1)): NEXT
40 CLOSE #1
50 B$="": OPEN "SCORE.TXT" FOR INPUT AS #1
60 IF EOF(1) THEN 80
70 BGET#1,C: B$=B$+CHR$(C): GOTO 60
80 CLOSE #1: PRINT B$;" (";LEN(B$);"BYTES )"
```

```text
HIGH SCORE 12500 ( 16 BYTES )
```

Note the order in lines 60-70: test `EOF` first, then read. `EOF` turns to 1
as soon as the last byte has been read, so a loop that reads first and tests
afterwards loses the last byte. A `BGET#` past the end gives 0 and no error.

Numbers larger than 255 are written as several bytes, low byte first:

```basic
10 OPEN "BEST.DAT" FOR UPDATE AS #1
20 S=12500: BPUT#1,S AND 255: BPUT#1,INT(S/256)
30 SEEK#1,0: BGET#1,L: BGET#1,H
40 PRINT L+H*256;FSIZE(1)
50 CLOSE #1
```

```text
 12500  2
```

Several files can be open at once, each with its own position, so a program
can copy from one to another.

## Machine code and binary files

`BLOAD`, `BSAVE` and `BRUN` move bytes between the card and the 6502's
memory. Their files are in **PRG** format, the Commodore 64's: two bytes of
load address, low byte first, then the data.

| Statement | Effect |
| --- | --- |
| `BSAVE path,address,length` | Save *length* bytes from *address*. |
| `BLOAD path` | Load the file at the address in its header. |
| `BLOAD path,address` | Load it at *address* instead. |
| `BRUN path` | Load the file and jump to its first byte. BASIC does not come back. |
| `BRUN path,address` | Load it and jump to *address*. |
| `SYS address` | Call machine code at *address*; BASIC continues when it returns. |
| `BANK n` | Choose which of the 32 RAM banks the statements above, `PEEK` and `POKE` use at `$8000-$BFFF`. |

```basic
10 FOR I=0 TO 15: POKE 640+I,I*2: NEXT
20 BSAVE "TABLE.PRG",640,16
30 FOR I=0 TO 15: POKE 640+I,0: NEXT
40 BLOAD "TABLE.PRG"
50 PRINT PEEK(640+15)
```

```text
 30
```

Loading never checks what is already at the address: a file loaded over
BASIC's own memory wrecks the program in memory or BASIC itself. Only the
addresses from `$C000` up, where there is no RAM, are refused. Where machine
code can safely go, how `BANK` works and how `SYS` passes values are the
subject of [Mixing BASIC and machine language](../ml/mixing.md).

## MIA's memory and the card

`MIALOAD path,address` loads a whole file into MIA's memory, and
`MIASAVE path,address,length` saves part of it. MIA does the whole transfer
itself, so it is fast however big the file. The graphics `LOAD` and `SAVE`
statements in [Graphics](graphics.md) are the same thing with the address
worked out for you. [MIA memory](mia-memory.md) shows how to use part of a
file.

## Swapping cards

The card can be changed between statements, like a disk. The next file
statement finds the new card. Files that were open on the old card are lost:
their numbers give `?FILE I/O ERROR` until they are closed. Close files that
were written before taking the card out, or their last bytes are lost.
