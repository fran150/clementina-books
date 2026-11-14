# Automation and AI agents

Everything the SDK does can run without a person at the keyboard: validate,
build, start the program in the headless emulator, type into it, and look
at its memory and its screen. This chapter covers the pieces: the CLI's JSON
output, the checks a project can carry, `clementina check` and
`clementina debug`, the emulator's endpoint, and the MCP server that gives
an AI agent the same tools.

## The CLI in scripts

Every command takes `--json` and then prints one JSON object on standard
output, and nothing else:

```text
$ clementina build --json
{"version":1,"ok":true,"diagnostics":[],"exitCode":0,
 "message":"Built build/game.prg and build/load-plan.json. ...",
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

**`checks/smoke.json`** (BASIC): text that should be on the screen, and
keys to type.

```json
{
  "settleCycles": 3000000,
  "beforeText": "PRESS A TO CATCH IT",
  "input": "A",
  "afterText": "CAUGHT! SCORE 1"
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
`"phase": "after"` is made after `smoke.json`'s input has been typed. A game
that writes its state to a known address (a score, a level number, an error
code) can be checked this way. The library demo in the SDK writes the number
of the last check it passed to `$0280`, for exactly this reason.

`settleCycles` is how long the emulator runs before looking, in CPU cycles.
It is a budget for the test, not a statement about how fast anything is on
the board: the headless emulator runs as fast as your computer allows.

## Checking and inspecting

| Command | Does |
| --- | --- |
| `clementina new DIR [--template basic\|assembly] [--name NAME]` | Makes a project from a template. |
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

```text
$ clementina-render build/inspection/debug.video.bin > frame.png
```

### Stopping at a line

```text
$ clementina debug ~/games/walker --line 61 --memory 640:4
Stopped at clementina-lib.inc:… (PC=$....).
Memory $0280: .. .. .. ..
Report: .../build/inspection/debug-report.json
```

Line 61 of `src/main.s` is `TickAnimation player`. `debug` builds, sets
the breakpoint before the program loads, waits for the stop, and saves the
registers, the source location, the four bytes at 640 and the video state.
As in VS Code, a line that makes no code is refused rather than moved.

## The emulator's endpoint

Underneath all of this is the headless emulator's endpoint: HTTP POST
requests to `/v1` on your own computer, each a JSON object with a `version`
and a `method`.

```text
$ clementina-automation -sd ~/games/catch -port 47000
http://127.0.0.1:47000/v1
$ curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"run"}'
$ curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"input","data":[65]}'
$ curl -s http://127.0.0.1:47000/v1 -d '{"version":1,"method":"readMemory","address":512,"count":4}'
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

`clementina run` starts the emulator, types the load plan into it, and
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
| `emulator_launch` | Builds, starts the headless emulator and runs the load plan. |
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

How to add an MCP server depends on the assistant; most take the command in
a settings file. The server runs on your computer, works on paths on your
computer, and owns at most one emulator at a time. To step, the agent
pauses first (`emulator_control`), then steps.

An agent works on a game in the same loop a person does: edit, validate,
build, check and look. `clementina check` and `clementina debug` leave their
evidence in `build/inspection/`, where a person can read it afterwards.
