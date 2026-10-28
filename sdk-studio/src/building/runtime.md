# The asset runtime

The runtime is a library of 6502 routines that load the asset build's files
and use them: load a level, draw it, show a sprite, run an animation, play a
song. It gives you primitives and nothing more. It has no scenes, no level
loader and no main loop; the game decides what happens and when.

This chapter walks through *Walker*, the game from the previous chapter,
then covers each group of routines. Appendix D lists them all.

## Calling a routine

Every routine has a macro of the same name in `runtime.inc`, which
`assets.inc` includes. The macro puts the arguments where the routine wants
them and calls it:

```asm
        DrawScreen BG_LEVEL1, #0, #0, #0
```

- **The asset** is named by its descriptor's label (`BG_LEVEL1`). The macro
  passes its address in A and X.
- **Other arguments** follow ca65's usual form: `#expr` is a value, anything
  else is the memory that holds it. `MoveAnimation player, px, #150` takes
  the X position from the two bytes at `px` and the Y position 150.
- **The result** is in the carry flag. Carry clear means it worked. Carry set
  means it failed, and `rt_error` says why:

| `rt_error` | Name | Meaning |
| ---: | --- | --- |
| 1 | `RT_ERR_NOT_LOADED` | The asset or item isn't loaded. |
| 2 | `RT_ERR_LOCATION` | A location is invalid, or of the wrong kind. |
| 3 | `RT_ERR_FILE` | The SD card reported an error, or the file is short. |
| 4 | `RT_ERR_RANGE` | Coordinates or a size fall outside the asset. |
| 5 | `RT_ERR_MISSING` | A shape an animation uses isn't loaded. |
| 6 | `RT_ERR_ARGUMENT` | An argument is out of range. |

With `checks: false` the runtime skips most of these checks: smaller and
faster, but a mistake draws garbage instead of failing.

The routines pass their arguments in a 42-byte block of zero page
(`rt_a0` to `rt_a11` and scratch bytes), and use MIA's index descriptors
`$40` and `$41`, both index windows, `CFG_SELECT` and the command registers.
They leave all of these changed. A game that drives MIA itself as well uses
other descriptors, and sets up its windows again after a runtime call.

Before sending a command to MIA, each routine waits for MIA's previous
command and any copy still running. A routine that starts a copy returns
without waiting for it.

## Walker

