# Input state

MIA RAM `$11000-$1107F` (69632-69759)

Keys, mouse and gamepads reach Clementina through MIA. In normal use they
come from the video client over Wi-Fi; MIA's serial console can supply typed
text instead. Typed characters go to the text queue the CPU reads at
`INPUT_CHAR` (`$FFF3`). Everything else, which keys are held, where the mouse
moved, how the gamepads stand, MIA keeps up to date in this 128-byte block,
along with the clock snapshot.

MIA owns the state bytes and may overwrite them at any moment; the program
writes only the event mask and acknowledge bytes. The block is not video
memory, so nothing here is sent to the client.

{{#include ../../../tables/mia-input.md}}

The indexes `$60-$68` stream each part, and `$50-$5F` are one-byte probes a
program parks on single bitmap bytes ([Index descriptors](../spaces/indexes.md)).

## Key bitmaps: `$11000-$1103F`

Two 32-byte bitmaps, one bit per key, set while the key is held:

- `$11000-$1101F`: the USB HID Keyboard/Keypad page, every ordinary key,
  modifier, arrow, function key and keypad key.
- `$11020-$1103F`: the HID Consumer page, media keys such as mute, volume
  and play.

Key usage `N` is bit `N AND 7` of byte `N / 8`. Some Keyboard/Keypad usages:

| Key | Usage | Byte | Bit |
| --- | --- | --- | --- |
| A | `$04` | `$11000` | 4 |
| Tab | `$2B` | `$11005` | 3 |
| F1 | `$3A` | `$11007` | 2 |
| Right arrow | `$4F` | `$11009` | 7 |
| Left Shift | `$E1` | `$1101C` | 1 |

The bitmaps say which keys are down, not what they type; for text, read the
queue.

## Mouse: `$11040-$11044`

| Address | Field | Contents |
| --- | --- | --- |
| `$11040` | buttons | Bit 0 left, 1 right, 2 middle, 3 back, 4 forward. |
| `$11041` | x | Horizontal movement, accumulated. |
| `$11042` | y | Vertical movement, accumulated. |
| `$11043` | wheel | Wheel movement, accumulated. |
| `$11044` | pan | Horizontal wheel movement, accumulated. |

The four movement bytes are counters that wrap at 256. Subtract the last
reading from the new one as signed bytes to get the movement since, and read
often enough that it stays within -128 to 127.

## Device flags and events: `$11045-$1104F`

| Address | Field | Contents |
| --- | --- | --- |
| `$11045` | `INPUT_DEVICE_FLAGS` | Bit 0 keyboard, 1 consumer keys, 2 mouse available; bits 3-6 gamepads 0-3 connected. |
| `$11046` | `KEYBOARD_EVENT_FLAGS` | Bit 0 text queued, 1 key down, 2 key up, 3 consumer key down, 4 consumer key up, 5 availability changed. |
| `$11047` | `KEYBOARD_EVENT_MASK` | Which of those raise `IRQ_INPUT_KEYBOARD`. |
| `$11048` | `KEYBOARD_EVENT_ACK` | Write 1 bits to clear the matching flags. |
| `$11049` | `MOUSE_EVENT_FLAGS` | Bit 0 button down, 1 button up, 2 moved, 3 scrolled, 4 availability changed. |
| `$1104A` | `MOUSE_EVENT_MASK` | Which of those raise `IRQ_INPUT_MOUSE`. |
| `$1104B` | `MOUSE_EVENT_ACK` | Write 1 bits to clear the matching flags. |
| `$1104C` | `GAMEPAD_EVENT_FLAGS` | Bit 0 button down, 1 button up, 2 d-pad, 3 stick, 4 trigger, 5 connected or disconnected. |
| `$1104D` | `GAMEPAD_EVENT_MASK` | Which of those raise `IRQ_INPUT_GAMEPAD`. |
| `$1104E` | `GAMEPAD_EVENT_ACK` | Write 1 bits to clear the matching flags. |
| `$1104F` | | Reserved, reads as zero. |

MIA sets an event flag when the event happens, and it stays set until the
program acknowledges it. A flag whose mask bit is set also raises the
matching MIA interrupt. MIA clears the acknowledge byte itself once it has
applied it.

## Gamepads: `$11050-$11077`

Four slots of 10 bytes, at `$11050`, `$1105A`, `$11064` and `$1106E`. The
generated table above gives the record; the buttons are:

| Byte | Bits 0-7 |
| --- | --- |
| `dpad` | up, down, left, right, (reserved), (reserved), Sony-style labels, connected |
| `sticks` | left stick up, down, left, right; right stick up, down, left, right |
| `button0` | A/Cross, B/Circle, C/right paddle, X/Square, Y/Triangle, Z/left paddle, L1, R1 |
| `button1` | L2, R2, Select/Back, Start/Menu, Home, L3, R3, (reserved) |

`lx`, `ly`, `rx` and `ry` are the analog sticks as signed bytes, negative
left and up; `lt` and `rt` are the analog triggers, 0-255.

## The clock snapshot: `$11078-$1107F`

Command `$55` latches MIA's clocks here: milliseconds since MIA's runtime
started (4 bytes), the 60 Hz `TI` count (3 bytes, wrapping at 5,184,000) and
a version byte, 1. The bytes keep their values until the next snapshot, so a
program reads them at leisure, at any CPU speed. `KERN_RDTIM` takes a
snapshot and copies the eight bytes to `$02F8` in CPU RAM
([Page 2](../cpu/page-2.md)).
