# Appendix G: A development install

This appendix is for working on the tools themselves: changing the SDK,
Studio, the emulator or the video client and trying the change before it is
released. To make projects, install the released tools as in
[Installing](../start/installing.md) instead.

A development install keeps your builds in `~/.clementina/dev/bin` beside
the released tools. `clementina dev on` switches all terminals to the dev
builds until you turn it off. The SDK's
[docs/dev-install.md](https://github.com/fran150/clementina-sdk/blob/main/docs/dev-install.md)
has the full details.

## The checkouts

Put the checkouts side by side in one folder; Studio expects the SDK next
to it:

```sh
git clone https://github.com/fran150/clementina-sdk.git
git clone https://github.com/fran150/clementina-studio.git
git clone https://github.com/fran150/clementina-6502.git
git clone https://github.com/fran150/clementina-video-client.git
```

You need:

| What | For | Version |
| --- | --- | --- |
| Node.js | the SDK, Studio, the VS Code extension | 20 or later |
| Go | the emulator and the video client | 1.23 or later |
| cc65 | assembly code | any recent release; the SDK needs ld65's debug format 2 |

On Linux, the emulator's sound needs a C compiler and the ALSA headers
(`libasound2-dev` on Debian, Ubuntu and Raspberry Pi OS), and the video
client needs the X11 and OpenGL development packages that
[Ebitengine](https://ebitengine.org)'s install guide lists. macOS and
Windows need nothing extra.

## Building into the dev folder

```sh
cd clementina-sdk && npm ci && npm run dev:install
cd ../clementina-6502 && make dev-install
cd ../clementina-video-client && make dev-install
```

- The SDK's `dev:install` builds every package and writes `clementina` and
  `clementina-mcp` launchers that run your checkout. After that, a plain
  `npm run build` is enough: the launchers pick up the change.
- The emulator's `make dev-install` builds `clementina-emulator` and
  `clementina-automation`; the video client's builds
  `clementina-video-client` and `clementina-render`. Run it again after each
  change.

`CLEMENTINA_DEV_BIN` picks another folder. On Windows the launchers are
`.cmd` files.

## Switching between dev and released tools

```sh
clementina dev on
```

```text
Dev mode is on in every terminal. Commands use the dev builds in /Users/you/.clementina/dev/bin: ...
```

```sh
clementina dev
clementina dev off
```

`on` applies to every terminal, even after a restart, until you run `off`.
The installed `clementina` then passes commands to your checkout's build.
On macOS and Linux, the emulator and video-client commands also run your
builds. On every system, `clementina run`, the debugger and MCP server use
your emulator.

Commands remind you on standard error that dev mode is on, and
`clementina doctor` reports it too.

`clementina dev` and `clementina update` always run the installed CLI, so
`clementina dev off` works even when your checkout doesn't build. A tool you
haven't built stays on its released copy.

## Knowing which copy you're running

Every tool says where it came from:

```sh
clementina --version
```

```text
clementina 0.3.0-alpha.1 (dev build, commit 9071659, /Users/you/clementina/clementina-sdk)
```

```sh
clementina-automation --version
```

```text
clementina-automation dev (commit c8147de)
```

A released tool prints its version instead, such as `clementina
0.3.0-alpha.1` or `clementina-automation v0.4.0-alpha.1 (commit abc1234)`,
and "with local changes" marks a dev build with uncommitted edits.
`clementina doctor` prints the same line for itself and the path and version
of every tool it finds.

## Studio

In the Studio checkout, `npm start` builds Studio and opens it. It uses the
SDK checkout next to it, so it always runs your SDK changes. The installed
Studio stays separate.

## The VS Code extension

To try a change, open `clementina-sdk/packages/vscode-extension` in VS Code
and press `F5`: a second VS Code window opens with your build of the
extension. To install your build instead:

```sh
cd clementina-sdk/packages/vscode-extension
rm -f clementina-*.vsix
npm run package
code --install-extension clementina-*.vsix --force
```

The `rm` clears packages from earlier builds, so the last line installs only
the one just built.

Installing the release `.vsix` again goes back to the released extension.
