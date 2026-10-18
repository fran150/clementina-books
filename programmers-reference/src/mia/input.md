# Input

Clementina has no keyboard connector. Keys, the mouse and gamepads reach MIA
from the video client over Wi-Fi, or from a terminal on MIA's USB console, and
MIA keeps their state in its RAM for the 6502 to read. A program can read input
two ways, as BASIC can ([Input](../basic/input.md)):

- as **text**: the characters typed, one at a time, in a queue. This is what
  `GET`, `INPUT` and the kernel's `GETKEY` read.
- as **state**: which keys and buttons are held right now, where the mouse
  is, how far each stick is pushed. This is what games read.

## The input registers

Three registers are only for input:

| Address | Name | Holds |
| --- | --- | --- |
| `$FFF2` | `INPUT_STATUS` | A summary: text waiting, something held, which source is active. |
| `$FFF3` | `INPUT_CHAR` | The next character typed. Reading it takes it from the queue. |
| `$FFF4` | `INPUT_CHAR_COUNT` | How many characters are waiting. |

`INPUT_STATUS`:

| Bit | Name | Set when |
| --- | --- | --- |
| 0 | `INPUT_TEXT_READY` | At least one character is waiting. |
| 1 | `INPUT_KEYBOARD_DOWN` | A key is held. |
| 2 | `INPUT_CONSUMER_DOWN` | A media key is held. |
| 3 | `INPUT_MOUSE_DOWN` | A mouse button is held. |
| 4 | `INPUT_GAMEPAD_DOWN` | A gamepad button or direction is held. |
| 5 | `INPUT_SOURCE_CONSOLE` | Input comes from the USB console. |
| 6 | `INPUT_SOURCE_WIFI` | Input comes from Wi-Fi. |

## Text

The queue holds 64 characters; when it is full, a new one pushes out the
oldest. The characters are the ones in [Appendix E](../appendix/charset-keys.md),
the same codes `CHROUT` prints. Reading `INPUT_CHAR` when the queue is empty
gives 0.

```asm
        lda INPUT_STATUS
        and #INPUT_TEXT_READY
        beq none                ; nothing typed
        lda INPUT_CHAR          ; A = the character
```

That is exactly what `KERN_GETKEY_NB` does, so most programs call it
instead ([The kernel](../ml/kernel.md)).

### Key repeat

A held key repeats in the text queue, not in the state: MIA puts the
character in the queue again after a delay, then at an interval. Three
commands set it up, with parameter 3 zero:

| Command | Parameters | Sets |
| --- | --- | --- |
| `$52` `MIA_CMD_INPUT_REPEAT_DELAY` | delay in ms, low and high | The wait before the first repeat. 0 turns repeat off. |
| `$53` `MIA_CMD_INPUT_REPEAT_INTERVAL` | interval in ms, low and high | The time between repeats. |
| `$54` `MIA_CMD_INPUT_REPEAT_KEY` | key's HID code, 1 or 0 | Whether that key repeats. |

After reset the delay is 400 ms, the interval 60 ms, and only Backspace,
Delete and the arrows repeat. These are BASIC's `KEYREPEAT` and `KEYRPT`.

## Held keys

MIA keeps a **bitmap** of the keyboard: 32 bytes, one bit for each of 256 key
codes, set while the key is held. The codes are the USB **HID** codes in
[Appendix E](../appendix/charset-keys.md), the ones BASIC's `KEYDOWN` takes:
they name keys, not characters, so the `A` key is 4 whether Shift is held or
not. Key *n* is bit *n* AND 7 of byte *n* / 8: the `A` key, 4, is bit 4 of
byte 0. A second bitmap of 32 bytes covers the **consumer** keys: volume,
play, and other media keys.

| Index | `mia.inc` name | Covers |
| --- | --- | --- |
| `$61` | `MIA_INPUT_INDEX_KEYBOARD_BITMAP` | The keyboard bitmap, `$11000-$1101F`. |
| `$62` | `MIA_INPUT_INDEX_CONSUMER_BITMAP` | The consumer bitmap, `$11020-$1103F`. |
| `$50-$57` | `MIA_INPUT_INDEX_KEYBOARD_PROBE_0` + *n* | One byte of the keyboard bitmap. |
| `$58-$5F` | `MIA_INPUT_INDEX_CONSUMER_PROBE_0` + *n* | One byte of the consumer bitmap. |

A game that reads a few keys uses **probes**: eight one-byte indexes that do
not step, so every read gives the same bitmap byte, fresh. Command `$51`,
`MIA_CMD_INPUT_SET_PROBE`, points one: parameter 1 is the probe, `$00-$07` for
the keyboard and `$08-$0F` for consumer keys, and parameter 2 the bitmap byte.
All probes start on byte 0.

This routine points keyboard probe 1 at byte 10 of the bitmap, which holds
keys 80-87, and then reads it: bit 0 is Left (80), bit 1 Down (81), bit 2 Up
(82), and bit 7 Right (79) is in byte 9, so it is not here. It stores the
byte in `$98` for BASIC to look at:

<!-- example: org=$0280 prg=ARROWS.PRG hold=80,82 run="BLOAD \"ARROWS.PRG\"|SYS 640: PRINT PEEK(152)" -->
```asm
.include "clementina.inc"

        lda #$01                ; keyboard probe 1
        sta CMD_PARAM1
        lda #80/8               ; bitmap byte 10
        sta CMD_PARAM2
        stz CMD_PARAM3
        lda #MIA_CMD_INPUT_SET_PROBE
        sta CMD_TRIGGER
wait:   lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne wait

        lda #MIA_INPUT_INDEX_KEYBOARD_PROBE_0+1
        sta IDXA_SELECT
        lda IDXA_PORT           ; bit 0 Left, bit 1 Down, bit 2 Up
        sta $98
        rts
```

