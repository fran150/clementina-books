# Installing

Until the first release, every tool is built from its repository. Put the
checkouts side by side in one folder; Studio expects the SDK next to it, and
the rest of this book assumes that layout:

```text
clementina/
├── clementina-sdk/
├── clementina-studio/
├── clementina-6502/
└── clementina-video-client/
```

```text
$ git clone https://github.com/fran150/clementina-sdk.git
$ git clone https://github.com/fran150/clementina-studio.git
$ git clone https://github.com/fran150/clementina-6502.git
$ git clone https://github.com/fran150/clementina-video-client.git
```

You need:

| What | For | Version |
| --- | --- | --- |
| Node.js | the SDK, Studio, the VS Code extension | 20 or later |
| Go | the emulator and the video client | 1.23 or later |
| cc65 | assembly programs | any recent release; the SDK needs ld65's debug format 2 |
| VS Code | the debugger (optional) | any recent release |

## The SDK and the `clementina` command

```text
$ cd clementina-sdk
$ npm ci
$ npm run build
```

`npm run build` compiles every package. The command-line tool is then
`packages/cli/bin/clementina.mjs`. Inside the SDK checkout, `npx clementina`
runs it; anywhere else, give it a short name. On macOS and Linux:

```text
$ alias clementina="node $HOME/clementina/clementina-sdk/packages/cli/bin/clementina.mjs"
```

(put the line in your shell's startup file to keep it). The rest of the book
writes the command as `clementina`.

The CLI can also be built as a single executable that needs no Node.js. With
[Bun](https://bun.sh) installed, `npm run build:binaries` writes one for
every platform to `dist/bin/` (`clementina-linux-x64`, `clementina-darwin-arm64`,
`clementina-windows-x64.exe` and so on). Rename yours to `clementina` and put
it on your `PATH`. Releases will attach these executables, so this will be
the usual way to install the CLI. macOS may quarantine a downloaded one;
`xattr -d com.apple.quarantine clementina` clears that.

After pulling new SDK commits, run `npm run build` again.

## cc65

Install cc65 with your system's package manager (`apt install cc65` on
Debian and Ubuntu, `brew install cc65` on macOS), or from
[cc65.github.io](https://cc65.github.io) on Windows. The SDK runs `ca65`,
`ld65` and `ar65` from your `PATH`. BASIC projects don't need it.

## The emulator

```text
$ cd clementina-6502
$ go build -o build/bin/clementina-emulator ./cmd
$ go build -o build/bin/clementina-automation ./cmd/clementina-automation
```

This makes two programs in `build/bin/`:

- `clementina-emulator`, the interactive emulator: a terminal debugger, the video and
  input services for the video client, sound, and the SD card. You use it to
  play your game.
- `clementina-automation`, the headless emulator: no terminal, no video
  service, no sound, controlled through a local HTTP endpoint. `clementina
  run`, the debugger, the agent workflows and the MCP server start it.

Put `build/bin` on your `PATH`, or tell the SDK where
`clementina-automation` is with the `CLEMENTINA_EMULATOR` environment
variable or the `--emulator` option.

On Linux the emulator's sound needs a C compiler and the ALSA headers
(`libasound2-dev` on Debian, Ubuntu and Raspberry Pi OS); without them the
build fails. To build it without sound, put `CGO_ENABLED=0` before
`go build`: it then runs silently. macOS and Windows need nothing extra.

The emulator's own documentation calls the interactive emulator
`clementina`, the name `make build` gives it. That is also the SDK's
command, so this book builds it as `clementina-emulator` instead, and
writes it that way throughout.

The emulator's published releases (v0.3.0 and older) predate the Clementina
model and only emulate Ben Eater's computer, so build it from source.

## The video client

```text
$ cd clementina-video-client
$ go build -o clementina-video-client ./cmd/clementina-video-client
```

The client draws with [Ebitengine](https://ebitengine.org); on Linux that
needs the X11 and OpenGL development packages Ebitengine's install guide
lists. `go run ./cmd/clementina-video-client` builds and starts it in one
step.

The same repository has `clementina-render`, which turns a snapshot of MIA's
video state into a PNG. The agent workflows use it to show what a game drew:

```text
$ go build -o clementina-render ./cmd/clementina-render
```

## Studio

Studio is an Electron application. Build the SDK first, since Studio uses
its packages from the checkout next to it:

```text
$ cd clementina-studio
$ npm ci
$ npm start
```

`npm start` builds Studio and opens it. Run it again after pulling new
commits of Studio or the SDK.

## The VS Code extension

The extension is not on the Marketplace yet. With the SDK built:

```text
$ cd clementina-sdk/packages/vscode-extension
$ npm run package
$ code --install-extension clementina-*.vsix
```

`npm run package` bundles the extension with the SDK's debug adapter and
BASIC language server, so it needs nothing else from the SDK; debugging still
needs the emulator. Package it again after pulling new SDK commits, and add
`--force` to `code --install-extension` to replace the one installed.

To work on the extension itself instead, open `packages/vscode-extension` in
VS Code and press `F5`, which starts a second VS Code window with the
extension loaded.

## Checking the installation

`clementina doctor` checks Node.js and looks for each external tool:

```text
$ clementina doctor
Node.js 22.22.0; ca65: ready, ld65: ready, ar65: ready, emulator: ready.
```

A missing tool is a warning, and `doctor` still succeeds, because a BASIC
project needs neither cc65 nor the emulator to build. `doctor --strict`
fails unless all four are there. `doctor --emulator PATH` checks a
particular `clementina-automation` executable.
