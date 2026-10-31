#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only
// Checks the build guide's wiring tables against the rev 1 netlist in clementina-hardware at the
// commit manifest.json pins, and writes the guide's pin tables (build-guide/generated/pins.md)
// from the same netlist. The wiring tables are written by hand; this proves them.
//
//   node tools/check-wiring.mjs [--hardware DIR] [--check]
//
// --hardware  the clementina-hardware checkout to read (default ../clementina-hardware). Its
//             history must contain the pinned commit; the working tree is never read.
// --check     write nothing; fail if generated/pins.md differs from what the netlist generates.
//
// The checker reads every Markdown table in build-guide/src whose header is one of:
//
//   | From | To | Signal | ...                 a wire per row
//   | U4 pin | Signal | Connects to | ...      one pin of one chip per row (also "Pico pin")
//   | Part | Value | First leg | Second leg |  a two-legged part per row; for an electrolytic
//                                              capacitor or a diode the first leg is + or the band
//
// A cell holds endpoints separated by ",", ";", "/" or " and ": a chip pin `U1.37`, a Pico pin
// `Pico 27` (optionally with its GPIO, `Pico 27 (GP21)`), a microSD breakout pin `SD 3`, the
// audio jack's `jack tip`, `jack ring` or `jack sleeve`, a part `R7` or one of its legs `R4.2`,
// or a rail `3.3 V` or `GND`. Anything else is a note and is ignored, unless it names a pin.
// Every endpoint in a row must be on one net, and the Signal cell, when it is not "-", must be
// that net's name. Finally every net must be fully wired by the book: each pin of each part on
// the breadboard (not the J1-J3 headers or the 100 nF decoupling capacitors, which the guide
// places by rule) must be reachable from the others through the rows.
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bookSrc = path.join(root, 'build-guide', 'src');
const pinsFile = path.join(root, 'build-guide', 'generated', 'pins.md');

// Datasheet pin names. The schematic's own names are checked against these where it has them
// (the 74xx gate symbols name their pins "~", so those come from the datasheets alone).
const gate = {1: '1A', 2: '1B', 3: '1Y', 4: '2A', 5: '2B', 6: '2Y', 7: 'GND', 8: '3Y', 9: '3A', 10: '3B', 11: '4Y', 12: '4A', 13: '4B', 14: 'VCC'};
const PARTS = {
  U1: {part: 'W65C02S CPU', pins: names('VPB RDY PHI1O ~IRQB ~ML ~NMI SYNC VDD A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 A10 A11 VSS A12 A13 A14 A15 D7 D6 D5 D4 D3 D2 D1 D0 RWB NC BE PHI2 ~SO PHI2O ~RES')},
  U2: {part: 'AS6C4008 512 KB SRAM', pins: names('A18 A16 A14 A12 A7 A6 A5 A4 A3 A2 A1 A0 DQ0 DQ1 DQ2 VSS DQ3 DQ4 DQ5 DQ6 DQ7 ~CE A10 ~OE A11 A9 A8 A13 ~WE A17 A15 VCC')},
  U3: {part: 'W65C22S VIA', pins: names('VSS PA0 PA1 PA2 PA3 PA4 PA5 PA6 PA7 PB0 PB1 PB2 PB3 PB4 PB5 PB6 PB7 CB1 CB2 VDD ~IRQ RWB ~CS2 CS1 PHI2 D7 D6 D5 D4 D3 D2 D1 D0 ~RES RS3 RS2 RS1 RS0 CA2 CA1')},
  U4: {part: 'AS6C62256 32 KB SRAM', pins: names('A14 A12 A7 A6 A5 A4 A3 A2 A1 A0 DQ0 DQ1 DQ2 VSS DQ3 DQ4 DQ5 DQ6 DQ7 ~CE A10 ~OE A11 A9 A8 A13 ~WE VCC')},
  U6: {part: '74AC138 I/O decoder', pins: names('A0 A1 A2 ~E1 ~E2 E3 ~Y7 GND ~Y6 ~Y5 ~Y4 ~Y3 ~Y2 ~Y1 ~Y0 VCC')},
  U7: {part: '74AC08 AND gates', pins: gate},
  U8: {part: '74AC138 memory decoder', pins: names('A0 A1 A2 ~E1 ~E2 E3 ~Y7 GND ~Y6 ~Y5 ~Y4 ~Y3 ~Y2 ~Y1 ~Y0 VCC')},
  U9: {part: '74AC00 NAND gates', pins: gate},
  A1: {part: 'Raspberry Pi Pico 2 WH (MIA)', pins: names('GP0 GP1 GND GP2 GP3 GP4 GP5 GND GP6 GP7 GP8 GP9 GND GP10 GP11 GP12 GP13 GND GP14 GP15 GP16 GP17 GND GP18 GP19 GP20 GP21 GND GP22 RUN GP26 GP27 AGND GP28 ADC_VREF 3V3 3V3_EN GND VSYS VBUS')},
  J5: {part: 'Adafruit 4682 microSD breakout', pins: names('3V GND CLK SO SI CS DAT1 DAT2 DET')},
};
function names(list) { return Object.fromEntries(list.split(' ').map((n, i) => [i + 1, n])); }

