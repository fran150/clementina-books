# Debugging in VS Code

The Clementina extension ([Installing](../start/installing.md#the-vs-code-extension))
debugs a project in the headless emulator, by source line: breakpoints in
your `.s` or `.bas` files, stepping, the CPU's registers, and for BASIC the
program's variables. This chapter shows how to start a session and what each
part of VS Code's debugger shows.

## Starting a session

Open the project folder (the one with `clementina.yaml`) in VS Code. Add a
launch configuration in `.vscode/launch.json`, from **Run ▸ Add
Configuration… ▸ Clementina: Launch project**:

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
| `emulator` | Where `clementina-automation` is. By default, the one on your `PATH`. |
| `port` | A fixed port for the emulator's endpoint. By default, any free one. |

Press **F5**. The extension builds the project, as `clementina build` would,
starts the headless emulator with the SD card the build calls for, sets your
breakpoints, and then types the load plan into BASIC. The program runs until
it reaches a breakpoint. If the build fails, the session doesn't start,
and VS Code shows the build's errors.

The session owns its emulator: stopping the session (Shift+F5) stops the
emulator, and starting it again starts from power-on with a fresh build.

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
  another bank is different code.

### In BASIC

A BASIC line isn't machine code, so a breakpoint on it works differently:
the debugger stops at the interpreter's step between statements, when the
line about to run is yours. The effect is the same: the program stops
before the line runs.

## Stepping

| Button | Key | Assembly | BASIC |
| --- | --- | --- | --- |
| Continue | F5 | Runs to the next breakpoint. | The same. |
| Step Over | F10 | Runs to the next source line. A `JSR` runs the whole subroutine. | Runs to the next line. |
| Step Into | F11 | Runs to the next source line, into a subroutine. | Like Step Over. |
| Pause | F6 | Stops wherever the CPU is. | The same. |

Step Out isn't supported. To leave a subroutine, set a breakpoint after its
call and continue.

Stepping in assembly follows source lines. When the next instruction has no
source line (the kernel, the runtime library without its sources, code in
RAM), a step runs one instruction and stops there, and VS Code shows the
**Disassembly** view instead. Step Over only treats `JSR` as a call: a
subroutine reached through `JMP` or an interrupt is stepped into.

A program that waits for a key at a breakpoint's line has to get the key
from somewhere. See [Typing into a session](#typing-into-a-session).

## What VS Code shows when stopped

**Variables ▸ Registers**: the program counter, the bank selected in
`$8000-$BFFF`, A, X, Y, the stack pointer, the status flags, the cycle
count, and whether MIA has paused the CPU. Read-only.

**Variables ▸ BASIC Variables** (BASIC only): the program's simple
variables, as BASIC stores them: numbers (`A`), integers (`A%`) and strings
(`A$`). Hovering over a variable in the source shows its value, and the
Watch panel takes variable names. Arrays and expressions aren't evaluated.

**Call Stack**: for assembly, the chain of `JSR` calls and interrupts that
led here, each frame on its source line. The debugger only lists callers it
saw happen: it watches every `JSR` and interrupt from the start, and checks
that their return addresses are still on the stack. Below them is a frame
called **Unknown caller**, the point before which it can't be sure. Bytes on
the stack that merely look like an address are never shown as a caller.

**Disassembly**: right-click in the source and **Open Disassembly View** to
see the instructions around the program counter, up to 64 at a time, with
their source lines. The view only reads forward from a known instruction:
the start of an instruction before the program counter can't always be
found.

## Typing into a session

The headless emulator has no video client, so there is no window to type
into, and the screen isn't visible. While a session runs, its emulator
listens on a local endpoint, and anything that speaks its protocol can type
into it. Give the configuration a fixed `port`, say 47000, then from a
terminal:

```text
$ curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"input","data":[65]}'
```

types `A` (65). `data` is a list of up to 64 bytes. Appendix E lists the
endpoint's other methods, including reading the screen.

Another way to debug a game that needs a player is the interactive
emulator: play it there with the video client, and use its terminal
debugger's address breakpoints, with the addresses from `build/NAME.lbl`.

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
| What does each runtime routine cost in bytes? | `build/runtime/code-sizes.json` |
| What is in each slot? | `build/memory-report.json` |
