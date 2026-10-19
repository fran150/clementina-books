# Appendix A: CLI reference

```text
clementina <command> [arguments] [--json]
```

Run without a command, or with `--help`, it prints this list.

| Command | Does |
| --- | --- |
| `project validate [folder]` | Validates the manifest, every asset it lists, the references between them, and that the program's sources exist. The folder defaults to the current one. |
| `asset validate FILE` | Validates one asset file of any kind against its format and its own rules. References to other assets aren't checked: use `project validate`. |
| `sprite validate FILE` | Validates a shape file. |
| `animation validate FILE` | Validates an animation file. |
| `basic compile SOURCE OUTPUT` | Compiles a numbered BASIC text file into the file `SAVE` writes. `OUTPUT` must not be `SOURCE`. |
| `build [folder]` | Validates and builds the project. Writes only inside the build folder. |
| `run [folder] [--emulator PATH] [--port N]` | Builds, starts the headless emulator with the right SD card, types the load plan, prints the endpoint and stays running until Ctrl-C. |
| `doctor [--strict] [--emulator PATH]` | Checks Node.js, `ca65`, `ld65`, `ar65` and the headless emulator. |

## Options

| Option | Commands | Meaning |
| --- | --- | --- |
| `--json` | all | Print one JSON object on standard output and nothing else. |
| `--emulator PATH` | `run`, `doctor` | The `clementina-automation` executable. Default: `CLEMENTINA_EMULATOR`, then the one on the `PATH`. |
| `--port N` | `run` | The endpoint's port, 1-65535. 0, the default, picks a free one. |
| `--strict` | `doctor` | Fail unless all four tools are present. |

## Environment

| Variable | Meaning |
| --- | --- |
| `CLEMENTINA_EMULATOR` | Where `clementina-automation` is, for `run`, `doctor`, the workflow scripts and the MCP server. |

## Exit status

| Status | Meaning |
| ---: | --- |
| 0 | Success. Warnings may have been printed. |
| 1 | Validation failed, or a file couldn't be read or written. |
| 2 | The command was used wrongly. |

## JSON output

```json
{"version": 1, "ok": true, "diagnostics": [], "exitCode": 0, "message": "...", "data": {}}
```

`message` appears where a person would have been told something; `data`
appears for `build` and `run`. For `build`, `data.kind` is `"basic"` or
`"assembly"`, and `data.sdRoot` is the folder to use as the SD card.

A diagnostic has a severity (`error` or `warning`), a code, a message, the
file it is about and a JSON pointer into that file (`/build/assembly/entrySymbol`).
Without `--json` they print to standard error as:

```text
FILE/POINTER: SEVERITY CODE: MESSAGE
```

## Other programs

| Program | From | Does |
| --- | --- | --- |
| `clementina-emulator` | `clementina-6502` | The interactive emulator ([The emulator](../running/emulator.md)), built under that name ([Installing](../start/installing.md#the-emulator)). |
| `clementina-automation -sd FOLDER [-port N]` | `clementina-6502` | The headless emulator. |
| `clementina-video-client [--server HOST:PORT]` | `clementina-video-client` | The screen and input devices. |
| `clementina-render` | `clementina-video-client` | A video snapshot, as a JSON array on standard input, to a PNG on standard output. |
| `clementina-basic-lsp` | `clementina-sdk` | The BASIC language server, over standard input and output. |
| `clementina-debug-adapter` | `clementina-sdk` | The debugger, as a Debug Adapter Protocol server. |
| `clementina-mcp` | `clementina-sdk` | The MCP server, over standard input and output. |
