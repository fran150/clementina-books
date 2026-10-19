# Saving your work: the SD card

Clementina keeps its files on a microSD card, formatted FAT32 like the
cards your camera or phone uses. Put the card in your computer and you see
the same files and folders, so you can copy programs on and off, edit
`WIFI.CFG`, or back everything up. In the emulator the SD card is a folder
on your computer (chapter 2).

## Saving and loading a program

```basic
NEW
10 PRINT "HELLO FROM THE SD CARD"
SAVE "HELLO.BAS"
```

`SAVE` writes the program in memory to a file. It stays in memory too. To
get it back later, even after switching off:

```basic
LOAD "HELLO.BAS"
RUN
```

`LOAD` replaces the program in memory and clears its variables, like `NEW`
followed by typing the program back in. If the file isn't there, BASIC
prints `?FILE I/O ERROR` and the program in memory is left as it was.

`SAVE` over an existing name replaces that file without asking.

## Seeing what's on the card

`DIR` lists the files in the current folder, one per line. A folder's name
ends with `/`:

```text
DIR
DEMO.BAS
GAMES/
HELLO.BAS
```

`DIR "GAMES"` lists another folder without going into it.

## Folders and paths

The card can hold folders inside folders, as on your computer. There is
always a **current folder**, where file names without a folder are looked
for. At power-on it is the top folder of the card.

| Statement | What it does |
| --- | --- |
| `MKDIR "GAMES"` | Make a folder. |
| `CD "GAMES"` | Go into a folder: it becomes the current folder. |
| `CD ".."` | Go up one folder. |
| `CD "/"` | Go back to the top folder. |
| `NAME "OLD.BAS" AS "NEW.BAS"` | Rename a file or folder, or move it to another folder. |
| `KILL "OLD.BAS"` | Delete a file, or an empty folder. |
| `RMDIR "GAMES"` | Delete an empty folder. |

A **path** names a file in another folder: `"GAMES/SNAKE.BAS"` is
`SNAKE.BAS` in the folder `GAMES` under the current folder, and
`"/GAMES/SNAKE.BAS"` starts from the top folder, wherever you are. Every
statement that takes a file name takes a path, so `LOAD "/GAMES/SNAKE.BAS"`
works from anywhere.

`KILL` and `SAVE` don't ask "are you sure?", and there is no undo. Keep a
copy of anything precious on your computer.

## Upper and lower case

On a real SD card, `"HELLO.BAS"` and `"hello.bas"` are the same file. In
the emulator on Linux they are not, because the card is a Linux folder: use
the exact case the file has on your computer, as `DIR` shows it.

## Changing cards

You can swap the card between commands, like a floppy disk. Close any file
a program has open first (the *Programmer's Reference Guide* covers files
that programs open). After a swap the current folder is the top folder
again.

## Machine-code programs

Some programs, often games, are machine code rather than BASIC. They come as
`.PRG` files, and `BRUN` loads and starts one:

```basic
BRUN "GAME.PRG"
```

A machine-code program can take over the whole machine; when it ends it
usually returns to `READY.`, and if it doesn't, RESET does. Some programs
load into extended memory and say which bank to use. The emulator's sample
card has one, a demo of colored bouncing balls with music, that loads into
bank 1:

```basic
BANK 1:BRUN "demo.prg"
```

`BLOAD` loads a machine-code file without starting it, and `BSAVE` saves
part of memory as one; both are for programmers, and the
*Programmer's Reference Guide* explains them along with files that programs
read and write byte by byte.
