# Worked examples

Each section shows one technique in a complete SDK example. You can run an
example as written, then change it and compare the result. The projects
build with `clementina build` and pass `clementina check`.

| Technique | Example |
| --- | --- |
| [Calling assembly from BASIC](#calling-assembly-from-basic) | `catch-the-star` |
| [Making room for assembly with `memoryTop`](#making-room-for-assembly-with-memorytop) | `catch-the-star` |
| [Code in several banks](#code-in-several-banks) | `multi-bank` |
| [A sprite drawn in Studio, in BASIC](#a-sprite-drawn-in-studio-in-basic) | `sprite-from-studio` |
| [Assets, music and sound from assembly](#assets-music-and-sound-from-assembly) | `walker` |
| [Running faster with `target.phi2Hz`](#running-faster-with-targetphi2hz) | `cpu-speed` |

## Getting and running an example

The examples are linked below. Download the SDK's examples from
[GitHub](https://github.com/fran150/clementina-sdk), then open the example
folder you want to try. For Walker, open `examples/walker` in the download.

Build it, then start the emulator with its card and the video client, each
in its own terminal:

```sh
clementina build
clementina-emulator --sd build/sd
```

```sh
clementina-video-client
```

Click the video client's window and type `RUN "BOOT.BAS"`. Most examples
read held keys, which only the video client sends, so play them there and
not in the emulator's terminal.

Each example has a `README.md` that says what it does and which keys it
uses. To change an example's assets, open its `clementina.yaml` in Studio
(**File ▸ Open Project…**), save, and build again ([Making assets in
Studio](../projects/studio.md)).

## Calling assembly from BASIC

**Example:** [`examples/catch-the-star`](https://github.com/fran150/clementina-sdk/tree/main/examples/catch-the-star)

*Catch the Star* uses BASIC for the score, lives, star speed and game over.
An assembly routine moves the basket and stars each frame. [Your first
project](../start/first-basic.md) builds the game step by step; here the
focus is how the two parts call each other.

The manifest has both program parts. `program.entry` is the BASIC
program, and `build.assembly` the routine, with its `entrySymbol` as the
first byte at `loadAddress`:

```yaml
program:
  entry: src/main.cbas
build:
  outputDirectory: build
  basic:
    outputName: game
    memoryTop: $7000 # BASIC stays below the assembly code
  assembly:
    sources:
      - src/stars.s
    linkerConfig: link.cfg
    outputName: code
    loadAddress: $7000
    entrySymbol: play
```

The bootstrap loads the assembly with `BLOAD`, which doesn't run it, and
then runs the BASIC program. BASIC calls the routine with `SYS`, and the
routine's `RTS` returns to the statement after it:

```basic
200 REM PLAY UNTIL SOMETHING HAPPENS
210 IF PEEK($0283)=0 THEN POKE $0283,INT(RND(1)*40)+1
220 SYS $7000
230 C=PEEK($0281):M=PEEK($0282)
240 IF C+M=0 THEN 210
```

The two parts talk through a few bytes of memory both can reach. BASIC
writes them with `POKE` and reads them with `PEEK`; the routine names
them with constants:

```asm
BASKET     = $0280              ; the basket's left column
CAUGHT     = $0281              ; stars caught (play adds, BASIC clears)
MISSED     = $0282              ; stars missed (play adds, BASIC clears)
SPAWN      = $0283              ; column+1 of the next star, 0 for none
SPEED      = $0284              ; frames between star moves (BASIC)
```

`$0280-$02F7` is free for programs, and BASIC never touches it, so values
there survive `RUN` and `CLEAR`. The routine returns whenever BASIC has
something to decide (a star was caught or missed, or the new star has
started), and BASIC calls it again after it has decided.

A routine that returns to BASIC must leave BASIC whole:

- Its code lives where BASIC doesn't: here, above the top of memory that
  `memoryTop` lowered (next section).
- Its zero page is `$98-$DF`. `link.cfg` gives ld65 only that much:
  `ZP: start=$98, size=$48`.
- It leaves the stack as it found it, and returns with `RTS`.

The routine can call [the Clementina library](../building/runtime.md), as
any assembly can: `play` waits for each frame with `WaitTick` and reads the
arrows with `ReadPad`. [Code that returns to
BASIC](../building/assembly.md#code-that-returns-to-basic) has the rules in
full.

## Making room for assembly with `memoryTop`

**Example:** [`examples/catch-the-star`](https://github.com/fran150/clementina-sdk/tree/main/examples/catch-the-star)

BASIC keeps its program, variables and strings in one area that runs up to
its *top of memory*. Assembly that BASIC calls needs room BASIC won't
use, and `build.basic.memoryTop` makes it by lowering that top. *Catch the
Star* lowers it to `$7000` and links its code there, in `link.cfg`:

```text
MEMORY {
  ZP:  start=$98,   size=$48,   type=rw;
  RAM: start=$7000, size=$1000, type=rw, file=%O;
}
```

The bootstrap lowers the top first, before it loads anything:

```basic
10 REM MOVE BASIC MEMORY TOP
20 POKE $3F,$00:POKE $40,$70:CLEAR
30 MIALOAD "asset-palette.bin",$00100
40 BANK 0:BLOAD "CODE.PRG"
50 RUN "GAME.BAS"
```

Only a cold start resets the top, so it stays where line 20 put it through
`RUN "GAME.BAS"` and every `RUN` and `CLEAR` after it. `FRE(0)` reports
that much less free memory.

Choose `memoryTop` high enough to leave room for BASIC and low enough for
the assembly code. It must match `loadAddress` and the `RAM` start in
`link.cfg`. The code must end before `$8000`; code beyond that point goes
in a bank, as the next section shows.

The build writes `build/memory-layout.json`, a map of what each part
takes, and warns when two parts overlap. With `memoryTop` raised to `$7400`
and the code still at `$7000`:

```sh
clementina build
```

```text
Built the SD card in build/sd. Start it with RUN "BOOT.BAS".
/cpu: warning build.layout.overlap: CODE.PRG ($7000-$7529) overlaps BASIC ($1600-$73FF)
```

This warning means BASIC's strings or variables could grow over the code.
Lower `memoryTop` or move the assembly code before running the project.

## Code in several banks

**Example:** [`examples/multi-bank`](https://github.com/fran150/clementina-sdk/tree/main/examples/multi-bank)

The `$8000-$BFFF` window shows one 16 KiB bank of extended RAM at a time.
Code can use several banks if a routine outside that window switches them.
This example keeps one room's code in bank 1 and another's in bank 2. BASIC
asks for a room, and its code prints the room inside a frame.

The manifest lists the banks under `build.assembly.banks`, each with the
memory area of `link.cfg` that holds its code. The shared code, at `$7000`,
is the main image, and `memoryTop` keeps BASIC below it:

```yaml
build:
  outputDirectory: build
  basic:
    outputName: rooms
    memoryTop: $7000
  assembly:
    sources:
      - src/common.s
      - src/bank1.s
      - src/bank2.s
    linkerConfig: link.cfg
    outputName: code
    loadAddress: $7000
    entrySymbol: show_room
    banks:
      - bank: 1
        memory: BANK1
      - bank: 2
        memory: BANK2
```

In `link.cfg` each bank's area starts at `$8000`, writes a file of its own
and says its bank, which ca65's `.bank()` reads:

```text
MEMORY {
  ZP:    start = $98,   size = $48,   type = rw;
  MAIN:  start = $7000, size = $1000, type = rw, file = %O;
  BANK1: start = $8000, size = $4000, type = ro, file = "%O.bank1", bank = 1;
  BANK2: start = $8000, size = $4000, type = ro, file = "%O.bank2", bank = 2;
}
```

The build makes a PRG per bank, and the bootstrap loads each into its bank
before the shared code:

```basic
10 REM MOVE BASIC MEMORY TOP
20 POKE $3F,$00:POKE $40,$70:CLEAR
30 BANK 1:BLOAD "CODE.BANK1.PRG"
40 BANK 2:BLOAD "CODE.BANK2.PRG"
50 BANK 0:BLOAD "CODE.PRG"
60 RUN "ROOMS.BAS"
```

The BASIC program writes the room number at `$0280` and calls `show_room`
with `SYS $7000`. Shared code at `$7000` makes a *far call*: it maps the
room's bank, calls its routine, then restores the caller's bank.

The switch happens outside the banked window. If code inside the window
switched banks, its next instruction would come from the new bank. The
`FarCall` macro in `src/far.inc` supplies `.bank(routine)`, so the call
names only the routine:

```text
show_room:
        lda ROOM
        cmp #2
        beq @two
        FarCall room1           ; bank 1
        rts
@two:   FarCall room2           ; bank 2
        rts
```

Calls work between banks too. The frame both rooms draw is in bank 1, so
bank 1's room calls it with a plain `jsr frame`, and bank 2's room with
`FarCall frame`, which comes back to bank 2:

```text
.segment "BANK2"
room2:  FarCall frame           ; bank 1, then back to bank 2
        Print cave
        FarCall frame
        rts
```

Every call returns with bank 0 mapped, as BASIC needs. Run the example and
answer `2`:

```text
WHICH ROOM (1 OR 2, 0 ENDS)? 2
+--------------+
|   THE CAVE   |
+--------------+
```

[Code in several banks](../building/assembly.md#code-in-several-banks) has
the rules for `banks`, and [Banks](../building/loading.md#banks) how the
loader fills them. In VS Code, a store to `VIA_ORA` inside banked code is
marked with a warning, and the launch setting `stopOnBankSwitch` stops the
debugger on one ([Debugging in VS Code](../running/debugging.md)).

## A sprite drawn in Studio, in BASIC

**Example:** [`examples/sprite-from-studio`](https://github.com/fran150/clementina-sdk/tree/main/examples/sprite-from-studio)

A BASIC program can show graphics drawn in Studio without any assembly:
the build loads the palettes and tilesets before the program starts, and
BASIC's sprite statements do the rest. This example moves a 16×16 ship with
the arrow keys.

The ship uses four tiles drawn in Studio: 0 and 1 on top, 16 and 17 below.
The `Ship` composition keeps them together in the editor. The palette
config puts text colors in bank 0 and the ship's colors in bank 1.
`build.video` loads that config and the tileset:

```yaml
build:
  outputDirectory: build
  basic:
    outputName: ship
  video:
    paletteConfigId: palette-config:main
    tilesets:
      - {tilesetId: tileset:ship, bank: 2} # the sprites read CHR bank 2
```

The tileset goes in CHR bank 2 because banks 0 and 1 hold BASIC's font. The
bootstrap loads it there before it runs the program:

```basic
10 MIALOAD "asset-palette.bin",$00100
20 MIALOAD "asset-chr-2.bin",$03200
30 RUN "SHIP.BAS"
```

The program:

```basic
10 REM A SHIP DRAWN IN STUDIO, MOVED WITH THE ARROWS
20 CLS:CRSR 10,1:PRINT "ARROWS MOVE THE SHIP";
30 SPRBANK 2:SPRCOUNT 3:SPRON
40 X=152:Y=92:T=TICKS(0)
50 REM D IS HOW FAR TO MOVE: 1 PIXEL PER 10 MS SINCE THE LAST PASS
60 D=INT((TICKS(0)-T)/10):T=T+D*10
70 IF KEYDOWN(80) THEN X=X-D:IF X<0 THEN X=0
80 IF KEYDOWN(79) THEN X=X+D:IF X>304 THEN X=304
90 IF KEYDOWN(82) THEN Y=Y-D:IF Y<16 THEN Y=16
100 IF KEYDOWN(81) THEN Y=Y+D:IF Y>184 THEN Y=184
110 REM THE SHIP IS FOUR TILES: 0 AND 1 ON TOP, 16 AND 17 BELOW
120 SPRITE 0,0,X,Y,1,0:SPRITE 1,1,X+8,Y,1,0
130 SPRITE 2,16,X,Y+8,1,0:SPRITE 3,17,X+8,Y+8,1,0
140 GOTO 60
```

- `SPRBANK 2` points the sprites at the tileset, `SPRCOUNT 3` draws sprites
  0 to 3, and `SPRON` turns the sprite layer on.
- Each `SPRITE` places one tile, with palette bank 1, the ship's colors.
- `KEYDOWN` reads the arrows while they are held (79 to 82 are right, left,
  down and up).
- The ship moves by the time that has passed, not by the pass: `TICKS(0)`
  is MIA's millisecond clock, so the ship covers 100 pixels a second
  however long a pass of the loop takes.

To change the ship, open the project in Studio, edit the tiles or the
palette, save and build again; the program doesn't change. [Graphics in a
BASIC program](../building/basic.md#graphics-in-a-basic-program) and
[Before the program: `build.video`](../building/loading.md#before-the-program-buildvideo)
have the details.

## Assets, music and sound from assembly

**Example:** [`examples/walker`](https://github.com/fran150/clementina-sdk/tree/main/examples/walker)

*Walker* has a level, a walking player, background music and a jump sound,
all made in Studio. [The asset build](../building/asset-build.md) explains
how those files reach the card; [The Clementina
library](../building/runtime.md) shows the assembly that loads and uses
them.

Its assets are three palettes in one palette config (sky, ground and
player), one tileset, the level, the player's shape and idle animation, two
instruments, the song and the jump sound. `build.assets` names four slots
in MIA RAM and says which assets go on the card and where each one loads:

```yaml
  assets:
    slots:
      - {name: level,   mia: $14000, size: $1000}
      - {name: actors,  mia: $15000, size: $0400}
      - {name: effects, mia: $15400, size: $0400}
      - {name: music,   mia: $15800, size: $0800}
    include:
      - {kind: paletteConfig, id: palette-config:main, slot: palettes}
      - {kind: tileset, id: tileset:player, slot: chr2}
      - {kind: background, id: background:level1, slot: level}
      - {kind: sprites, id: tileset:player, slot: actors}
      - {kind: song, id: e4f5a6b7-c8d9-4e0f-9a1b-2c3d4e5f6a7b, slot: music}
      - {kind: sound, id: c2a9f1e0-1b2c-4d3e-8f40-516273849abc, slot: effects}
```

The build makes a file for each, and `assets.inc` with a label for each
(`SONG_THEME`, `SFX_JUMP`, …). The program loads them with the library and
plays the music:

```asm
        Load SONG_THEME
        Ok
        Load SFX_JUMP
        Ok
        ...
        PlaySong SONG_THEME
        Ok
```

Once started, the song plays on MIA's sequencer. It uses voices 0 and 1
(`SONG_THEME_VOICES` is `%0011`), leaving voice 3 for the jump sound. The
program advances that sound effect one frame per tick with `TickSound`:

```asm
SFX_VOICE = 3                   ; the song uses voices 0 and 1

loop:   WaitTick                ; once per 60 Hz tick
        TickAnimation player
        lda sfx_on
        beq pad
        TickSound #SFX_VOICE
        sta sfx_on
        ...
jump:   PlaySound SFX_JUMP, #SFX_VOICE
        lda #1
        sta sfx_on
```

Left and right walk, Space plays the jump sound, and Q stops the music.
[Walker](../building/runtime.md#walker) has the whole program and what to
notice in it, and [Sound](../building/runtime.md#sound) the sound
routines. [Instruments, songs and sound
effects](../projects/asset-model.md#instruments-songs-and-sound-effects)
describes the assets, and [Sounds](../projects/studio.md#sounds) and
[Music](../projects/studio.md#music) how to make them in Studio.

## Running faster with `target.phi2Hz`

**Example:** [`examples/cpu-speed`](https://github.com/fran150/clementina-sdk/tree/main/examples/cpu-speed)

The 6502 starts at 1.2 MHz. A program that needs more speed sets
`target.phi2Hz`, and the bootstrap sets the clock before it loads anything.
This example counts how many times a one-line loop runs in a second, at
4 MHz:

```yaml
target:
  machine: clementina-6502
  phi2Hz: 4000000 # 4 MHz instead of the board's 1.2 MHz
```

```basic
10 REM COUNT LOOP PASSES FOR ONE SECOND
20 PRINT "COUNTING FOR ONE SECOND..."
30 N=0:T=TICKS(0)+1000
40 N=N+1:IF TICKS(0)<T THEN 40
50 PRINT N;"PASSES A SECOND"
60 PRINT "PRESS A KEY TO COUNT AGAIN"
70 GET A$:GOTO 20
```

The bootstrap starts with the speed:

```basic
10 REM SET CPU SPEED
20 POKE $FFE2,$20:POKE $FFE3,$00:POKE $FFE2,$21:POKE $FFE3,$09
30 POKE $FFE2,$22:POKE $FFE3,$3D
40 RUN "SPEED.BAS"
```

To compare speeds, remove `phi2Hz` or set it to `1200000`, then build and
run again. The count drops.

The loop uses `TICKS(0)`, MIA's millisecond clock, to measure one second.
That clock, `TI`, sound and key repeat keep their pace when the CPU speed
changes. Use the clock for gameplay timing too; a faster CPU then gives
each frame more room for work without changing the game's pace.

The emulator runs at the project's speed when your computer can keep up
with it. `clementina check` runs the program as fast as it can instead, so
its count says nothing about the speed. [The project
folder](../projects/project-folder.md#target) has the field, and
[Performance](../running/performance.md) what each part of a program costs
in cycles.
