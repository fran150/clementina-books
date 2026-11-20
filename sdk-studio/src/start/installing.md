# Installing

The installer sets up the `clementina` command, cc65, the emulator, the
video client and Clementina Studio.

On macOS and Linux:

```sh
curl -fsSL https://raw.githubusercontent.com/fran150/clementina-sdk/main/install.sh | sh
```

On Windows, in PowerShell:

```text
> irm https://raw.githubusercontent.com/fran150/clementina-sdk/main/install.ps1 | iex
```

Then open a new terminal and check the result with `clementina doctor`
([below](#checking-the-installation)). Add the [VS Code
extension](#the-vs-code-extension) if you want the debugger.

## What it installs

The script downloads the `clementina` command and runs `clementina install`,
which installs the newest release of each tool:

| Tool | Commands |
| --- | --- |
| `cc65` | `ca65`, `ld65`, `ar65` and the rest of cc65 |
| `emulator` | `clementina-emulator`, the interactive emulator you play and debug in, and `clementina-automation`, the headless one that `clementina run`, the debugger and the MCP server start on their own |
| `video-client` | `clementina-video-client`, which shows Clementina's screen, and `clementina-render`, which turns a saved screen into a PNG |
| `studio` | Clementina Studio |

Everything goes in `~/.clementina` (`CLEMENTINA_HOME` picks another
folder), with the commands in `~/.clementina/bin`. `clementina install`
adds that folder to your `PATH` for new terminals: on macOS and Linux it
adds one line to your shell's startup file, and on Windows it adds it to
your user `Path`.

Studio goes where your system keeps apps: `~/Applications` on macOS, a
`clementina-studio` command with a desktop entry on Linux, and the Start
menu on Windows. There is no Studio for Linux on ARM.

On Linux the emulator's sound needs the ALSA library (`libasound2` on
Debian, Ubuntu and Raspberry Pi OS), which most desktops already have.

## Updating and choosing versions

`clementina update` moves the `clementina` command and every installed tool
to its newest release, and `clementina update --check` lists the newer
releases without installing them.

`clementina install` names tools to install only those; add `@version` for a
particular release:

```sh
clementina install emulator video-client
clementina install emulator@0.4.0-alpha.1
```

To install a particular version of the `clementina` command itself, pass
it to the script:

```sh
curl -fsSL https://raw.githubusercontent.com/fran150/clementina-sdk/main/install.sh | sh -s -- --version 0.3.0-alpha.2
```

## The VS Code extension

Download `clementina-<version>.vsix` from the [SDK's releases
page](https://github.com/fran150/clementina-sdk/releases) and install it:

```sh
code --install-extension clementina-0.3.0-alpha.4.vsix
```

or use **Extensions: Install from VSIX…** in VS Code's command palette. It
carries its own copy of the SDK's debugger and its BASIC and assembly
language servers; debugging uses the emulator, and checking assembly as you
type uses cc65. To update it, install the newer `.vsix` the
same way.

The extension covers both languages. For `.cbas` files, it provides BASIC
highlighting and error checks ([Editing BASIC in VS
Code](../building/basic.md#editing-basic-in-vs-code)). For `.s` and `.inc`
files, it provides 65C02 and ca65 highlighting, errors as you type, help on
hover, completion and go to definition ([Editing assembly in VS
Code](../building/assembly.md#editing-assembly-in-vs-code)). You can set
breakpoints in the gutter for either language.

`clementina.yaml` gets completion, hover help and the SDK's checks as you
type ([Editing the manifest](../projects/project-folder.md#editing-the-manifest)).
For that, VS Code also installs Red Hat's YAML extension, which the Clementina
extension depends on.

Other extensions can claim `.s` files; Go's, for example, calls them Go
Assembly. Projects made with `clementina new` include a setting that opens
them as Clementina Assembly. In another folder, click the language name at
the right of VS Code's status bar and choose **Clementina Assembly**.

## The MCP server

The MCP server, which lets an AI agent use the SDK, is part of the
`clementina` command. An agent host starts it with:

```text
clementina mcp
```

[Automation and AI agents](../running/automation.md#the-mcp-server) shows
how to add it to a host.

## Checking the installation

`clementina doctor` prints its own version, then looks for each external
tool:

```sh
clementina doctor
```

```text
clementina 0.3.0-alpha.4
ca65: ready, /Users/you/.clementina/bin/ca65 (ca65 V2.19)
ld65: ready, /Users/you/.clementina/bin/ld65 (ld65 V2.19)
ar65: ready, /Users/you/.clementina/bin/ar65 (ar65 V2.19)
emulator: ready, /Users/you/.clementina/bin/clementina-automation (clementina-automation v0.4.0-alpha.1 (commit abc1234))
```

A missing tool is a warning, and `doctor` still succeeds, because a BASIC
project needs neither cc65 nor the emulator to build. `doctor --strict`
fails unless all four are there. `doctor --emulator PATH` checks a
particular `clementina-automation` executable.
