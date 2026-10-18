# E. Character set and key codes

## Character set

{{#include ../../../tables/charset.md}}

## Control codes

These codes do something when printed with `PRINT CHR$(n)` or the kernel's
`CHROUT`, instead of showing their tile. To show the tile itself, use
`KERN_CHROUT_GLYPH` ([The kernel](../ml/kernel.md)).

| Code | Does |
| --- | --- |
| `$08` (8) | Backspace: move left and erase. |
| `$0C` (12) | Clear the screen and home the cursor. |
| `$0D` (13) | Start a new line. |
| `$11` (17) | Cursor down. |
| `$13` (19) | Cursor home. |
| `$1D` (29) | Cursor right. |
| `$91` (145) | Cursor up. |
| `$9D` (157) | Cursor left. |

## Keys as text

Keys that type a character put its code in the input queue, where `GET`,
`INPUT` and the kernel's `GETKEY` read it. Printable characters arrive as
ASCII, `$20-$7E`, from the keyboard layout of the computer running the video
client. The editing keys arrive as the same codes from every input source:

| Key | Code |
| --- | --- |
| Backspace | `$08` (8) |
| Tab | `$09` (9) |
| Return | `$0D` (13) |
| Home | `$13` (19) |
| Esc | `$1B` (27) |
| Cursor right | `$1D` (29) |
| Delete | `$7F` (127) |
| Cursor down | `$11` (17) |
| Insert | `$94` (148) |
| Cursor up | `$91` (145) |
| Cursor left | `$9D` (157) |

Function keys and keys without a character put nothing in the queue. Read
them as held keys instead.

## Keys as held keys

`KEYDOWN`, `KEYRPT` and MIA's keyboard bitmap name keys by their USB HID
**usage codes**, the same whatever the keyboard layout and whether Shift is
held:

| Key | Code | Key | Code |
| --- | ---: | --- | ---: |
| `A`-`Z` | 4-29 | `F1`-`F12` | 58-69 |
| `1`-`9` | 30-38 | Print Screen | 70 |
| `0` | 39 | Scroll Lock | 71 |
| Return | 40 | Pause | 72 |
| Esc | 41 | Insert | 73 |
| Backspace | 42 | Home | 74 |
| Tab | 43 | Page Up | 75 |
| Space | 44 | Delete | 76 |
| `-` | 45 | End | 77 |
| `=` | 46 | Page Down | 78 |
| `[` | 47 | Right arrow | 79 |
| `]` | 48 | Left arrow | 80 |
| `\` | 49 | Down arrow | 81 |
| `;` | 51 | Up arrow | 82 |
| `'` | 52 | Num Lock | 83 |
| `` ` `` | 53 | Keypad `/` `*` `-` `+` | 84-87 |
| `,` | 54 | Keypad Enter | 88 |
| `.` | 55 | Keypad `1`-`9`, `0` | 89-98 |
| `/` | 56 | Keypad `.` | 99 |
| Caps Lock | 57 | | |

The modifier keys:

| Key | Code | Key | Code |
| --- | ---: | --- | ---: |
| Left Ctrl | 224 | Right Ctrl | 228 |
| Left Shift | 225 | Right Shift | 229 |
| Left Alt | 226 | Right Alt | 230 |
| Left GUI (Windows, Command) | 227 | Right GUI | 231 |

The keys are named as on a US keyboard; on another layout a code names the key
in the same place.

## Default palette

{{#include ../../../tables/mia-video-palette.md}}
