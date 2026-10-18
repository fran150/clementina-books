#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only
// Checks the Programmer's Reference BASIC dictionary against clementina-sdk's specs/basic.json at
// the commit manifest.json pins: every keyword has exactly one entry, and the entry's syntax line
// is the spec's syntax. The entries themselves are written by hand.
//
//   node tools/check-dictionary.mjs [--sdk DIR]
//
// An entry is a "## KEYWORD" heading (a trailing "(" dropped, as in TAB; an operator may add a
// name in parentheses, "## + (plus)") followed by the line **Kind** · `syntax`.
import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readSpecs} from './generate-tables.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dictionary = path.join(root, 'programmers-reference', 'src', 'dictionary');
const kinds = {statement: 'Statement', function: 'Function', operator: 'Operator', keyword: 'Keyword'};

function entries() {
  const found = new Map();
  for (const file of readdirSync(dictionary).filter(f => f.endsWith('.md') && f !== 'index.md').sort()) {
    const lines = readFileSync(path.join(dictionary, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      const heading = /^## (\S+)(?: \(.*\))?$/.exec(line);
      if (!heading) return;
      const next = lines.slice(i + 1).find(l => l.trim() !== '') ?? '';
      const list = found.get(heading[1]) ?? [];
      list.push({where: `${file}:${i + 1}`, line: next});
      found.set(heading[1], list);
    });
  }
  return found;
}

function main(argv) {
  const at = argv.indexOf('--sdk');
  const sdkDir = at >= 0 ? path.resolve(argv[at + 1]) : path.resolve(root, '..', 'clementina-sdk');
  const pin = JSON.parse(readFileSync(path.join(root, 'manifest.json'), 'utf8')).repositories.find(r => r.name === 'clementina-sdk');
  const keywords = readSpecs(sdkDir, pin.commit, ['basic.json'])['basic.json'].keywords.entries;
  const found = entries();
  const problems = [];
  for (const k of keywords) {
    const name = k.keyword.replace(/\($/, '');
    const list = found.get(name) ?? [];
    found.delete(name);
    if (list.length !== 1) {
      problems.push(list.length ? `${k.keyword}: ${list.length} entries (${list.map(e => e.where).join(', ')})` : `${k.keyword}: no entry`);
      continue;
    }
    const want = `**${kinds[k.kind]}** · \`${k.syntax}\``;
    if (list[0].line !== want) problems.push(`${list[0].where} ${k.keyword}: syntax line should be ${want}`);
  }
  for (const [name, list] of found) problems.push(`${list[0].where}: ${name} is not a keyword in specs/basic.json`);
  if (problems.length) throw Error(`The dictionary does not match specs/basic.json:\n  ${problems.join('\n  ')}`);
  console.log(`Dictionary: ${keywords.length} keywords match clementina-sdk ${pin.commit.slice(0, 7)}.`);
}

try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
