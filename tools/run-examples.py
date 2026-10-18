#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Runs the BASIC examples of a book in the emulator and checks their output.

Every ```basic block in the book's Markdown is an example, and so is every
```wozmon block, whose lines are typed as they are. A block whose lines
all start with a line number is a program: it is typed, then RUN. Any other
block is typed line by line in direct mode. When a ```text block follows it
(only blank lines between), that is the expected output: its lines must appear
on the emulator's screen, in order and next to each other. Any "?... ERROR"
on the screen fails the example unless the expected output shows it.

An HTML comment just before a block tunes it:

    <!-- example: skip -->              not run (needs hardware, never ends, ...)
    <!-- example: norun -->             a program that is typed but not RUN
    <!-- example: keys="\\x03" -->      keys typed after RUN (Python escapes)
    <!-- example: cycles=6000000 -->    CPU cycles to run after the keys
    <!-- example: hold=79,81 -->        keyboard HID usage codes held down
    <!-- example: after="PRINT X" -->   direct lines typed at the end (| separates)
    <!-- example: with=previous -->     type the previous program block first
    <!-- example: files=NAME:hex -->    put a file on the SD card (, separates)

A ```asm block (ca65 syntax, 65C02) runs only when its comment names a load
address: it is assembled with ca65/ld65 against clementina-sdk's
clementina.inc, saved on the SD card as a PRG file, and the run= lines are
typed (| separates). A ```text block after it is the expected output.

    <!-- example: org=$0280 prg=HELLO.PRG run="BLOAD \"HELLO.PRG\"|SYS 640" -->

Usage: tools/run-examples.py BOOK_DIR [--emulator ../clementina-6502] [--only FILE]
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import tempfile

BLOCK = re.compile(r"```(\w*)\n(.*?)```", re.S)
OPTION = re.compile(r"<!--\s*example:\s*(.*?)\s*-->$", re.S)
LINE_NUMBER = re.compile(r"^\d+\s")


def parse_options(text):
    options = {}
    for match in re.finditer(r'(\w+)(?:=("(?:[^"\\]|\\.)*"|\S+))?', text):
        key, value = match.group(1), match.group(2)
        if value is None:
            options[key] = True
        elif value.startswith('"'):
            options[key] = value[1:-1].encode().decode("unicode_escape")
        else:
            options[key] = value
    return options


LINKER = """MEMORY {
  ZP: start=$98, size=$48, type=rw;
  RAM: start=%d, size=%d, type=rw, file=%%O;
}
SEGMENTS {
  ZEROPAGE: load=ZP, type=zp;
  CODE: load=RAM, type=ro;
  RODATA: load=RAM, type=ro;
  DATA: load=RAM, type=rw;
  BSS: load=RAM, type=bss, define=yes;
}
"""


def assemble(source, org, sdk):
    """Assembles a ca65 source at org and returns the PRG bytes."""
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "example.s")
        open(src, "w").write(source)
        cfg = os.path.join(tmp, "link.cfg")
        open(cfg, "w").write(LINKER % (org, 0xC000 - org))
        obj, out = os.path.join(tmp, "example.o"), os.path.join(tmp, "example.bin")
        include = os.path.join(sdk, "packages", "runtime", "asm")
        subprocess.run(["ca65", "--cpu", "65C02", "-I", include, "-o", obj, src], check=True)
        subprocess.run(["ld65", "-C", cfg, "-o", out, obj], check=True)
        return org.to_bytes(2, "little") + open(out, "rb").read()


def examples_in(path, sdk):
    text = open(path, encoding="utf-8").read()
    blocks = list(BLOCK.finditer(text))
    previous_program = None
    for i, block in enumerate(blocks):
        if block.group(1) not in ("basic", "asm", "wozmon"):
            continue
        before = text[: block.start()].rstrip()
        option = OPTION.match(before[before.rfind("<!--") :]) if before.endswith("-->") else None
        options = parse_options(option.group(1)) if option else {}
        lines = [line for line in block.group(2).splitlines() if line.strip()]
        program = block.group(1) == "basic" and all(LINE_NUMBER.match(line) for line in lines)
        if block.group(1) == "asm":
            if "org" not in options or options.get("skip"):
                continue
            org = int(options["org"].replace("$", "0x"), 0)
            prg = assemble(block.group(2), org, sdk)
            options.setdefault("files", "")
            extra = f"{options.get('prg', 'EXAMPLE.PRG')}:{prg.hex()}"
            options["files"] = f"{options['files']},{extra}" if options["files"] else extra
            lines, program = options.get("run", "").split("|"), False
        expected = None
        if i + 1 < len(blocks) and blocks[i + 1].group(1) == "text":
            gap = text[block.end() : blocks[i + 1].start()]
            if gap.strip() == "":
                expected = blocks[i + 1].group(2).rstrip("\n").splitlines()
        line_no = text[: block.start()].count("\n") + 1
        typed = list(lines)
        if options.get("with") == "previous" and previous_program:
            typed = previous_program + typed
        if program:
            previous_program = typed
            if not options.get("norun"):
                typed = typed + ["RUN"]
        if options.get("skip"):
            continue
        files = {}
        if "files" in options:
            for item in filter(None, options["files"].split(",")):
                name, data = item.split(":")
                files[name] = base64.b64encode(bytes.fromhex(data)).decode()
        yield {
            "id": f"{os.path.basename(os.path.dirname(path))}/{os.path.basename(path)}:{line_no}",
            "lines": typed,
            "keys": options.get("keys", ""),
            "cycles": int(options.get("cycles", 3_000_000)),
            "hold": [int(c) for c in options["hold"].split(",")] if "hold" in options else [],
            "after": options["after"].split("|") if "after" in options else [],
            "files": files,
            "expected": expected,
        }


def contains(screen, expected):
    rows = [row.rstrip() for row in screen]
    want = [line.rstrip() for line in expected]
    for start in range(len(rows) - len(want) + 1):
        if rows[start : start + len(want)] == want:
            return True
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("book")
    parser.add_argument("--emulator", default=os.path.join(os.path.dirname(__file__), "..", "..", "clementina-6502"))
    parser.add_argument("--sdk", default=os.path.join(os.path.dirname(__file__), "..", "..", "clementina-sdk"))
    parser.add_argument("--only")
    parser.add_argument("--show", action="store_true", help="print every example's screen")
    args = parser.parse_args()

    examples = []
    for root, _, names in sorted(os.walk(args.book)):
        for name in sorted(names):
            path = os.path.join(root, name)
            if name.endswith(".md") and (not args.only or args.only in path):
                examples.extend(examples_in(path, args.sdk))
    if not examples:
        print("no examples found")
        return 0

    harness = os.path.abspath(os.path.join(os.path.dirname(__file__), "examples", "examples_test.go"))
    emulator = os.path.abspath(args.emulator)
    target = os.path.join(emulator, "pkg", "computers", "clementina", "book_examples_test.go")
    with tempfile.TemporaryDirectory() as tmp:
        overlay = os.path.join(tmp, "overlay.json")
        json.dump({"Replace": {target: harness}}, open(overlay, "w"))
        inputs = os.path.join(tmp, "examples.json")
        # Go decodes the files' []byte values from base64.
        json.dump(examples, open(inputs, "w"))
        results_path = os.path.join(tmp, "results.json")
        env = dict(os.environ, BOOK_EXAMPLES=inputs, BOOK_RESULTS=results_path)
        run = subprocess.run(
            ["go", "test", "-overlay", overlay, "./pkg/computers/clementina", "-run", "TestBookExamples", "-count=1", "-timeout", "60m"],
            cwd=emulator,
            env=env,
        )
        if run.returncode != 0:
            return run.returncode
        results = json.load(open(results_path))

    failures = 0
    for example, result in zip(examples, results):
        screen = result["screen"]
        problems = []
        expected = example["expected"]
        if expected is not None and not contains(screen, expected):
            problems.append("expected output not on screen")
        errors = [row.strip() for row in screen if re.search(r"\?[A-Z'/ ]+ERROR", row)]
        if errors and not (expected and any("ERROR" in line for line in expected)):
            problems.append("error on screen: " + errors[0])
        if problems or args.show:
            failures += 1 if problems else 0
            status = "FAIL" if problems else "ok  "
            print(f"{status} {example['id']}: {'; '.join(problems)}")
            for row in screen:
                if row.strip():
                    print("    |" + row.rstrip())
        else:
            print(f"ok   {example['id']}")
    print(f"{len(examples) - failures}/{len(examples)} examples passed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
