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

Four slots of 10 bytes, at `$11050`, `$1105A`, `$11064` and `$1106E`. Each
record has the same offsets; the address entries below explain them. The
buttons are:

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

## Address entries

MIA RAM addresses are five hexadecimal digits. Each entry gives the decimal
address or range first, then hexadecimal and the field name.

### 69632–69663　　$11000–$1101F　　KEYBOARD_BITMAP

Thirty-two bytes recording which USB HID Keyboard/Keypad usages are held
down. For usage number `N`, read byte `N / 8` and test bit `N AND 7`; a set
bit means the key is currently down. For example, the `A` key's usage is
`$04`, so its state is bit 4 at `$11000`. These bits represent physical key
usages, not the text a key produces after modifiers and layout are applied.
MIA updates them as input arrives, so programs read rather than write them.

### 69664–69695　　$11020–$1103F　　CONSUMER_BITMAP

Thirty-two bytes for held HID Consumer usages such as media and volume
controls. They use the same byte-and-bit rule as the keyboard bitmap, but
their usage numbers belong to a different HID page. A program can tell
whether a media key is still held without consuming the text queue. MIA
owns these bytes and may update them at any time.

### 69696　　$11040　　MOUSE_BUTTONS

Bits 0-4 say whether the left, right, middle, back and forward mouse
buttons are held. Unlike an event flag, a bit remains set for as long as
the button stays down. Changes can also set flags in the mouse event byte
at `$11049` for interrupt-driven software.

### 69697　　$11041　　MOUSE_X

An accumulated horizontal movement count. MIA adds mouse motion to this
byte, wrapping at 256, so subtract a previous reading from a new one as a
signed byte to find the movement since the last poll. Read often enough
that movement between polls stays within -128 to 127.

### 69698　　$11042　　MOUSE_Y

The accumulated vertical movement count, with the same wrapping behavior
as `MOUSE_X`. It gives relative movement, not an absolute screen row or
pixel coordinate. A program tracks its own pointer position by adding the
differences between successive readings.

### 69699　　$11043　　MOUSE_WHEEL

The accumulated vertical wheel movement. A new reading minus the previous
one gives the wheel motion since the last poll, allowing for byte wrap.
The count is independent of the mouse's Y movement at `$11042`.

### 69700　　$11044　　MOUSE_PAN

The accumulated horizontal wheel or pan movement. It uses the same
wrapping counter scheme as the X, Y and vertical wheel bytes. An
application that ignores horizontal scrolling can leave it unread.

### 69701　　$11045　　INPUT_DEVICE_FLAGS

Shows which input devices are available. Bits 0, 1 and 2 report keyboard,
consumer controls and mouse; bits 3-6 report connected gamepads 0-3.
These are availability flags, not event acknowledgements, and MIA changes
them when devices connect or disconnect.

### 69702　　$11046　　KEYBOARD_EVENT_FLAGS

Sticky flags for text queued, key down, key up, consumer key down,
consumer key up and device availability changes (bits 0-5). A flag stays
set until a program acknowledges it through `$11048`, even if the key is no
longer held. Use the key bitmap for present state and these bits for events
that occurred since the last acknowledgement.

### 69703　　$11047　　KEYBOARD_EVENT_MASK

Each set bit enables the matching flag at `$11046` to raise
`IRQ_INPUT_KEYBOARD`. For example, enabling the text-queued bit lets MIA
interrupt the CPU when a new character enters its queue. The mask changes
which events request an IRQ; it does not erase existing event flags.

### 69704　　$11048　　KEYBOARD_EVENT_ACK

Write 1 bits to clear the matching keyboard event flags at `$11046`.
Writing zero to a bit leaves its flag unchanged. MIA clears the
acknowledgement byte after applying it, so read the event flags before
acknowledging if the program needs to know what happened.

### 69705　　$11049　　MOUSE_EVENT_FLAGS

Sticky flags for mouse button down, button up, movement, scrolling and
availability changes (bits 0-4). They report that an event occurred; the
button and movement bytes at `$11040-$11044` hold the current state and
accumulated counts. Acknowledge handled flags through `$1104B`.

### 69706　　$1104A　　MOUSE_EVENT_MASK