```text
 5
```

Left and Up are held, bits 0 and 2. Once the probe is pointed, each check is
two instructions: `LDA IDXA_PORT` and `AND` with the key's bit, as long as the
probe stays selected.

A program that reads many keys, or wants to know when a key goes down rather
than whether it is down, reads all 32 bytes of the bitmap through `$61` into
its own RAM, and compares each copy with the last one:

```text
pressed  = now AND NOT before
released = before AND NOT now
```

Neither the kernel nor BASIC moves the probes, so a program can point them
once at the start.

## The mouse

Index `$63`, `MIA_INPUT_INDEX_MOUSE_STATE`, covers five bytes:

| Offset | Holds |
| --- | --- |
| 0 | Buttons: bit 0 left, 1 right, 2 middle, 3 back, 4 forward. |
| 1 | X counter. |
| 2 | Y counter. |
| 3 | Wheel counter. |
| 4 | Horizontal wheel counter. |

The counters are not positions: MIA adds each movement to them, and they wrap
from 255 to 0. A program keeps the last value it read and subtracts it from
the new one, which gives the movement since then as a signed byte:

```asm
        lda #MIA_INPUT_INDEX_MOUSE_STATE
        sta IDXA_SELECT
        lda IDXA_PORT           ; buttons
        sta buttons
        lda IDXA_PORT           ; X counter
        tax
        sec
        sbc last_x
        sta dx                  ; -128 to 127
        stx last_x
        lda IDXA_PORT           ; Y counter
        tax
        sec
        sbc last_y
        sta dy
        stx last_y
        lda IDXA_PORT           ; step over the wheels, so the index
        lda IDXA_PORT           ; wraps back to the buttons
```

The program must read often enough that the mouse cannot move more than 127
counts between two reads. BASIC's `MOUSE` keeps a position on the screen
built from these counters.

## Gamepads

Up to four gamepads, slots 0-3, have ten bytes each, through indexes
`$64-$67`, `MIA_INPUT_INDEX_GAMEPAD_0` + *n*:

| Offset | Holds |
| --- | --- |
| 0 | D-pad: bit 0 up, 1 down, 2 left, 3 right; bit 7 set when the pad is connected. |
| 1 | The sticks as directions: bits 0-3 the left stick, 4-7 the right one, in the d-pad's order. |
| 2 | Buttons: 0 A, 1 B, 2 C, 3 X, 4 Y, 5 Z, 6 L1, 7 R1. |
| 3 | Buttons: 0 L2, 1 R2, 2 Select, 3 Start, 4 Home, 5 L3, 6 R3. |
| 4-5 | Left stick X and Y, signed, -128 to 127. |
| 6-7 | Right stick X and Y. |
| 8-9 | Left and right triggers, 0-255. |

Check bit 7 of byte 0 before trusting the rest: a slot with no pad reads as
all zeros. BASIC's `JOY`, `PADBTN`, `PADSTICK` and `PADTRIG` read these bytes.

## Input events and interrupts

Polling suits a game that looks at its input once a frame. A program that
would rather be told can have MIA interrupt it. Three interrupt bits stand for
the three kinds of device:

| Bit | Name | For |
| --- | --- | --- |
| 8 | `IRQ_INPUT_KEYBOARD` | Text, keys and consumer keys. |
| 9 | `IRQ_INPUT_MOUSE` | The mouse. |
| 10 | `IRQ_INPUT_GAMEPAD` | Gamepads. |

Each kind also has three bytes in the **input control block**, eleven bytes at
`$11045` reached through index `$68`, `MIA_INPUT_INDEX_INPUT_CONTROL`:

| Offset | Holds |
| --- | --- |
| 0 | Which devices are there: bit 0 keyboard, 1 consumer keys, 2 mouse, 3-6 gamepads 0-3. |
| 1, 4, 7 | Keyboard, mouse and gamepad **events**: what happened since they were last acknowledged. |
| 2, 5, 8 | Their **masks**: which events raise the interrupt. |
| 3, 6, 9 | Their **acknowledge** bytes: writing a 1 bit clears that event. |

The event bits:

| Bit | Keyboard | Mouse | Gamepad |
| --- | --- | --- | --- |
| 0 | Text queued | Button pressed | Button pressed |
| 1 | Key pressed | Button released | Button released |
| 2 | Key released | Moved | D-pad changed |
| 3 | Consumer key pressed | Wheel turned | Stick moved |
| 4 | Consumer key released | Connected or gone | Trigger moved |
| 5 | Connected or gone | | Pad connected or gone |

A kind raises its interrupt bit while its events and its mask have a bit in
common. Reading `IRQ_STATUS_L` clears the interrupt bit but not the events,
so the handler acknowledges the events it handled; otherwise the next
interrupt comes at once. The [interrupts chapter](../ml/interrupts.md) shows
how to chain a handler.

## The input source

Input comes either from Wi-Fi, from the video client or another program
speaking its protocol, or from a terminal on MIA's USB console, typing text.
Command `$50`, `MIA_CMD_INPUT_SET_MODE`, chooses: parameter 1 is 0 for the
console, 1 for Wi-Fi. If the source asked for is not available, nothing
changes and MIA reports error `$50`; bits 5 and 6 of `INPUT_STATUS` say which
source is active. The console sends only text, so with it the bitmaps, mouse
and gamepads stay empty. This is BASIC's `INPUTMODE`.

## Where this is in Mapping Clementina

The input state byte by byte is in *Mapping Clementina*,
[Input](../../../mapping/src/mia/input.md).
