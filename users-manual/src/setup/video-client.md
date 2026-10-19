# The video client

The video client is Clementina's monitor and keyboard. It keeps a copy of
MIA's video memory, asks MIA for whatever changed many times a second, draws
the 320 × 200 picture, and sends your keyboard, mouse and gamepads back.

Start it from its folder:

```bash
go run ./cmd/clementina-video-client
```

With no options it connects to `127.0.0.1:6502`, the emulator on the same
computer. For a board, add `--server` with MIA's address, as in
[The Clementina board](board.md).

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `--server ADDRESS:PORT` | `127.0.0.1:6502` | Where MIA (or the emulator) is. |
| `--scale N` | `4` | Window size: each Clementina pixel is N × N screen pixels. 4 makes a 1280 × 800 window. |
| `--fullscreen` | off | Start in full screen. |
| `--fps N` | `25` | How often the client asks for a new picture, per second. |
| `--paste-rate N` | `40` | Characters per second when pasting text. |
| `--disable-keyboard`, `--disable-mouse`, `--disable-gamepads` | off | Don't send that kind of input. |
| `--input=false` | on | Send no input at all: a display only. |
| `--debug-overlay` | off | Show connection, frame rate and network details over the picture. |

For example, a full-screen window at a lower request rate:

```bash
go run ./cmd/clementina-video-client --server 192.168.1.50:6502 --fullscreen --fps 30
```

## Normal mode and control mode

The client has two modes, and `Ctrl+M` switches between them.

In **normal mode** (where it starts) every key goes to Clementina, except
the few chords the client keeps for itself:

| Keys | What they do |
| --- | --- |
| `Ctrl+M` | Switch to control mode. |
| `Ctrl+V` (`Cmd+V` on a Mac) | Paste text from your computer's clipboard. |
| `Ctrl+I` | Send Insert, for keyboards without an Insert key, such as a Mac's. |

In **control mode** the window shows the client's status and the function
keys control the client:

| Key | What it does |
| --- | --- |
| `F1` | Back to normal mode. |
| `F3` | Show or hide the debug overlay. |
| `F5` | Capture or release the mouse. |
| `F6` | Clear MIA's input state (stuck keys, a paste in progress). |
| `F11` | Full screen on or off. |
| `F12` | Reconnect input now. |
| `Escape` | Quit the client. |

Other keys and gamepads still reach Clementina in control mode.

## Keyboard, mouse and gamepads

Your computer's keyboard layout decides which character each key types:
Clementina receives the character, not the key's position. Printable
characters, RETURN, the cursor keys, HOME, Insert, Delete, Backspace, Tab
and Escape all work, and `Ctrl` with a letter sends that control code
(`Ctrl+C` stops a BASIC program). Function keys, End and Page Up/Down send
nothing. Only plain ASCII characters reach Clementina: an accented letter
such as `å` is dropped. [Key codes](../appendix/keys.md) lists what each key
sends.

The mouse is sent only while it is **captured**: switch to control mode,
press `F5`, then `F1` to go back. The pointer disappears into the window
until you release it the same way.

Gamepads plugged into your computer work at once, up to four of them.

## Pasting text

`Ctrl+V` types your computer's clipboard into Clementina, as if you typed it
very fast. That is the easy way to bring in a program from a web page or a
text file: copy it, click the client window at the `READY.` prompt, and
paste. Each line break presses RETURN.

The client types 40 characters a second, because Clementina can only hold 64
waiting characters. If a long paste loses characters, lower the rate, for
example `--paste-rate 20`. Clicking another window, or `F6`, stops a paste.

## When Clementina resets

When the computer resets (the RESET button, or a reset in the emulator) MIA
forgets its connection to the client. The client notices and reconnects by
itself within a few seconds. To skip the wait, press `Ctrl+M`, then `F12`,
then `F1`.