// Nets without a name on the schematic, by what the guide calls them.
const ALIASES = {
  'Net-(U8-~{Y0})': ['~Y0'], 'Net-(U8-~{Y1})': ['~Y1'], 'Net-(U8-~{Y3})': ['~Y3'],
  'Net-(C2-Pad1)': ['filter L'], 'Net-(C4-Pad1)': ['filter R'], 'Net-(R4-Pad2)': ['button'],
};
// What the breadboard leaves out: the PCB's box headers, its mounting holes, and the eight
// decoupling capacitors, which go across each chip's power pins by rule.
const OFF_BOARD = /^(J1|J2|J3|H\d+|C(6|7|8|9|10|11|12|13))$/;
const POLARIZED = /^(CP_|D_)/;

// ---------------------------------------------------------------------------------------------
// Netlist

export function signalName(net) {
  if (ALIASES[net]) return ALIASES[net][0];
  if (net === '+3.3V') return '3.3 V';
  if (net.startsWith('unconnected-')) return 'unconnected';
  return net.replace(/^.*\//, '').replace(/~\{([^}]*)\}/g, '~$1');
}

/** pads: Map "U1.37" -> net; parts: Map ref -> footprint; nets: Map net -> [pad]. */
export function parseBoard(text) {
  const pads = new Map(), parts = new Map(), nets = new Map();
  for (const fp of text.split(/\n\t\(footprint /).slice(1)) {
    const ref = /\(property "Reference" "([^"]+)"/.exec(fp)[1];
    parts.set(ref, /^"[^:]*:([^"]+)"/.exec(fp)[1]);
    for (const m of fp.matchAll(/\(pad "([^"]*)"[^\n]*\n(?:\t\t\t[^\n]*\n)*?\t\t\t\(net \d+ "([^"]*)"\)/g)) {
      const pad = `${ref}.${m[1]}`;
      pads.set(pad, m[2]);
      if (!nets.has(m[2])) nets.set(m[2], new Set());
      nets.get(m[2]).add(pad);
    }
  }
  return {pads, parts, nets};
}

