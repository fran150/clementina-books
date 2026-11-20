# Debugging in VS Code

The Clementina extension lets you debug `.cbas` and `.s` files by source
line. Play in the video client while VS Code stops at breakpoints, steps
through code and shows registers and BASIC variables.

This chapter starts a session and explains what the debugger shows. Install
the extension as described in [Installing](../start/installing.md#the-vs-code-extension).

## Starting a session

Open the project folder (the one with `clementina.yaml`) in VS Code and
press **F5**. With no launch configuration, the extension debugs the open
folder. To keep settings with the project, add a launch configuration in
`.vscode/launch.json`, from **Run ▸ Add Configuration… ▸ Clementina: Launch
project**:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "clementina",
      "request": "launch",
      "name": "Launch Clementina project",
      "program": "${workspaceFolder}"
    }
  ]
}
```

| Setting | Meaning |
| --- | --- |
| `program` | The project folder. Required. |
| `speed` | The CPU clock in MHz the emulator starts at. By default the project's `target.phi2Hz` ([The project folder](../projects/project-folder.md)), 1.2 MHz when it is not set. `0` runs as fast as your computer can. |
| `videoClient` | `false` to not open the video client, or the path of one to open. |
| `realtime` | `false` runs the project in the screenless automation emulator instead, as fast as it can, with no video client. |
| `emulator` | Where the emulator is. By default, the one `clementina install` installed, then the one on your `PATH`. |
| `port` | A fixed port for the emulator's endpoint. By default, any free one. |
| `stopOnBankSwitch` | `true` stops just before code at `$8000-$BFFF` stores to `VIA_ORA`, which switches the bank under it. VS Code shows "Bank switch" as the reason. |

The same choices are VS Code settings, for every project: **Clementina ›
Debug: Speed**, **Open Video Client**, **Emulator Path** and **Video Client
Path**. **Debug: Speed** is empty unless you set it, so each project starts
at its own speed.

When you press **F5**, the extension builds the project and starts the
emulator with `build/sd` mounted. It sets your breakpoints, loads the
program and opens the video client. The program runs until a breakpoint.
If the build fails, VS Code shows the errors before starting the session.

Stopping the session (Shift+F5) closes its emulator and video client.
Starting again rebuilds and starts from power-on. **Restart**
(Ctrl+Shift+F5, or ⇧⌘F5 on a Mac) resets and runs the existing build.

## Playing while debugging

The video client's window shows the game, and the keyboard and gamepads you
use in it go to the game, as when you run it yourself
([The emulator](emulator.md)). Click the window to give it the keyboard. When
the game stops at a breakpoint, the picture freezes until you continue.

The status bar shows the requested and actual speeds, such as
`1.2 MHz · 1.2 MHz`. Click it, or run **Clementina: Set Emulator Speed…**
from the Command Palette, to choose 1, 1.2, 2, 4 or 8 MHz, or the fastest
your computer can manage.

If the project sets `target.phi2Hz`, its loader applies that speed when the
game starts. Choose a new speed afterward. Slower settings help you watch
an event; faster ones get through a long start. If the actual speed stays
below the requested one, your computer is not keeping up.

## Breakpoints

Click in the margin of a source line to set a breakpoint. They can be set
before starting, and are all in place before the program loads, so a
breakpoint on a program's first line works.

If clicking the margin of a `.s` file does nothing, VS Code doesn't know that
the Clementina debugger handles the file. Turn on the setting
**Debug: Allow Breakpoints Everywhere** (`debug.allowBreakpointsEverywhere`).

### In assembly

A breakpoint stops before the line's first instruction runs. The extension
finds the addresses through ld65's debug file, `build/NAME.dbg`, and it is
exact:

- **A line that made no code** (a comment, a label alone, `.res`, a constant)
  can't hold a breakpoint. VS Code shows it unverified, grey, with a message
  saying why. The breakpoint isn't moved to a nearby line.
- **A line inside a macro** stops wherever the macro is used.
- **Code in a bank** stops only in that bank. The same CPU address in
  another bank is different code. With [code in several
  banks](../building/assembly.md#code-in-several-banks), each bank's lines
  stop in their own bank.

### In BASIC

A BASIC line isn't machine code, so a breakpoint on it works differently:
the debugger stops at the interpreter's step between statements, when the
line about to run is yours. The effect is the same: the program stops
before the line runs. The emulator checks the line itself, so the game keeps
its speed until it reaches one of your lines.

### In both

A project with a BASIC program and assembly routines, like every project
`clementina new` makes, takes breakpoints in both at once. A stop inside a
routine shows the assembly line, and the call stack ends with the BASIC line
whose `SYS` or `USR` called it.

## Stepping

| Button | Key | Assembly | BASIC |
| --- | --- | --- | --- |
| Continue | F5 | Runs to the next breakpoint. | The same. |
| Step Over | F10 | Runs to the next source line. A `JSR` runs the whole subroutine. | Runs to the next line. |
| Step Into | F11 | Runs to the next source line, into a subroutine. | Like Step Over. |
| Pause | F6 | Stops wherever the CPU is. | The same. |

Step Out isn't supported. To leave a subroutine, set a breakpoint after its
call and continue.

In a project with both, a step goes by the language that is running: by
assembly lines in a routine, and by BASIC lines in the program. Stepping past
the routine's last `RTS` stops at the next BASIC statement.

Stepping in assembly follows source lines. When the next instruction has no
source line (the kernel, the Clementina library without its sources, code in
RAM), a step runs one instruction and stops there, and VS Code shows the
**Disassembly** view instead. Step Over only treats `JSR` as a call: a
subroutine reached through `JMP` or an interrupt is stepped into.

A program that waits for a key at a breakpoint's line gets it from the
video client: continue, then press the key in its window.

## What VS Code shows when stopped

**Variables ▸ Registers** shows the program counter, selected bank, A, X,
Y, stack pointer, status flags, cycle count and whether MIA has paused the
CPU. These values are read-only.

`P` shows the flags in hex, letters and binary. For example,
`$83 Nv-bdiZC %10000011` has N, Z and C set; uppercase letters mark the
set flags.

**Variables ▸ BASIC Variables** (BASIC only): the program's simple
variables, as BASIC stores them: numbers (`A`), integers (`A%`) and strings
(`A$`). Hovering over a variable in the source shows its value, and the
Watch panel takes variable names. Arrays and expressions aren't evaluated.

In assembly, hovering over a label shows its address and the bytes stored
there, and hovering over a constant, such as `KERN_CHROUT`, shows its value.
Register names (`A`, `X`, `Y`, `SP`, `P`, `PC`) show the register; in a
`.cbas` file, `A` is still the BASIC variable. The Watch panel takes the
same names.

**Call Stack** shows the `JSR` calls and interrupts that led to the current
assembly line. It tracks calls as they happen and checks their return
addresses on the stack. **Unknown caller** marks the point before which it
cannot identify the caller reliably.

**Disassembly**: right-click in the source and **Open Disassembly View** to
see the instructions around the program counter, up to 64 at a time, with
their source lines. The view only reads forward from a known instruction:
the start of an instruction before the program counter can't always be
found.

## Debugging without a screen

With `"realtime": false` the session uses `clementina-automation`, the
emulator that `clementina check` uses: it runs as fast as it can, with no
picture and no keyboard. While a session runs, its emulator listens on a
local endpoint, and anything that speaks its protocol can type into it. Give
the configuration a fixed `port`, say 47000, then from a terminal:

```sh
curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"input","data":[65]}'
```

types `A` (65). `data` is a list of up to 64 bytes. Appendix E lists the
endpoint's other methods, including reading the screen. The same endpoint
works in a real-time session too.

## Without VS Code

The debugger is a library in the SDK, `@clementina/debug`, and VS Code talks
to it through a standard Debug Adapter Protocol server,
`clementina-debug-adapter`. Any editor with a DAP client can use it the same
way, with the same launch settings.

## Reading the build's own files

Some questions are quicker to answer from the files the build writes than
with the debugger:

| Question | File |
| --- | --- |
| What did this line, or this macro, assemble to? | `build/NNN-source.lst` |
| Where did a label end up? | `build/NAME.lbl` |
| How big is each segment, and where is it? | `build/NAME.map` |
| What does each library routine cost in bytes? | `build/lib/code-sizes.json` |
| What is in each slot? | `build/memory-report.json` |