Each bit enables the corresponding mouse event flag to raise
`IRQ_INPUT_MOUSE`. A program interested only in button presses can enable
those bits without being interrupted on every movement. Masking an event
does not stop MIA from updating the state bytes.

### 69707　　$1104B　　MOUSE_EVENT_ACK

Write 1 bits to clear mouse event flags at `$11049`. MIA consumes the
acknowledgement and clears this byte itself. The movement counters do not
reset when events are acknowledged; applications compare successive
readings to obtain motion.

### 69708　　$1104C　　GAMEPAD_EVENT_FLAGS

Sticky flags for button down, button up, d-pad motion, stick motion,
trigger motion and a connection change (bits 0-5). They summarize events
from all four gamepad slots. The records at `$11050-$11077` show the
current controls for each slot.

### 69709　　$1104D　　GAMEPAD_EVENT_MASK

Each set bit allows the matching gamepad event to raise
`IRQ_INPUT_GAMEPAD`. This lets a program request interrupts for only the
control changes it handles. MIA still updates gamepad state when a mask
bit is clear.

### 69710　　$1104E　　GAMEPAD_EVENT_ACK

Write 1 bits to clear the matching gamepad event flags at `$1104C` after
handling them. MIA clears the acknowledgement byte once applied. Reading
the current gamepad records does not itself acknowledge an event.

### 69711　　$1104F　　Reserved

This byte is reserved for later input state. It currently reads as zero.
Programs should not assign it a private meaning, because future firmware
may use it without moving the documented gamepad records.

### 69712–69721　　$11050–$11059　　GAMEPAD_0

The ten-byte state of gamepad slot 0. Offsets 0-3 hold d-pad, stick
direction and two button bitmaps; offsets 4-7 hold signed X/Y positions for
the left and right sticks; offsets 8-9 hold the two trigger values from 0
to 255. The connected flag is bit 7 of the first byte. MIA updates the
record as reports arrive; a program reads it as current state.

### 69722–69731　　$1105A–$11063　　GAMEPAD_1

Gamepad slot 1 has the same ten-byte layout as slot 0: digital controls at
offsets 0-3, signed stick positions at 4-7 and trigger values at 8-9.
Its own connected bit is bit 7 at `$1105A`, so software can skip the rest
of the record when this slot is empty.

### 69732–69741　　$11064–$1106D　　GAMEPAD_2

Gamepad slot 2 repeats the standard state record. Read `$11064` bit 7 to
see whether a controller is connected, then read its button, stick and
trigger bytes within the following nine addresses. Its values are separate
from the other three gamepad slots.

### 69742–69751　　$1106E–$11077　　GAMEPAD_3

The fourth gamepad slot, with the same ten-byte layout and connected bit
at `$1106E` bit 7. MIA may change the record while an application is
reading it; polling software should read often enough for its own input
needs, and use the gamepad event flags if it wants change notifications.

### 69752–69755　　$11078–$1107B　　CLOCK_MS

Four little-endian bytes of milliseconds since MIA's runtime started.
Command `$55` latches them here so the CPU can read a stable snapshot
through an index window. The count wraps after about 49.7 days. It is
not the live clock until another snapshot command is issued.

### 69756–69758　　$1107C–$1107E　　CLOCK_TI

Three little-endian bytes holding the latched 60 Hz time-of-day count.
It wraps at 5,184,000 ticks, once every 24 hours, and is the source for
BASIC's `TI`. `KERN_RDTIM` also copies it to page 2 of CPU RAM at
`$02FC-$02FE`.

### 69759　　$1107F　　CLOCK_VERSION

The version of the eight-byte clock snapshot layout. Value 1 means the
millisecond and 60 Hz fields above have the described format. Check it
before interpreting a snapshot obtained from unfamiliar MIA firmware.

## CPU input status

`INPUT_STATUS` at `$FFF2` summarizes this block without an index read:
bit 0 means text is queued; bits 1-4 mean a keyboard, consumer control,
mouse button or gamepad digital control is held; bits 5-6 identify console
or Wi-Fi as the active input source. Bit 7 is reserved for a later USB-host
keyboard and currently reads zero.
