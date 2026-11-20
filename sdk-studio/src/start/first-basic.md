# Your first project

This chapter makes a game: *Catch the Star*. Stars fall from the top of the
screen, you move a basket with the arrow keys, and every star you catch
scores a point. Three misses end the game, which keeps the high score and
lets you play again.

It starts with `clementina new`, which makes a small project that already
builds and runs, and then grows it into the game in three steps. You write
the code yourself. The finished game is in the SDK, in
[`examples/catch-the-star`](https://github.com/fran150/clementina-sdk/tree/main/examples/catch-the-star),
if you want to compare.

## Make the project

```sh
clementina new ~/games/catch --name "Catch the Star"
```

```text
Created /home/you/games/catch.
```

It writes a new folder and puts the name in the manifest. The folder holds:

```text
catch/
├── .vscode/settings.json
├── clementina.yaml
├── README.md
├── link.cfg
├── src/
│   ├── main.cbas
│   └── hello.s
├── assets/
│   ├── palettes/main.palette.json
│   └── palette-configs/main.palette-config.json
└── checks/
    └── smoke.json
```

## Build and run the starter

Building the assembly part needs cc65, which the installer sets up. From the
project folder:

```sh
cd ~/games/catch
clementina build
```

```text
Built the SD card in build/sd. Start it with RUN "BOOT.BAS".
```

Start the emulator with the card, then the video client, each in its own
terminal:

```sh
clementina-emulator --sd ~/games/catch/build/sd
```

```sh
clementina-video-client
```

The emulator's terminal shows its debugger; the video client's window shows
Clementina's screen, with BASIC's `READY.` prompt. Click the window so it
gets your keys, and type:

```basic
RUN "BOOT.BAS"
```

```text
HELLO FROM BASIC
HELLO FROM ASSEMBLY
PRESS A KEY
```

Press a key and the program says which one. Leave the emulator and video
client running. After each build below, type `RUN "BOOT.BAS"` again; the
emulator is already using the folder the build updates.

### What the build made

The build checks the manifest and assets, compiles the BASIC and assembly
sources, and puts the files Clementina needs in `build/sd`. That is the
folder you just mounted in the emulator. To run it on hardware, copy its
**contents** to an SD card. For this starter project, it contains:

| File | What it is |
| --- | --- |
| `BOOT.BAS` | The small BASIC program that loads the other files and starts the project. |
| `GAME.BAS` | Your BASIC source, compiled into the format Clementina runs. |
| `CODE.PRG` | The assembly routine, ready to load at `$7000`. |
| `asset-palette.bin` | The palette data for all sixteen banks. |

To see what happens when you type `RUN "BOOT.BAS"`, read its text version at
`build/boot.cbas`:

```basic
10 REM MOVE BASIC MEMORY TOP
20 POKE $3F,$00:POKE $40,$70:CLEAR
30 MIALOAD "asset-palette.bin",$00100
40 BANK 0:BLOAD "CODE.PRG"
50 RUN "GAME.BAS"
```

The loader makes room for the assembly routine by limiting BASIC's memory to
`$7000`. It then loads the palette, loads `CODE.PRG`, and runs `GAME.BAS`.
The build also keeps files for debugging in `build/`, including `code.map`,
`code.dbg` and `memory-layout.json`. Edit the source files, not the generated
ones: each build replaces them. [How a program reaches the
machine](../building/loading.md) explains the loader in more detail.

## Inside the starter

### The manifest

`clementina.yaml` names the project's source files and tells the SDK where to
put the result. This is the manifest the starter wrote:

```yaml
format: clementina-project
version: 1
name: Catch the Star
target:
  machine: clementina-6502
program:
  entry: src/main.cbas
assets:
  palettes:
    - assets/palettes/main.palette.json
  paletteConfigs:
    - assets/palette-configs/main.palette-config.json
  tilesets: []
  backgrounds: []
  overlays: []
  shapes: []
  animations: []
build:
  outputDirectory: build
  basic:
    outputName: game
    memoryTop: $7000 # BASIC stays below the assembly code
  assembly:
    sources:
      - src/hello.s
    linkerConfig: link.cfg
    outputName: code
    loadAddress: $7000
    entrySymbol: hello
  video:
    paletteConfigId: palette-config:main
```

- `program.entry` is the BASIC source. `build.basic.outputName` makes its
  compiled file `GAME.BAS`.
- `assets` lists the palette and palette config. The config assigns a palette
  to each of the sixteen banks; `build.video` loads it before the program.
- `build.assembly` names the assembly source, linker configuration and
  routine to call. The source exports `hello`. The linker puts it at `$7000`,
  the address `loadAddress` tells the SDK to expect.
- `memoryTop` keeps BASIC's program, variables and strings below that address.
  The SDK accepts `$7000`, `0x7000` or `28672` for it.

[The project folder](../projects/project-folder.md) explains every field.

### The program and the routine

`src/main.cbas` is ordinary Clementina BASIC, typed with line numbers:

```basic
10 CLS
20 PRINT "HELLO FROM BASIC"
30 SYS $7000
40 PRINT "PRESS A KEY"
50 GET K$
60 PRINT "YOU PRESSED ";K$
```

Line 30 calls the assembly routine at `$7000`. The starter puts that routine
in `src/hello.s`, written in 65C02 assembly for ca65:

```asm
; A routine the BASIC program calls with SYS $7000. It prints a line
; through the kernel and returns to BASIC with RTS.
.setcpu "65C02"
.include "clementina.inc"       ; names the kernel's routines, like KERN_CHROUT
.export hello

.code

hello:
  ldx #0
@next:
  lda message,x                 ; the next character, or 0 at the end
  beq @done
  jsr KERN_CHROUT               ; print it
  inx
  bra @next
@done:
  rts                           ; back to BASIC

message:
  .byte "HELLO FROM ASSEMBLY", 13, 0
```

`SYS` jumps to the address and comes back to BASIC at the routine's `RTS`.
`clementina.inc` comes with the SDK and names the kernel's routines, like
`KERN_CHROUT`, which prints one character. For more on this source, see
[Machine language](../../../programmers-reference/src/ml/intro.md) in the
*Programmer's Reference Guide* and the
[ca65 Users Guide](https://cc65.github.io/doc/ca65.html) for directives such
as `.include` and `.export`.

`link.cfg` tells ld65 where to put the code and its variables. It reserves
RAM from `$7000` for the routine and `$98-$DF` in zero page for its variables:

```text
MEMORY {
  ZP: start=$98, size=$48, type=rw;
  RAM: start=$7000, size=$1000, type=rw, file=%O;
}
SEGMENTS {
  ZEROPAGE: load=ZP, type=zp;
  CODE: load=RAM, type=ro;
  RODATA: load=RAM, type=ro;
  DATA: load=RAM, type=rw;
  BSS: load=RAM, type=bss, define=yes;
}
```

`MEMORY` names those two areas. `SEGMENTS` puts code and data into them.
`hello` is the first byte of `CODE`, at `$7000`, where the BASIC program calls
it. If you change that address, change both `RAM`'s start here and
`build.assembly.loadAddress` in the manifest. [The linker
configuration](../building/assembly.md#the-linker-configuration) explains the
other settings; the [ld65 Users Guide](https://cc65.github.io/doc/ld65.html)
covers the file format.

## The plan

The game uses the 40×25 text screen. The score line is on the top row, the
basket `[_]` moves along row 22, and row 23 is the ground. Stars are `*`.

The game has two parts:

- **Assembly runs the frames.** Sixty times a second it reads the arrows,
  moves the basket, and when it is time, moves every star down a row,
  checking the ones that reach the basket.
- **BASIC handles the rest**: the title screen, the score, the lives, how
  fast the stars fall, where each new star starts, game over and the high
  score.

The assembly routine returns to BASIC when a star is caught, missed or
started. They exchange the basket position and star counts through bytes at
`$0280`, an area free for programs. BASIC reads and writes those bytes with
`PEEK` and `POKE`:

| Address | What it holds |
| --- | --- |
| `$0280` | The basket's left column; BASIC sets the start, the routine moves it |
| `$0281` | Stars caught since BASIC last looked; the routine adds to it |
| `$0282` | Stars missed since BASIC last looked; the routine adds to it |
| `$0283` | The column of the next new star plus one, or 0 for none |
| `$0284` | Frames between two star moves; BASIC lowers it to speed up |
| `$0285`-`$028C` | Each star's column |
| `$028D`-`$0294` | Each star's row, or 0 for an unused slot |

## Step 1: the title and the playfield

Replace `src/main.cbas` with:

```basic
10 REM CATCH THE STAR
20 HS=0
30 CLS
40 CRSR 13,8:PRINT "CATCH THE STAR";
50 CRSR 6,11:PRINT "LEFT AND RIGHT ARROWS MOVE";
55 CRSR 11,12:PRINT "SHIFT MOVES FASTER";
60 CRSR 10,15:PRINT "PRESS SPACE TO START";
70 GOSUB 700
100 REM A NEW GAME
110 R=RND(-TICKS(0)):SC=0:LV=3
140 CLS
150 CRSR 0,23:PRINT "========================================";
160 GOSUB 500
200 GOTO 200
500 REM THE SCORE LINE
510 CRSR 0,0:PRINT "SCORE";SC;" LIVES";LV;" HIGH";HS;" ";
520 RETURN
700 REM WAIT FOR SPACE
710 KEYCLEAR
720 GET K$:IF K$<>" " THEN 720
730 RETURN
```

- `CRSR x,y` moves the cursor to column *x*, row *y*, so each `PRINT` lands
  where it should. The `;` at the end of each `PRINT` keeps the cursor on
  the line.
- Line 110 starts a game. `RND(-TICKS(0))` seeds the random numbers from the
  clock, so each game is different. `SC` is the score and `LV` the lives.
- The subroutine at 500 prints the score line.
- The subroutine at 700 waits for Space. `KEYCLEAR` throws away keys
  pressed earlier, and `GET` waits for the next one.
- Line 200 waits for now.

Build it and run it. The title waits for Space, then the playfield appears.
Press Ctrl-C in the video client to stop the program.

## Step 2: the game, in assembly

### Colors

Each text cell chooses a palette bank and draws with its color 1. The
starter uses bank 0 for white text on black; the other banks start black.
For a yellow star and a green basket, add two palettes. Write
`assets/palettes/star.palette.json`:

```json
{
  "format": "clementina-palette",
  "version": 1,
  "id": "palette:star",
  "name": "Star",
  "colors": [0, 65504, 0, 0, 0, 0, 0, 0]
}
```

and `assets/palettes/basket.palette.json`:

```json
{
  "format": "clementina-palette",
  "version": 1,
  "id": "palette:basket",
  "name": "Basket",
  "colors": [0, 2016, 0, 0, 0, 0, 0, 0]
}
```

The color numbers use RGB565: 65504 is yellow and 2016 is green. Assign the
new palettes to banks 1 and 2 in
`assets/palette-configs/main.palette-config.json`:

```json
{
  "format": "clementina-palette-config",
  "version": 1,
  "id": "palette-config:main",
  "name": "Main",
  "banks": ["palette:main", "palette:star", "palette:basket", null, null, null, null, null, null, null, null, null, null, null, null, null]
}
```

and list them in `clementina.yaml`:

```yaml
  palettes:
    - assets/palettes/main.palette.json
    - assets/palettes/star.palette.json
    - assets/palettes/basket.palette.json
```

### The routine

Delete `src/hello.s` and write `src/stars.s`. The `play` loop waits for each
frame, moves the basket when an arrow is held, and advances the stars at
the speed BASIC set. The helper routines below it move and draw the stars
and basket.

```asm
; The real-time part of Catch the Star. The BASIC program calls play with
; SYS $7000. It runs the game 60 frames a second: it moves the basket while
; an arrow is held and moves the stars down at the speed BASIC sets. It
; returns to BASIC when a star is caught or missed, or when it has used the
; new star BASIC gave it. It shares the bytes below with BASIC, which reads
; and writes them with PEEK and POKE.
.setcpu "65C02"
.include "clementina-lib.inc"   ; WaitTick, ReadPad and KeyHeld
.include "clementina.inc"       ; KERN_PLOT and KERN_CHROUT_GLYPH
.export play

STARS        = 8                ; how many stars can fall at once
TOP_ROW      = 2                ; a new star starts on this row
BASKET_ROW   = 22               ; the row the basket moves along
SLOW_TICKS   = 6                ; frames per basket step: 10 columns a second
FAST_TICKS   = 2                ; with Shift held: 30 columns a second
LEFT_SHIFT   = 225              ; the keyboard codes of the Shift keys
RIGHT_SHIFT  = 229
SPAWN_MOVES  = 6                ; star moves between new stars
STAR_COLOR   = 1                ; palette bank 1, the star palette: yellow
BASKET_COLOR = 2                ; palette bank 2, the basket palette: green
TEXT_ATTR    = $0302            ; the kernel's pen for new characters

BASKET     = $0280              ; the basket's left column
CAUGHT     = $0281              ; stars caught (play adds, BASIC clears)
MISSED     = $0282              ; stars missed (play adds, BASIC clears)
SPAWN      = $0283              ; column+1 of the next star, 0 for none
SPEED      = $0284              ; frames between star moves (BASIC)
STAR_COL   = $0285              ; each star's column
STAR_ROW   = $028D              ; each star's row, 0 when unused

.data                           ; these start at 0 when the code loads
slot:        .byte 0            ; the star being moved
ticks:       .byte 0            ; frames since the last WaitTick
star_wait:   .byte 0            ; frames until the stars move
basket_wait: .byte 0            ; frames until the basket may move
spawn_wait:  .byte 0            ; star moves until a new star may start

.code

; SYS $7000: play until something happens.
play:
  jsr draw_basket
@frame:
  WaitTick                      ; wait for the next 60 Hz frame
  sta ticks                     ; A = frames since the last one

  lda basket_wait               ; the basket
  sec
  sbc ticks
  bcs :+
  lda #0
: sta basket_wait
  bne @stars
  ReadPad #0                    ; the keyboard's arrows, or gamepad 0
  bit #CL_PAD_LEFT
  beq @right
  lda BASKET
  beq @stars                    ; already at the left edge
  dec BASKET
  bra @moved
@right:
  bit #CL_PAD_RIGHT
  beq @stars
  lda BASKET
  cmp #37
  beq @stars                    ; already at the right edge
  inc BASKET
@moved:
  jsr draw_basket
  lda #SLOW_TICKS               ; wait before the next step
  sta basket_wait
  KeyHeld #LEFT_SHIFT           ; less with Shift held
  bne @fast
  KeyHeld #RIGHT_SHIFT
  beq @stars
@fast:
  lda #FAST_TICKS
  sta basket_wait

@stars:
  lda star_wait                 ; the stars
  sec
  sbc ticks
  bcc @move
  beq @move
  sta star_wait
  bra @frame
@move:
  lda SPEED
  sta star_wait
  jsr move_stars
  lda CAUGHT                    ; anything for BASIC?
  ora MISSED
  bne @done
  lda spawn_wait                ; time for a new star?
  beq :+
  dec spawn_wait
  bra @again
:
  lda SPAWN
  beq @again                    ; BASIC hasn't chosen a column yet
  jsr start_star
  lda #SPAWN_MOVES
  sta spawn_wait
@done:
  rts                           ; back to BASIC
@again:
  jmp @frame                    ; too far for a branch

; Move every star down one row, and count the ones that reach the basket
; row as caught or missed.
move_stars:
  ldx #STARS-1
@each:
  stx slot
  lda STAR_ROW,x
  beq @next                     ; this slot has no star
  lda #' '                      ; erase it where it was
  jsr draw_star
  ldx slot
  inc STAR_ROW,x
  lda STAR_ROW,x
  cmp #BASKET_ROW
  bne @show
  stz STAR_ROW,x                ; it reached the basket row: judge it
  lda STAR_COL,x
  sec
  sbc BASKET                    ; 0, 1 or 2 when it is over the basket
  cmp #3
  bcs @miss
  inc CAUGHT
  bra @next
@miss:
  inc MISSED
  bra @next
@show:
  lda #'*'                      ; draw it one row lower
  jsr draw_star
@next:
  ldx slot
  dex
  bpl @each
  rts

; Start the star SPAWN asks for in a free slot, and clear SPAWN.
start_star:
  ldx #STARS-1
@find:
  lda STAR_ROW,x
  beq @free
  dex
  bpl @find
  bra @clear                    ; every slot is in use: skip it
@free:
  stx slot
  lda SPAWN
  dec a
  sta STAR_COL,x
  lda #TOP_ROW
  sta STAR_ROW,x
  lda #'*'
  jsr draw_star
@clear:
  stz SPAWN
  rts

; Draw the character in A, in yellow, at the column and row of star `slot`.
draw_star:
  pha
  lda #STAR_COLOR
  sta TEXT_ATTR
  ldx slot
  ldy STAR_COL,x                ; KERN_PLOT: Y = column
  lda STAR_ROW,x
  tax                           ;            X = row
  clc                           ;            C = 0 moves the cursor
  jsr KERN_PLOT
  pla
  jmp KERN_CHROUT_GLYPH         ; draw A there

; Draw the basket in green at BASKET, with a space on each side to erase
; where it was before it moved one column.
draw_basket:
  ldx #0                        ; which character of " [_] "
@cell:
  txa
  clc
  adc BASKET
  dec a                         ; its column: BASKET - 1 + X
  cmp #40
  bcs @skip                     ; off the screen (-1 is 255)
  tay                           ; KERN_PLOT: Y = column
  phx
  ldx #BASKET_ROW               ;            X = row
  clc
  jsr KERN_PLOT
  lda #BASKET_COLOR
  sta TEXT_ATTR
  plx
  lda basket,x
  jsr KERN_CHROUT_GLYPH
@skip:
  inx
  cpx #5
  bne @cell
  rts

basket:
  .byte " [_] "
```

`play` runs once per frame. `WaitTick` waits for MIA's next 60 Hz tick and
reports how many ticks passed. `ReadPad #0` reads the keyboard arrows or
gamepad 0. These routines come from [the Clementina
library](../building/runtime.md); `clementina-lib.inc` names them.

Three counters control the pace:

| Counter | What it controls |
| --- | --- |
| `basket_wait` | How soon the basket can move again: 6 frames normally, or 2 with Shift held. |
| `star_wait` | When the stars move down, using the speed BASIC set in `SPEED`. |
| `spawn_wait` | How many star moves must pass before another star can start. |

`KeyHeld` reads the Shift keys. The loop subtracts the elapsed ticks from
its counters, so a slow frame does not throw off the timing. After moving
the stars, `play` returns to BASIC if one was caught or missed, or if it
started the next star BASIC chose. Otherwise it waits for another frame.

`move_stars` goes through the eight star slots. For each star it draws a
space where the star was, moves it a row down and draws it again. A star
that reaches the basket row is judged instead: if its column is one of the
basket's three, it is caught, otherwise missed.

To draw, `KERN_PLOT` places the cursor using the row in X and column in Y;
`KERN_CHROUT_GLYPH` puts a character there. `TEXT_ATTR` picks palette bank 1
for stars and 2 for the basket. `draw_basket` draws `" [_] "`; the spaces
erase its previous position as it moves.

The routine's variables are in the `DATA` segment and start at 0 when
`BOOT.BAS` loads the code. `play` ends with `RTS`, so BASIC continues after
the `SYS`.

In `clementina.yaml`, point `build.assembly` at the new source and its
routine:

```yaml
  assembly:
    sources:
      - src/stars.s
    linkerConfig: link.cfg
    outputName: code
    loadAddress: $7000
    entrySymbol: play
```

### Calling it from BASIC

Replace line 200 and add the lines that call `play`:

```basic
120 FOR I=$0280 TO $0294:POKE I,0:NEXT
130 POKE $0280,18:POKE $0284,24
200 REM PLAY UNTIL SOMETHING HAPPENS
210 IF PEEK($0283)=0 THEN POKE $0283,INT(RND(1)*40)+1
220 SYS $7000
230 C=PEEK($0281):M=PEEK($0282)
240 IF C+M=0 THEN 210
250 POKE $0281,0:POKE $0282,0
260 SC=SC+C:LV=LV-M
280 GOSUB 500
290 IF LV>0 THEN 210
400 END
```

- Lines 120 and 130 clear the shared bytes, put the basket in the middle,
  and set the stars to move down every 24 frames.
- Line 210 chooses where the next star starts, if `play` used the last one.
  `INT(RND(1)*40)` is a column from 0 to 39, and the `+1` keeps 0 meaning
  "none".
- Line 220 calls `play`. Lines 230-260 read its catch and miss counts, clear
  them, and update the score and lives. If `play` returned only because it
  started a star, line 240 calls it again.
- Line 400 ends the program when the lives run out, for now.

Build it and run it. Hold the arrows and the basket slides from one edge to
the other. Stars fall, the score goes up when you catch one, and the lives
go down when you miss.

## Step 3: game over and faster stars

Replace line 400 and add the rest:

```basic
270 IF C>0 AND SC/10=INT(SC/10) AND PEEK($0284)>6 THEN POKE $0284,PEEK($0284)-3
400 REM GAME OVER
410 IF SC>HS THEN HS=SC
420 GOSUB 500
430 CRSR 15,10:PRINT "GAME OVER";
440 CRSR 7,12:PRINT "PRESS SPACE TO PLAY AGAIN";
450 GOSUB 700
460 GOTO 100
```

Line 270 shortens the wait between star moves after every ten catches, down
to 6 frames. Lines 400-460 show game over and start a new game when you
press Space. `HS` keeps the high score because line 20 sets it to 0 only
once, before the first game.

If you want to compare your finished program, see
[`src/main.cbas`](https://github.com/fran150/clementina-sdk/blob/main/examples/catch-the-star/src/main.cbas)
in the SDK example.

## Check it automatically

`clementina check` runs a project in the headless emulator and compares what
it sees with the files in `checks/`. The starter's `checks/smoke.json` looks
for its old text, so replace it with one for the game:

```json
{
  "settleCycles": 3000000,
  "beforeText": "PRESS SPACE TO START",
  "input": " ",
  "afterText": "SCORE 0  LIVES 3  HIGH 0"
}
```

It waits `settleCycles` cycles, looks for `beforeText` on the screen, types
`input` (a Space, which starts a game), waits again and looks for
`afterText`. Add `checks/code.json` to check the basket's starting column in
memory after the input:

```json
{
  "format": "clementina-code-check",
  "version": 1,
  "settleCycles": 3000000,
  "memory": [{"address": 640, "bytes": [18], "phase": "after"}]
}
```

The address is decimal here because JSON uses decimal numbers: `640` is
`$0280`, the basket position in the table above. The expected byte is `18`.

```sh
clementina check
```

```text
Checks passed for /home/you/games/catch.
CPU: PC=$090B, cycles=7006147
Screen:
               CATCH THE STAR
        LEFT AND RIGHT ARROWS MOVE
             SHIFT MOVES FASTER
            PRESS SPACE TO START
After input:
  SCORE 0  LIVES 3  HIGH 0
       *
                    *
                    [_]
  ========================================
Report: /home/you/games/catch/build/inspection/report.json
```

The CPU line and star positions can change between runs. If the expected
text or basket position is wrong, the check fails. Run it after a change to
see whether the game still starts. [Automation and AI
agents](../running/automation.md) covers more checks.

## Change it

Try giving a life back every 25 catches, making stars worth more as they
speed up, or changing `SLOW_TICKS`, `FAST_TICKS` and `SPAWN_MOVES` to adjust
the difficulty. Edit the source, build, and type `RUN "BOOT.BAS"` again.

A program can be BASIC and assembly, as here, BASIC only, or assembly only.
The [next chapter](first-assembly.md) builds one that is all assembly.
