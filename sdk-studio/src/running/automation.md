# Automation and AI agents

The SDK can validate, build and run a project without someone at the
keyboard. Its headless emulator accepts input and lets tools inspect memory
and video state.

This chapter covers command output for scripts, project checks, the
emulator's endpoint and the MCP server for AI agents.

## The CLI in scripts

Every command takes `--json` and then prints one JSON object on standard
output, and nothing else:

```sh
clementina build --json
```

```text
{"version":1,"ok":true,"diagnostics":[],"exitCode":0,
 "message":"Built the SD card in build/sd. Start it with RUN \"BOOT.BAS\".",
 "data":{"sdRoot":"...","loadPlan":"...","bootstrap":"...","memoryLayout":"...",
         "assembly":{"prg":"...","entryAddress":6144}}}
```

| Field | Meaning |
| --- | --- |
| `ok` | Whether the command succeeded. |
| `diagnostics` | Every error and warning, each with its file, its place in the file, a code and a message. |
| `exitCode` | The same as the process's exit status. |
| `message` | What a person would have been told. |
| `data` | For `build` and `run`: what was made and where. |

Exit status is 0 for success, 1 for a validation or file error, and 2 for a
command used wrongly. Without `--json`, diagnostics go to standard error,
one a line:

```text
/entrySymbol: error assembler.entry-symbol: Symbol nope is absent from ld65 debug data
```

The first part is where the problem is (here, the manifest's `entrySymbol`
field), then the severity and a code that scripts can match on.

## Checks

A project can say what it should do in files under `checks/`. They aren't
part of the manifest; `clementina check` reads them.

**`checks/smoke.json`** checks text on the screen before and after input.

```json
{
  "settleCycles": 3000000,
  "beforeText": "HELLO FROM ASSEMBLY",
  "input": "A",
  "afterText": "YOU PRESSED A"
}
```

`clementina check` runs the program for `settleCycles`, looks for `beforeText`,
types `input`, runs again, and looks for `afterText`. The text is read from
the overlay, where BASIC prints.

**`checks/code.json`** (assembly, or BASIC): bytes that should be in memory.

```json
{
  "format": "clementina-code-check",
  "version": 1,
  "settleCycles": 500000,
  "memory": [
    {"address": 512, "bytes": [42]},
    {"address": 640, "bytes": [160, 0], "phase": "after"}
  ]
}
```

Addresses are CPU addresses; each check reads up to 256 bytes. A check with
`"phase": "after"` runs after the input in `smoke.json`. Use a known memory
address to check game state, such as a score or level number. The SDK's
library demo writes a progress number to `$0280` for this purpose.

`settleCycles` is how long the emulator runs before looking, in CPU cycles.
It is a budget for the test, not a statement about how fast anything is on
the board: the headless emulator runs as fast as your computer allows.

## Checking and inspecting

| Command | Does |
| --- | --- |
| `clementina new DIR [--name NAME]` | Makes a project with a BASIC program and an assembly routine it calls. |
| `clementina check [DIR]` | Validates, builds, runs, and checks everything in `checks/`. |
| `clementina debug [DIR] --line N [--source FILE] [--memory ADDR:COUNT]` | Stops at a source line and records what it finds. |

Both take `--emulator PATH` (by default `CLEMENTINA_EMULATOR`, then
`clementina-automation` on the `PATH`). `check` also takes `--renderer PATH`
for `clementina-render`, and then writes PNG images too. `debug` takes
`--timeout MS`, and its `--memory` address can be decimal, `$0280` or
`0x280` (quote a `$` in the shell: `--memory '$0280:4'`).

`check` exits with 1 and one diagnostic per failed check. A project without
check files is only built and run.

They write what they find to `build/inspection/`:

| File | Contents |
| --- | --- |
| `report.json` | The CPU's registers, the cycle count, the overlay's text row by row, each check's result. |
| `before.video.bin`, `after.video.bin` | MIA's video state before and after the input: 68,944 bytes each. |
| `before.png`, `after.png` | Those drawn at 320×200, with `--renderer`. |
| `debug-report.json`, `debug.video.bin` | From `clementina debug`: the stop, the registers, the source line, the memory asked for. |

A video snapshot is MIA's video memory, not a picture: tables, tiles,
sprites, palettes and the registers. `clementina-render` composes it the way
the video client would. To draw any snapshot, pass it to the renderer:

```sh
clementina-render build/inspection/debug.video.bin > frame.png
```

### Stopping at a line

```sh
clementina debug ~/games/walker --line 61 --memory 640:4
```

```text
Stopped at clementina-lib.inc:… (PC=$....).
Memory $0280: .. .. .. ..
Report: .../build/inspection/debug-report.json
```

Line 61 of `src/main.s` calls `TickAnimation player`. `debug` builds the
project, stops before that line and saves the registers, source location,
four bytes at address 640 and video state. Choose a line that assembles
instructions; comments and labels alone cannot hold a breakpoint.

## The emulator's endpoint

Underneath all of this is the headless emulator's endpoint: HTTP POST
requests to `/v1` on your own computer, each a JSON object with a `version`
and a `method`.

```sh
clementina-automation -sd ~/games/catch/build/sd -port 47000
```

```text
http://127.0.0.1:47000/v1
```

```sh
curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"run"}'
curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"input","data":[65]}'
curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"readMemory","address":512,"count":4}'
```

The methods:

- **Run, pause and step**: `run` starts running and returns at once, `pause`
  stops it, `step` runs a number of cycles, `stepInstruction` runs one
  instruction. `state` reports the registers and why it stopped.
- **Breakpoints**: by address, or by address and bank.
- **Input**: `input` types text; `setHidUsage` holds a key down (for games
  that read the keyboard's state, not its text), `setGamepadState` sets a
  gamepad.
- **Looking**: `readMemory`, `video` (the snapshot), `audio` (MIA's audio
  registers, with each voice's note position).

Appendix E lists every method, its arguments and its limits. The endpoint
has no authentication. It accepts only requests from your own computer and
refuses requests from web pages.

`clementina run` starts the emulator, types `RUN "BOOT.BAS"` into it, and
prints the endpoint, so a script can take over from there. The SDK's
`@clementina/emulator-client` package is a JavaScript client for the same
protocol, for scripts written in JavaScript.

## The MCP server

The Model Context Protocol lets an AI assistant use tools a program offers.
The SDK's MCP server offers the SDK:

| Tool | Does |
| --- | --- |
| `project_validate` | Validates the project. |
| `asset_validate` | Validates one asset. |
| `project_build` | Builds it; returns the files and the load plan. |
| `emulator_launch` | Builds, starts the headless emulator and types `RUN "BOOT.BAS"`. |
| `emulator_state`, `emulator_control`, `emulator_step` | Reads the state; pauses, resumes or resets; runs some cycles. |
| `emulator_input` | Types text. |
| `emulator_read_memory` | Reads CPU memory. |
| `emulator_audio` | Reads MIA's audio registers. |
| `emulator_video_snapshot` | Saves the video state to the project's build folder. |
| `emulator_stop` | Stops the emulator. |

Configure the assistant to start it with:

```text
clementina mcp
```

Add that command to the assistant's MCP settings. The server works on local
project paths and controls one emulator at a time. To step, the agent pauses
the emulator with `emulator_control`, then calls `emulator_step`.

An agent works on a game in the same loop a person does: edit, validate,
build, check and look. `clementina check` and `clementina debug` leave their
evidence in `build/inspection/`, where a person can read it afterwards.