/** ref -> {pin number -> name} from the schematic's own symbols, for the parts it names. */
export function parseSchematicPins(sheets) {
  const result = new Map();
  for (const text of sheets) {
    const lib = text.slice(text.indexOf('(lib_symbols'), text.indexOf('\n\t)', text.indexOf('(lib_symbols')));
    const symbols = new Map();
    for (const block of lib.split(/\n\t\t\(symbol "/).slice(1)) {
      const name = block.slice(0, block.indexOf('"'));
      const pins = {};
      for (const m of block.matchAll(/\(pin \w+ \w+[\s\S]*?\(name "([^"]*)"[\s\S]*?\(number "([^"]*)"/g)) pins[m[2]] = m[1];
      symbols.set(name, pins);
    }
    for (const inst of text.split(/\n\t\(symbol\n/).slice(1)) {
      const lib = /\(lib_id "([^"]+)"/.exec(inst)?.[1], ref = /\(property "Reference" "([^"]+)"/.exec(inst)?.[1];
      if (lib && ref && symbols.has(lib)) result.set(ref, {...result.get(ref), ...symbols.get(lib)});
    }
  }
  return result;
}

// The schematic's symbols spell some pins differently: KiCad's 65xx library uses the older
// phase names, its SRAM and 74xx symbols number from 0, and the microSD header is generic.
const SAME = {'Φ0': 'PHI2', 'Φ1': 'PHI1O', 'U1:Φ2': 'PHI2O', 'U3:Φ2': 'PHI2', 'R/W': 'RWB', 'CS': 'CE', 'E0': 'E1', 'E1': 'E2', 'E2': 'E3', 'VP': 'VPB', 'U1:IRQ': 'IRQB'};
const POWER = /^(VCC|VDD|VSS|GND)$/;
function crossCheckNames(schematic) {
  const problems = [];
  const norm = s => s.replace(/[~{}#]/g, '').replace(/^GPIO(\d+).*/, 'GP$1').replace(/^Q(\d)$/, 'DQ$1').toUpperCase();
  for (const [ref, {pins}] of Object.entries(PARTS)) {
    const theirs = schematic.get(ref);
    if (!theirs) continue;
    for (const [n, name] of Object.entries(pins)) {
      const other = theirs[n];
      if (!other || other === '~' || /^Pin_\d+$/.test(other) || (POWER.test(norm(other)) && POWER.test(norm(name)))) continue;
      const mapped = SAME[`${ref}:${norm(other)}`] ?? SAME[norm(other)] ?? norm(other);
      if (mapped !== norm(name) && norm(other) !== norm(name)) problems.push(`${ref}.${n}: guide names it ${name}, the schematic ${other}`);
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------
// The book's tables

const ENDPOINT = [
  [/^U(\d+)\.(\d+)$/, m => [`U${m[1]}.${m[2]}`]],
  [/^Pico(?: pin)? (\d+)(?: \(([A-Z0-9_ ]+)\))?$/, (m, err) => {
    if (m[2] && PARTS.A1.pins[m[1]] !== m[2].replace(/ /g, '_').replace('3V3_OUT', '3V3')) err(`Pico ${m[1]} is ${PARTS.A1.pins[m[1]]}, not ${m[2]}`);
    return [`A1.${m[1]}`];
  }],
  [/^SD (\d)$/, m => [`J5.${m[1]}`]],
  [/^jack (tip|ring|sleeve)$/, m => [`J4.${m[1][0].toUpperCase()}`]],
  [/^([RCD]\d+|SW1)\.(\d)$/, m => [`${m[1]}.${m[2]}`]],
  [/^([RCD]\d+|SW1)$/, m => [`part:${m[1]}`]],
  [/^(3\.3 V|\+ rail)$/, () => ['rail:+3.3V']],
  [/^(GND|GND rail)$/, () => ['rail:GND']],
];
const PINLIKE = /\bU\d+\.\d+\b|\bPico(?: pin)? \d+\b/;

function parseCell(cell, err) {
  const found = [];
  for (const raw of cell.replace(/`/g, '').split(/,|;| \/ | and /)) {
    const item = raw.trim();
    if (!item) continue;
    const rule = ENDPOINT.find(([re]) => re.test(item));
    if (rule) found.push(...rule[1](rule[0].exec(item), err));
    else if (PINLIKE.test(item)) err(`"${item}" names a pin the checker can't read; give one endpoint per item`);
  }
  return found;
}

function* tables(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) inFence = !inFence;
    if (inFence || !/^\|/.test(lines[i]) || !/^\|\s*-/.test(lines[i + 1] ?? '')) continue;
    const split = l => l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim());
    const header = split(lines[i]), rows = [];
    let j = i + 2;
    for (; j < lines.length && /^\|/.test(lines[j]); j++) rows.push({line: j + 1, cells: split(lines[j])});
    yield {header, rows, line: i + 1};
    i = j;
  }
}

function mdFiles(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? mdFiles(p) : f.endsWith('.md') ? [p] : [];
  });
}

export function checkBook(board, files) {
  const errors = [], links = [];
  let rows = 0;
  const resolve = (ep, err) => {
    if (ep.startsWith('rail:')) return {net: ep.slice(5), node: ep};
    if (ep.startsWith('part:')) {
      const ref = ep.slice(5);
      if (!board.parts.has(ref)) { err(`${ref} is not on the board`); return null; }
      return {part: ref};
    }
    if (!board.pads.has(ep)) { err(`${ep} is not a pin on the board`); return null; }
    return {net: board.pads.get(ep), node: ep};
  };
  for (const file of files) {
    const rel = path.relative(root, file);
    for (const t of tables(file)) {
      const h = t.header.map(c => c.toLowerCase());
      const chip = /^(u\d+|pico) pin$/.exec(h[0]);
      const kind = h[0] === 'from' && h[1] === 'to' && h[2] === 'signal' ? 'wire'
        : chip && h[1] === 'signal' && h[2] === 'connects to' ? 'chip'
        : h[0] === 'part' && h[1] === 'value' && h[2]?.startsWith('first leg') && h[3]?.startsWith('second leg') ? 'part' : null;
      if (!kind) continue;
      for (const row of t.rows) {
        rows++;
        const err = msg => errors.push(`${rel}:${row.line}: ${msg}`);
        const c = row.cells;
        if (kind === 'part') {
          const ref = c[0].replace(/`/g, '').split(/\s/)[0];
          const fp = board.parts.get(ref);
          if (!fp) { err(`${ref} is not on the board`); continue; }
          const legs = [`${ref}.1`, `${ref}.2`].map(p => board.pads.get(p));
          const ends = [c[2], c[3]].map(cell => parseCell(cell, err).map(ep => resolve(ep, err)).filter(Boolean));
          const netsOf = list => [...new Set(list.map(e => e.net ?? null).filter(Boolean))];
          const want = ends.map(netsOf);
          for (const [k, n] of want.entries()) if (n.length > 1) err(`leg ${k + 1} of ${ref} lists endpoints on different nets (${n.join(', ')})`);
          const ok = (a, b) => (!want[0][0] || want[0][0] === a) && (!want[1][0] || want[1][0] === b);
          const swapped = !POLARIZED.test(fp) && ok(legs[1], legs[0]);
          if (!ok(legs[0], legs[1]) && !swapped) err(`${ref} connects ${legs.map(signalName).join(' and ')}, not ${want.map((n, k) => n.map(signalName).join('/') || c[k + 2]).join(' and ')}${POLARIZED.test(fp) ? ' (in that order: the first leg is + or the band)' : ''}`);
          const order = swapped ? [1, 0] : [0, 1];
          ends.forEach((list, k) => list.forEach(e => {
            const leg = `${ref}.${order[k] + 1}`, net = board.pads.get(leg);
            if (e.node) links.push([leg, e.node]);
            else if (![...board.nets.get(net)].some(p => p.startsWith(`${e.part}.`))) err(`${e.part} is not on ${signalName(net)}, where ${ref}'s ${k ? 'second' : 'first'} leg goes`);
            else links.push([leg, `part:${e.part}@${net}`]);
          }));
          continue;
        }
        let eps;
        if (kind === 'wire') eps = [...parseCell(c[0], err), ...parseCell(c[1], err)];
        else {
          const ref = chip[1] === 'pico' ? 'A1' : chip[1].toUpperCase();
          if (!/^\d+$/.test(c[0])) { err(`"${c[0]}" is not one pin number`); continue; }
          eps = [`${ref}.${c[0]}`, ...parseCell(c[2], err)];
        }
        const sig = kind === 'wire' ? c[2] : c[1];
        const res = eps.map(ep => resolve(ep, err)).filter(Boolean);
        const pinNets = [...new Set(res.filter(r => r.net).map(r => r.net))];
        if (pinNets.length > 1) { err(`endpoints are on different nets: ${pinNets.map(signalName).join(', ')}`); continue; }
        const net = pinNets[0];
        if (!net) continue;
        for (const r of res.filter(r => r.part)) {
          if (![...board.nets.get(net)].some(p => p.startsWith(`${r.part}.`))) err(`${r.part} is not on ${signalName(net)}`);
        }
        const accepted = [signalName(net), ...(ALIASES[net] ?? [])].map(s => s.toLowerCase());
        const given = sig.replace(/`/g, '').replace(/\s*\(.*\)$/, '').trim();
        if (given && given !== '-' && !accepted.includes(given.toLowerCase())) err(`signal "${sig}" but the netlist calls it ${signalName(net)}`);
        const nodes = res.filter(r => r.node).map(r => r.node);
        for (let k = 1; k < nodes.length; k++) links.push([nodes[0], nodes[k]]);
        for (const r of res.filter(r => r.part)) links.push([nodes[0], `part:${r.part}@${net}`]);
      }
    }
  }
  // Coverage: union-find over the book's links; every on-board pad of a net must end up joined.
  const parent = new Map();
  const find = x => { while (parent.has(x) && parent.get(x) !== x) x = parent.get(x); return x; };
  const join = (a, b) => { parent.set(find(a), find(b)); parent.set(find(b), find(b)); };
  for (const [a, b] of links) join(a, b);
  for (const [pad, net] of board.pads) {
    const ref = pad.split('.')[0];
    if (['A1', 'U1', 'U2', 'U3', 'U4', 'U6', 'U7', 'U8', 'U9', 'J5'].includes(ref) || OFF_BOARD.test(ref)) continue;
    join(pad, `part:${ref}@${net}`); // a passive's leg stands in for "R7" named loosely in a row
  }
  const missing = [];
  for (const [net, padSet] of board.nets) {
    if (net.startsWith('unconnected-')) continue;
    const on = [...padSet].filter(p => !OFF_BOARD.test(p.split('.')[0]));
    if (net === '+3.3V' || net === 'GND') on.push(`rail:${net}`);
    if (on.length < 2) continue;
    const groups = new Map();
    for (const p of on) { const g = find(p); groups.set(g, [...(groups.get(g) ?? []), p]); }
    if (groups.size > 1) {
      const sorted = [...groups.values()].sort((a, b) => b.length - a.length);
      missing.push(`${signalName(net)}: ${sorted.slice(1).flat().join(', ')} not wired to ${sorted[0].slice(0, 4).join(', ')}${sorted[0].length > 4 ? ', ...' : ''}`);
    }
  }
  return {errors, missing, rows};
}

// ---------------------------------------------------------------------------------------------
// Pin tables

export function renderPins(board, commit) {
  const out = [`<!-- Generated by tools/check-wiring.mjs from clementina-hardware ${commit.slice(0, 7)}. Do not edit. -->`, ''];
  for (const [ref, {part, pins}] of Object.entries(PARTS)) {
    out.push(`<!-- ANCHOR: ${ref} -->`, `### ${ref}: ${part}`, '', '| Pin | Name | Signal | Also goes to |', '| ---: | --- | --- | --- |');
    for (const [n, name] of Object.entries(pins)) {
      const pad = ref === 'J5' ? `J5.${n}` : `${ref}.${n}`, net = board.pads.get(pad);
      const others = net ? [...board.nets.get(net)].filter(p => p !== pad && !OFF_BOARD.test(p.split('.')[0]))
        .sort((a, b) => a.localeCompare(b, 'en', {numeric: true})).map(p => p.replace(/^A1\./, 'Pico ').replace(/^J5\./, 'SD ').replace(/^J4\.T$/, 'jack tip').replace(/^J4\.R$/, 'jack ring').replace(/^J4\.S$/, 'jack sleeve')) : [];
      const sig = !net ? 'unconnected' : net === '+3.3V' || net === 'GND' ? signalName(net) : signalName(net);
      const also = net === '+3.3V' ? '3.3 V rail' : net === 'GND' ? 'GND rail' : sig === 'unconnected' ? '' : others.join(', ');
      out.push(`| ${n} | \`${name}\` | ${sig === 'unconnected' ? 'unconnected' : `\`${sig}\``} | ${also} |`);
    }
    out.push('', `<!-- ANCHOR_END: ${ref} -->`, '');
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------------------------
// Main

function main(argv) {
  const at = argv.indexOf('--hardware');
  const hwDir = at >= 0 ? path.resolve(argv[at + 1]) : path.resolve(root, '..', 'clementina-hardware');
  const pin = JSON.parse(readFileSync(path.join(root, 'manifest.json'), 'utf8')).repositories.find(r => r.name === 'clementina-hardware');
  const git = args => execFileSync('git', ['-C', hwDir, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 27});
  try { git(['cat-file', '-e', `${pin.commit}^{commit}`]); } catch {
    throw Error(`clementina-hardware at ${hwDir} does not have the pinned commit ${pin.commit.slice(0, 7)}; fetch it first.`);
  }
  const board = parseBoard(git(['show', `${pin.commit}:clementina-hardware.kicad_pcb`]));
  const sheets = ['clementina-hardware.kicad_sch', 'CS Logic.kicad_sch', 'OE_RW_PHI2_Sync.kicad_sch'].map(s => git(['show', `${pin.commit}:${s}`]));
  const problems = crossCheckNames(parseSchematicPins(sheets));
  const {errors, missing, rows} = checkBook(board, mdFiles(bookSrc));
  const pins = renderPins(board, pin.commit);
  let stale = false;
  if (argv.includes('--check')) {
    try { stale = readFileSync(pinsFile, 'utf8') !== pins; } catch { stale = true; }
  } else {
    mkdirSync(path.dirname(pinsFile), {recursive: true});
    writeFileSync(pinsFile, pins);
  }
  for (const line of [...problems, ...errors]) console.error(line);
  for (const line of missing) console.error(`not wired: ${line}`);
  if (stale) console.error('build-guide/generated/pins.md is stale; run node tools/check-wiring.mjs');
  if (problems.length || errors.length || missing.length || stale) throw Error(`check-wiring: ${problems.length + errors.length} wrong rows, ${missing.length} nets not fully wired`);
  console.log(`check-wiring: ${rows} rows match clementina-hardware ${pin.commit.slice(0, 7)}, and every net is wired.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
