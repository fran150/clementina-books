# D. Key codes

## What each key types

Every key that types something sends Clementina one character code. `GET`
receives it, and `ASC` turns it into a number: `GET K$:PRINT ASC(K$)`.

| Key | Code | Hex |
| --- | --- | --- |
| Letters, digits, symbols | their ASCII code, 32 to 126 | `$20`-`$7E` |
| RETURN | 13 | `$0D` |
| Backspace | 8 | `$08` |
| Tab | 9 | `$09` |
| ESC | 27 | `$1B` |
| `Ctrl+A` to `Ctrl+Z` | 1 to 26 | `$01`-`$1A` |
| Cursor up | 145 | `$91` |
| Cursor down | 17 | `$11` |
| Cursor right | 29 | `$1D` |
| Cursor left | 157 | `$9D` |
| HOME | 19 | `$13` |
| Insert (`Ctrl+I` in the video client) | 148 | `$94` |
| Delete | 127 | `$7F` |

The cursor keys, HOME and Insert send the same codes as on a Commodore 64.
Some control keys share a code with another key: `Ctrl+H` is Backspace,
`Ctrl+Q` is cursor down and `Ctrl+S` is HOME. `Ctrl+C` stops a running
BASIC program. Function keys, End, Page Up and Page Down send nothing.

## Keys held down

`KEYDOWN(code)` uses different codes, the standard USB keyboard codes,
which name the key rather than the character:

| Key | Code | Key | Code |
| --- | --- | --- | --- |
| `A` to `Z` | 4 to 29 | `-` | 45 |
| `1` to `9` | 30 to 38 | `=` | 46 |
| `0` | 39 | `[` and `]` | 47 and 48 |
| RETURN | 40 | `;` | 51 |
| ESC | 41 | `,` `.` `/` | 54, 55, 56 |
| Backspace | 42 | Right, Left | 79, 80 |
| Tab | 43 | Down, Up | 81, 82 |
| SPACE | 44 | Insert, HOME, Delete | 73, 74, 76 |
| Left Ctrl, Shift, Alt | 224, 225, 226 | Right Ctrl, Shift, Alt | 228, 229, 230 |

## The video client's own keys

| Keys | Mode | What they do |
| --- | --- | --- |
| `Ctrl+M` | both | Switch between normal and control mode. |
| `Ctrl+V` (`Cmd+V`) | normal | Paste the clipboard. |
| `Ctrl+I` | normal | Send Insert. |
| `F1` | control | Back to normal mode. |
| `F3` | control | Debug overlay on or off. |
| `F5` | control | Capture or release the mouse. |
| `F6` | control | Clear MIA's input state. |
| `F11` | control | Full screen on or off. |
| `F12` | control | Reconnect input now. |
| `Escape` | control | Quit the client. |