Walker loads its assets, draws the level, starts the player's animation and
the music, and then loops once per 60 Hz tick: it advances the animation,
plays the jump sound if one is running, and reads the controls. Left and
right walk (A and D, the arrow keys or a gamepad), A jumps (Space, Z or the
gamepad's A button; only the sound), Q stops the music.

```asm
; Walker: a level, a walking player, background music and a jump sound.
; Left and right walk, A jumps (just the sound), Q stops the music.
.setcpu "65C02"
.include "clementina.inc"
.include "assets.inc"
.import __BSS_RUN__, __BSS_SIZE__
.export game_start

SFX_VOICE = 3                   ; the song uses voices 0 and 1

; After a runtime call: carry set means it failed, and rt_error says why.
.macro Ok
        bcc :+
        jmp fail
:
.endmacro

.segment "ZEROPAGE"
ptr:        .res 2

.segment "BSS"
player:     .res RT_ANIM_SIZE
px:         .res 2
held:       .res 1              ; the controls held on the last tick
sfx_on:     .res 1

.segment "CODE"
game_start:
        cld
        jsr clear_bss

        Load PAL_MAIN
        Ok
        Load CHR_PLAYER
        Ok
        Load BG_LEVEL1
        Ok
        DrawScreen BG_LEVEL1, #0, #0, #0
        Ok
        LoadSprites SPR_PLAYER
        Ok
        Load SONG_THEME
        Ok
        Load SFX_JUMP
        Ok

        SetChrBanks #2, #2, #2, #2, #2
        SetViewport #0, #0
        SetScroll #0, #0
        SetLayers #%101

        lda #<160
        sta px
        stz px+1
        StartAnimation player, SPR_PLAYER, #ANIM_PLAYER_IDLE, #0, px, #150
        Ok
        PlaySong SONG_THEME
        Ok

loop:   WaitTick                ; once per 60 Hz tick
        TickAnimation player
        lda sfx_on
        beq pad
        TickSound #SFX_VOICE
        sta sfx_on
pad:    ReadPad #0              ; gamepad 0 and the keyboard
        tay                     ; Y = held now
        eor held                ; the controls that changed...
        sty held
        and held                ; ...and are held now: just pressed
        and #RT_PAD_A
        bne jump
        tya
        and #RT_PAD_LEFT
        bne left
        tya
        and #RT_PAD_RIGHT
        bne right
        KeyHeld #$14            ; Q
        beq loop
        StopSong SONG_THEME
        bra loop

left:   lda px
        bne :+
        dec px+1
:       dec px
        bra move
right:  inc px
        bne move
        inc px+1
move:   MoveAnimation player, px, #150
        bra loop

jump:   PlaySound SFX_JUMP, #SFX_VOICE
        lda #1
        sta sfx_on
        jmp loop                ; too far for bra

fail:   lda rt_error
        jsr KERN_PRBYTE
:       bra :-

clear_bss:
        lda #<__BSS_RUN__
        sta ptr
        lda #>__BSS_RUN__
        sta ptr+1
        ldy #0
        ldx #<__BSS_SIZE__      ; small BSS: under 256 bytes
:       lda #0
        sta (ptr),y
        iny
        dex
        bne :-
        rts
```

What to notice:

- **The `Ok` macro.** A routine's failure is in the carry, so every call is
  followed by a check. `bcs fail` would be shorter, but a branch reaches only
  127 bytes, and the macros expand to many bytes; `Ok` jumps instead. On
  failure Walker prints `rt_error` in hex and stops.
- **Loading to built-in slots.** `PAL_MAIN`'s default slot is `palettes` and
  `CHR_PLAYER`'s is `chr2`, so loading them puts the colors and the tiles
  where the hardware reads them. Nothing more is needed.
- **Loading, then drawing.** `BG_LEVEL1` loads into the `level` slot in MIA
  RAM. That doesn't show it: `DrawScreen` copies its 40×25 cells into
  background table 0.
- **Setting up the video.** All five layers' CHR banks point at bank 2,
  `SetViewport` picks the 40×25 plane and table set 0, and `SetLayers`
  turns on the background (bit 0) and sprites (bit 2), but not the overlay
  (bit 1), which still holds the console's text.
- **Timing from MIA's clock.** `WaitTick` waits for MIA's 60 Hz count to
  move on, so the animation and the sound advance 60 times a second whatever
  the CPU's speed: the speed Studio previews them at.
- **Held controls.** `ReadPad #0` reads gamepad 0 and the keyboard as one
  set of bits. Walking tests what is held, so the player walks for as long as
  the key is down. Jumping tests what was just pressed, held now but not on
  the last tick (`held`), so holding Space jumps once. `KeyHeld #$14` reads
  Q, which isn't one of the pad's keys.
- **Sound effects on a free voice.** `SONG_THEME_VOICES` is `%0011`: the
  song uses voices 0 and 1. The jump plays on voice 3.

Its memory report shows how full each slot is:

| Slot | Used | Size |
| --- | ---: | ---: |
| `palettes` | 256 | 256 |
| `chr2` | 6,144 | 6,144 |
| `level` | 2,000 | 4,096 |
| `actors` | 15 | 1,024 |
| `effects` | 38 | 1,024 |
| `music` | 90 | 2,048 |

## Loading

| Macro | Does |
| --- | --- |
| `Load asset[, location]` | Loads the whole file, to its default slot or to the location given, and waits. |
| `LoadStart asset[, location]` | Starts a load and returns at once. |
| `LoadBusy` | A = 0 once the load started by `LoadStart` is done. |
| `LoadWait` | Waits for it, then reports its result and updates the descriptor. |
| `LoadPart asset, offset, length, location` | Copies raw bytes from the file. The descriptor doesn't change. |
| `Relocate asset, location` | Moves a loaded asset to another place. |
| `Forget asset` | Marks it not loaded. Nothing is erased. |

A location is three bytes: a MIA address such as `#$20000`, or a bank and
an address built with `RT_BANK_LOC`, such as `#RT_BANK_LOC(3, $8000)`.
The `SLOT_` constants are locations too.

**Streaming.** A load into MIA RAM is MIA's own work: the SD card's data
goes straight into MIA RAM, and the CPU is free. `LoadStart` lets the game
keep playing while it runs:

```asm
        LoadStart BG_LEVEL2
        Ok
wait:   jsr play_one_tick       ; the game goes on
        LoadBusy
        bne wait
        LoadWait
        Ok
```

Only one load runs at a time. A load into a CPU bank passes every byte
through the CPU, so `LoadStart` finishes it before returning.

**Copying between MIA and the CPU.** `Relocate` copies an asset from where
it is to a new location and updates its descriptor. From a bank into MIA
RAM it costs about 26 cycles a byte; it is how a song kept in a bank gets
into MIA RAM before `PlaySong`.

## Palettes and tilesets

| Macro | Does |
| --- | --- |
| `UsePalettes config` | Copies all 16 banks of a loaded palette config into palette RAM. |
| `UsePaletteBank config, bank[, target]` | Copies one bank, into the same bank or into `target`. |
| `UseTileset tileset, chrBank` | Copies a loaded tileset into a CHR bank (unless it's already there) and sets the bank's 1 bpp flag to match. |

Loading straight into `palettes` or a `chrN` slot needs none of these. They
are for assets kept elsewhere: several palette configs in MIA RAM to switch
between levels, or a tileset kept in a bank and swapped into a CHR bank
when needed. A palette fade copies banks one at a time.

## Backgrounds

The background has eight tables of 40×25 cells, each a tile and an
attribute byte. The plane (`BGMODE`) arranges some of them into a larger
area, and the scroll position places the 320×200 screen in it. A map is
usually larger than a table; the draw routines copy part of it into a
table.

| Macro | Does |
| --- | --- |
| `DrawScreen bg, col, row, table` | Copies 40×25 cells from (col, row) of the map to a table. |
| `DrawRect bg, col, row, width, height, table, tcol, trow` | Copies a rectangle to (tcol, trow) of a table. |
| `DrawRow bg, col, row, count, table, tcol, trow` | One row of cells: the new edge when scrolling up or down. |
| `DrawColumn bg, col, row, count, table, tcol, trow` | One column: the new edge when scrolling sideways. |
| `GetCell bg, col, row` | Reads a cell of the loaded map: A = tile, X = attribute. |
| `SetCell bg, col, row, tile, attr` | Changes a cell of the loaded map. Draw it to show it. |

Map coordinates are 16-bit, so maps can be large. From MIA RAM, each draw
costs about 4,400 cycles whatever its size, because MIA's DMA does the
copying. From a CPU bank, the CPU copies each byte: a whole screen takes
about 78,000 cycles. `GetCell` and `SetCell` are the way to keep game state
in the map (a collected coin, an opened door).

### Maps bigger than their slot

A large map needn't be loaded whole. Three routines load part of it from the
card:

| Macro | Loads |
| --- | --- |
| `LoadRect bg, col, row, width, height[, location]` | A rectangle of the map. |
| `LoadRows bg, row, count[, location]` | Whole rows. |
| `LoadColumns bg, col, count[, location]` | Whole columns. |

The part loaded becomes the *window* the draw routines read, and its place
in the map is recorded in the descriptor. A draw that asks for cells outside
the window fails with `RT_ERR_RANGE`. A scrolling game loads the window
ahead of the screen as it moves, and draws each new edge with `DrawRow` or
`DrawColumn`.

## The overlay

| Macro | Does |
| --- | --- |
| `ShowOverlay overlay` | Copies a loaded overlay into the overlay's tables. |
| `FillPlaceholder overlay, placeholder, tiles` | Writes tile numbers into a placeholder of the shown overlay. |

`FillPlaceholder` takes `width × height` tile numbers from CPU memory, row
by row, and leaves the attributes as designed. A score is a placeholder:
the game turns the number into digit tiles in a small buffer and fills the
placeholder with it. The placeholder's number is its `OVL_` constant
(`OVL_HUD_SCORE`), and its size is `OVL_HUD_SCORE_WIDTH` by
`OVL_HUD_SCORE_HEIGHT`.

Showing the overlay replaces the console's text. Turn the overlay layer on
with `SetLayers` bit 1.

## Sprites

A sprite file holds a tileset's shapes and then its animations, each called
an *item*. The descriptor keeps a location per item, so items can be loaded
one at a time and to different places.

| Macro | Does |
| --- | --- |
| `LoadSprites file[, location]` | Loads the whole file; every item is then loaded. |
| `LoadShape file, shape[, location]` | One shape. |
| `LoadAnimation file, anim[, location]` | One animation's frame list. |
| `LoadAnimationShapes file, anim` | The shapes a loaded animation uses that aren't loaded yet. |
| `ForgetShape file, shape` | Marks a shape not loaded. |
| `DrawShape file, shape, sprite, x, y[, flips]` | Writes a shape's sprites into sprite records from `sprite` on. |

Without a location, an item loads where it would be if the whole file were
in its slot, so separate partial loads never overlap. Load a level's
enemies, then forget them and load the next level's.

`DrawShape` places the shape's origin at (x, y); flips bit 0 mirrors it
left to right, bit 1 top to bottom. It returns in A the next free sprite
record, so shapes can be drawn one after the other:

```asm
        DrawShape SPR_PLAYER, #SHAPE_PLAYER_IDLE, #0, px, #150
        sta next_sprite
        DrawShape SPR_PLAYER, #SHAPE_PLAYER_IDLE, next_sprite, #40, #40, #1
```

### Animations

An animation needs somewhere to keep its state: which frame shows, how many
ticks are left, where it is. That is an *instance*, 12 bytes the game
reserves (`.res RT_ANIM_SIZE`). Several instances can play the same
animation: three enemies walking out of step.

| Macro | Does |
| --- | --- |
| `StartAnimation inst, file, anim, sprite, x, y` | Shows frame 0 from sprite record `sprite` on. |
| `TickAnimation inst` | One tick. A has `RT_TICK_FRAME` (1) set when a new frame shows, and `RT_TICK_WRAP` (2) when it went back to frame 0. |
| `MoveAnimation inst, x, y` | Moves it. |
| `StopAnimation inst` | Hides its sprites. |

Call `TickAnimation` once per tick, 60 times a second to match Studio's
preview. A tick that doesn't change the frame costs about 50 cycles; one
that does redraws the frame's sprites.

If a frame's shape isn't loaded, the frame is skipped and `rt_error` reports
`RT_ERR_MISSING`. Nothing is drawn from the wrong memory.

### All sprites

| Macro | Does |
| --- | --- |
| `HideSprites first, count` | Hides `count` sprite records (0 means 256). |
| `SetSpriteCount count` | The renderer scans records 0 to `count` - 1 (0 means 256). |

`DrawShape` and the animations raise the sprite count when they reach past
it, but never lower it. Fewer records to scan means less work for MIA.

## Sound

MIA has four voices. A song plays on MIA's sequencer, which reads its tracks
from MIA RAM and needs nothing from the CPU once started. A sound effect is
played by the CPU, one frame per tick.

| Macro | Does |
| --- | --- |
| `PlaySong song` | Starts the song's voices from the top. The song must be in MIA RAM. |
| `StopSong song` | Stops and silences its voices. |
| `SongPosition voice` | A/X = the voice's note index, Y = its sequencer status. |
| `PlaySound sound, voice` | Takes the voice from the sequencer and plays the sound's first frame. |
| `TickSound voice` | Plays the next frame. A = 0 once the sound is over; the voice then goes back to the sequencer. |
| `StopSound voice` | Stops it now. |

A song leaves the voices it doesn't use alone, and the `_VOICES` constant
says which those are. Play sound effects on the others. `PlaySound` takes
its voice away from the sequencer for as long as the sound lasts, and gives
it back after the last frame.

## Video settings

| Macro | Does |
| --- | --- |
| `SetLayers mask` | Bit 0 the background, bit 1 the overlay, bit 2 the sprites. |
| `SetChrBanks bg, bgAlt, overlay, overlayAlt, sprites` | The CHR bank (0-7) each layer reads. |
| `SetScroll x, y` | The screen's top-left pixel in the background plane. |
| `SetViewport mode, set` | The background plane (0-5, as `BGMODE`) and table set (0-1). |

*Mapping Clementina*'s [Video](../../../mapping/src/mia/video.md) chapter
has the tables, the planes and the registers behind them.

## Timing and input

| Macro | Does |
| --- | --- |
| `WaitTick` | Waits for MIA's 60 Hz count to move on. A = the ticks since the last `WaitTick`, normally 1; the first returns at once. |
| `ReadPad player` | A = the controls held on gamepad `player` (0-3), a bit each. Player 0 adds the keyboard. |
| `KeyHeld usage` | A = nonzero while that key is held. |

`WaitTick` reads the count with MIA's `CLOCK_SNAPSHOT` command, so it keeps
time at any CPU speed. A count above 1 means the loop took longer than a
tick. It remembers the last tick in BSS, so call it from one place.

`ReadPad`'s bits, and the keys that set them for player 0:

| Bit | Constant | Gamepad | Keyboard |
| ---: | --- | --- | --- |
| `$01` | `RT_PAD_UP` | d-pad or left stick up | W, up arrow |
| `$02` | `RT_PAD_DOWN` | d-pad or left stick down | S, down arrow |
| `$04` | `RT_PAD_LEFT` | d-pad or left stick left | A, left arrow |
| `$08` | `RT_PAD_RIGHT` | d-pad or left stick right | D, right arrow |
| `$10` | `RT_PAD_A` | A (Cross) | Z, Space |
| `$20` | `RT_PAD_B` | B (Circle) | X |
| `$40` | `RT_PAD_SELECT` | Select (Back) | Tab |
| `$80` | `RT_PAD_START` | Start (Menu) | Enter |

A gamepad that isn't connected reads as 0. The other buttons, the right
stick and the analog values aren't in the bits. The keyboard's keys are the
runtime's choice; for any other key, `KeyHeld` takes its USB HID usage:
`$04`-`$1D` A to Z, `$28` Enter, `$2C` Space, `$4F`-`$52` the right, left,
down and up arrows. *Mapping Clementina*'s [Input
state](../../../mapping/src/mia/input.md) chapter has the key bitmap and
the gamepad records behind them.

Both read what is held now, not typed text: `KERN_GETKEY_NB` still returns
the characters typed, and neither affects the other.

## Interrupts

The simplest pattern is the one Walker uses: everything in the main loop,
paced by MIA's clock with `WaitTick`. A game may instead use an interrupt to
keep time, and have the handler only count ticks while the main loop does
the work.

A handler may also call the runtime's drawing, animation, sound and copy
routines, if it protects what the main loop was in the middle of:

1. Save the registers.
2. Write `MIA_CTX_PUSH` to `MIA_CTX`, to save MIA's registers.
3. `RuntimeSave`, which pushes the runtime's 42 zero-page bytes.
4. Make the runtime calls.
5. `RuntimeRestore`, which waits for the handler's last MIA command and
   pulls the bytes back.
6. Write `MIA_CTX_POP` to `MIA_CTX`.
7. Restore the registers.

Saving and restoring cost about 1,100 cycles together. **Loads are never
safe in a handler**: MIA runs one SD job at a time, and its state lives in
MIA RAM. And if the main loop and the handler both touch the same animation
or voice, keeping them apart is the game's job.

Taking over the IRQ vector and chaining to the kernel's handler are in
*Mapping Clementina*, [Taking over the
IRQ](../../../mapping/src/cpu/jump-table.md#taking-over-the-irq).

## What each call costs

[Performance](../running/performance.md) lists the measured cost of every
routine. The figures to remember: about 4,400 cycles to draw from MIA RAM,
about 3,000 plus 300 per sprite for a new animation frame, and about 26
cycles per byte for anything the CPU copies. At the default 1.2 MHz and
25 frames a second, a frame has 48,000 cycles.
