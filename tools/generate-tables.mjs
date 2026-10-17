#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only
// Writes the books' reference tables (tables/*.md) from clementina-sdk's specs/*.json at the
// SDK commit manifest.json pins. Chapters include them with mdBook's {{#include}}; nobody edits
// them by hand. The specs hold names, values and one-line descriptions; prose stays in the books.
//
//   node tools/generate-tables.mjs [--sdk DIR] [--check]
//
// --sdk  the clementina-sdk checkout to read (default ../clementina-sdk). Its history must
//        contain the pinned commit; the working tree is never read.
// --check  write nothing; fail if a table differs from what the pinned specs generate.
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tablesDir = path.join(root, 'tables');

// ---------------------------------------------------------------------------------------------
// Formatting

/** `$XX`, `$XXXX` or `$XXXXX`, by the width the value needs (MIA RAM addresses take five). */
export function hex(value, digits = value < 0x100 ? 2 : value < 0x10000 ? 4 : 5) {
  return `$${value.toString(16).toUpperCase().padStart(digits, '0')}`;
}
const range = (start, size, digits) => (size > 1 ? `${hex(start, digits)}-${hex(start + size - 1, digits)}` : hex(start, digits));
const code = text => `\`${text}\``;
const cell = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
const bytes = n => `${n.toLocaleString('en-US')}`;
const count = n => `${bytes(n)} byte${n === 1 ? '' : 's'}`;

/** A Markdown table: `columns` are headers, `rows` arrays of cell values. */
export function table(columns, rows) {
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n');
}

/** MIA's per-byte names for a field: NAME, NAME_L/_H, NAME_L/_M/_H, or NAME0-NAME3. */
export function byteNames(name, size) {
  if (size === 2) return [`${name}_L`, `${name}_H`];
  if (size === 3) return [`${name}_L`, `${name}_M`, `${name}_H`];
  if (size === 4) return [0, 1, 2, 3].map(i => `${name}${i}`);
  return [name];
}
const fieldName = (name, size) => byteNames(name, size).map(code).join(', ');
const bitRows = (bits, prefix = '') => bits.map(b => [b.bit, code(`%${(2 ** b.bit).toString(2).padStart(8, '0')}`), code(`${prefix}${b.name}`), b.description]);

// ---------------------------------------------------------------------------------------------
// Tables, one file each. `sources` names the spec files a table reads.

export const TABLES = [
  {file: 'mia-registers.md', title: 'MIA registers', sources: ['mia-registers.json'], render: s => table(
    ['Address', 'Name', 'Access', 'Description'],
    s['mia-registers.json'].registers.map(r => [code(r.hex), code(r.name), r.access, r.description]))},

  {file: 'mia-commands.md', title: 'MIA commands', sources: ['mia-commands.json'], render: s => table(
    ['Id', 'Command'],
    s['mia-commands.json'].commands.map(c => [code(c.hex), code(`MIA_CMD_${c.name}`)]))},

  {file: 'mia-errors.md', title: 'MIA error codes', sources: ['mia-errors.json'], render: s => table(
    ['Code', 'Name', 'Description'],
    s['mia-errors.json'].errors.map(e => [code(e.hex), code(e.name), e.description]))},

  {file: 'mia-status.md', title: 'MIA status bits', sources: ['mia-status.json'], render: s => table(
    ['Bit', 'Register', 'Name', 'Description'],
    s['mia-status.json'].bits.map(b => [b.bit, code(b.bit < 8 ? 'STATUS_L' : 'STATUS_H'), code(b.name), b.description]))},

  {file: 'mia-irq.md', title: 'MIA IRQ bits', sources: ['mia-irq.json'], render: s => table(
    ['Bit', 'Register', 'Name', 'Description'],
    s['mia-irq.json'].bits.map(b => [b.bit, code(b.bit < 8 ? 'IRQ_STATUS_L' : 'IRQ_STATUS_H'), code(b.name), b.description]))},

  {file: 'mia-config.md', title: 'MIA configuration fields', sources: ['mia-config.json'], render: s => {
    const c = s['mia-config.json'];
    return [table(['Id', 'Name', 'Description'], c.fields.map(f => [code(f.hex), code(`CFG_${f.name}`), f.description])),
      '', `Reserved ids: ${c.reserved.map(code).join(', ')}.`].join('\n');
  }},

  {file: 'mia-indexes.md', title: 'MIA index descriptors', sources: ['mia-indexes.json'], render: s => {
    const x = s['mia-indexes.json'];
    const ids = e => range(e.id, e.count ?? 1, 2);
    const reset = d => (d ? `${hex(d.start)}, ${count(d.length)}${d.stride ? `, +${bytes(d.stride)} per id` : ''}` : '');
    return [table(['Ids', 'Owner', 'Name', 'Reset address and length', 'Description'],
      x.ids.map(e => [code(ids(e)), e.owner, e.name ? code(e.name) : '', reset(e.default), e.description])),
    '', 'Flag bits (`CFG_IDXA_FLAGS`, `CFG_IDXB_FLAGS`):', '',
    table(['Bit', 'Mask', 'Name', 'Description'], bitRows(x.flagBits, 'IDX_FLAG_'))].join('\n');
  }},

  {file: 'mia-ram-map.md', title: 'MIA RAM map', sources: ['mia-ram-map.json'], render: s => table(
    ['Range', 'Size', 'Block', 'Owner', 'Description'],
    s['mia-ram-map.json'].blocks.map(b => [code(b.range), bytes(b.size), code(b.name), b.owner, b.description]))},

  {file: 'mia-video-ram.md', title: 'Video block', sources: ['video.json', 'mia-ram-map.json'], render: s => {
    const block = s['mia-ram-map.json'].blocks.find(b => b.name === 'VIDEO');
    return table(['Range', 'Size', 'Region', 'Sent to the client', 'Description'],
      s['video.json'].regions.map(r => [code(range(block.start + r.start, r.size, 5)), bytes(r.size), code(r.name), r.syncable ? 'yes' : 'no', r.description]));
  }},

  {file: 'mia-video-palette.md', title: 'Default palette', sources: ['video.json'], render: s => {
    const p = s['video.json'].palettes.default;
    const rgb = v => `#${[[11, 31], [5, 63], [0, 31]].map(([shift, max]) => Math.round((((v >> shift) & max) * 255) / max).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    return [`MIA's ${code(p.name)} palette, loaded into palette RAM when video starts. Color 1 of each bank is its text ink.`, '',
      table(['Bank', 'Ink', 'Ink RGB565', 'Ink as RGB', 'Colors 0-7 (RGB565)'],
        p.colors.map((bank, i) => [i, p.inks[i], code(hex(bank[1], 4)), code(rgb(bank[1])), bank.map(c => code(hex(c, 4))).join(' ')]))].join('\n');
  }},

  {file: 'mia-video-render-control.md', title: 'Video render control page', sources: ['video.json'], render: s => {
    const rc = s['video.json'].renderControl;
    return [table(['Address', 'Size', 'Field', 'Description'],
      rc.fields.map(f => [code(range(f.address, f.size, 5)), f.size, fieldName(`MIA_VIDEO_${f.name.replace(/^VIDEO_/, '')}_OFFSET`, 1), f.description])),
    '', 'Video mode bits (`MIA_VIDEO_MODE_OFFSET`):', '', table(['Bit', 'Mask', 'Name', 'Description'], bitRows(rc.modeBits, 'MIA_VIDEO_MODE_')),
    '', 'Layer enable bits (`MIA_VIDEO_LAYER_ENABLE_OFFSET`):', '', table(['Bit', 'Mask', 'Name', 'Description'], bitRows(rc.layerBits, 'MIA_VIDEO_LAYER_'))].join('\n');
  }},

  {file: 'mia-storage.md', title: 'SD and filesystem control block', sources: ['storage.json'], render: s => {
    const st = s['storage.json'], control = st.regions.find(r => r.name === 'CONTROL'), entry = st.regions.find(r => r.name === 'DIR_ENTRY');
    const values = (list, prefix) => table(['Value', 'Name', 'Description'], list.map(v => [v.id, code(`${prefix}${v.name}`), v.description]));
    return [`Control block at ${code(range(control.start, control.size, 5))} (index ${code('MIA_SD_INDEX_CONTROL')}):`, '',
      table(['Offset', 'Size', 'Access', 'Field', 'Description'], st.controlFields.map(f => [code(hex(f.offset)), f.size, f.access, fieldName(`MIA_SD_CONTROL_${f.name}`, f.size), f.description])),
      '', 'Status bits (`MIA_SD_CONTROL_STATUS`):', '', table(['Bit', 'Mask', 'Name', 'Description'], bitRows(st.statusBits, 'MIA_SD_STATUS_')),
      '', 'Card types (`MIA_SD_CONTROL_CARD_TYPE`):', '', values(st.cardTypes, 'MIA_SD_CARD_'),
      '', 'Open modes (`MIA_SD_CONTROL_OPEN_MODE`):', '', values(st.openModes, 'MIA_FS_OPEN_'),
      '', `Directory entry at ${code(range(entry.start, entry.size, 5))} (index ${code('MIA_FS_INDEX_DIR_ENTRY')}):`, '',
      table(['Offset', 'Size', 'Field', 'Description'], st.dirEntryFields.map(f => [code(hex(f.offset)), f.size, fieldName(`MIA_FS_DIR_${f.name}`, f.size), f.description])),
      '', 'Attribute bits (`MIA_FS_DIR_ATTR`):', '', table(['Bit', 'Mask', 'Name', 'Description'], bitRows(st.dirAttributeBits, 'MIA_FS_DIR_ATTR_'))].join('\n');
  }},

  {file: 'mia-audio.md', title: 'Audio block', sources: ['audio.json', 'mia-ram-map.json'], render: s => {
    const a = s['audio.json'], block = s['mia-ram-map.json'].blocks.find(b => b.name === 'AUDIO');
    const offsets = (o, prefix) => table(['Offset', 'Field'], Object.entries(o).map(([k, v]) => [code(hex(v)), code(`${prefix}${k}`)]));
    const bits = (o, prefix) => table(['Bit', 'Name'], Object.entries(o).map(([k, v]) => [v, code(`${prefix}${k}`)]));
    return [`The audio block starts at ${code(hex(block.start))}: a ${a.headerBytes}-byte header, then ${a.voices} voice records of ${a.voiceRecordBytes} bytes.`, '',
      'Header:', '', offsets(a.headerOffsets, 'MIA_AUDIO_HEADER_'),
      '', 'Header status bits:', '', bits(a.headerStatusBits, 'MIA_AUDIO_STATUS_'),
      '', 'Header flag bits:', '', bits(a.headerFlagBits, 'MIA_AUDIO_FLAG_'),
      '', 'Voice record:', '', offsets(a.voiceOffsets, 'MIA_AUDIO_VOICE_'),
      '', 'Voice control bits:', '', bits(a.controlBits, 'MIA_AUDIO_CONTROL_'),
      '', 'Waveforms:', '', table(['Value', 'Name'], a.waveforms.map(w => [w.id, code(`MIA_AUDIO_WAVE_${w.name.toUpperCase()}`)])),
      '', 'Sequencer opcodes:', '', table(['Opcode', 'Name', 'Payload', 'Effect'], a.sequencer.opcodes.map(o => [code(hex(o.id)), code(`MIA_SEQ_OP_${o.name}`), o.payload.join(', '), o.effect]))].join('\n');
  }},

  {file: 'kernel-abi.md', title: 'Kernel jump table', sources: ['kernel-abi.json'], render: s => table(
    ['Address', 'Entry'],
    s['kernel-abi.json'].entries.map(e => [code(e.hex), code(e.symbol)]))},

  {file: 'cpu-memory-map.md', title: 'CPU memory map', sources: ['cpu-memory-map.json'], render: s => {
    const m = s['cpu-memory-map.json'];
    const out = [table(['Range', 'Size', 'Region', 'Description'], m.regions.map(r => [code(r.range), bytes(r.size), code(r.name), r.description])),
      '', 'I/O slots:', '', table(['Range', 'Select', 'Device', 'Description'], m.io.slots.map(x => [code(x.range), code(x.select), x.device ?? 'free', x.description])),
      '', 'VIA registers (repeating every 16 bytes in slot 0):', '', table(['Address', 'Name', 'Description'], m.via.registers.map(r => [code(r.hex), code(r.name), r.description]))];
    for (const page of m.pages) {
      out.push('', `${page.name.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase())} (${code(range(page.start, page.size, 4))}):`, '',
        table(['Range', 'Block', 'Owner', 'Description'], page.blocks.map(b => [code(b.range), code(b.name), b.owner, b.description])));
      if (page.locations?.length) out.push('', table(['Address', 'Size', 'Name', 'Owner', 'Description'],
        page.locations.map(l => [code(l.hex), l.size, [l, ...(l.aliases ?? [])].filter(n => n.name).map(n => code(n.name)).join(', '), l.owner, l.description])));
    }
    return out.join('\n');
  }},

  {file: 'basic-keywords.md', title: 'BASIC keywords', sources: ['basic.json'], render: s => table(
    ['Keyword', 'Kind', 'Syntax', 'Summary'],
    s['basic.json'].keywords.entries.map(k => [code(k.keyword), k.kind, code(k.syntax), k.summary]))},

  {file: 'basic-errors.md', title: 'BASIC error messages', sources: ['basic.json'], render: s => {
    const e = s['basic.json'].errors, f = e.format;
    return [table(['Code', 'Name', 'Message', 'Raised when'], e.entries.map(x => [code(hex(x.code)), code(x.name), code(`${f.prefix}${x.message}${f.suffix}`), x.trigger])),
      '', 'Other messages:', '', table(['Message', 'Printed when'], e.messages.map(m => [code(m.text), m.trigger]))].join('\n');
  }},
];

// ---------------------------------------------------------------------------------------------
// Main

export function renderTable(t, specs) {
  return [`<!-- Generated by tools/generate-tables.mjs from clementina-sdk specs/${t.sources.join(', specs/')}. Do not edit. -->`, '',
    `### ${t.title}`, '', t.render(specs), ''].join('\n');
}

function readSpecs(sdkDir, commit) {
  const git = args => execFileSync('git', ['-C', sdkDir, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26});
  try { git(['cat-file', '-e', `${commit}^{commit}`]); } catch {
    throw Error(`clementina-sdk at ${sdkDir} does not have the pinned commit ${commit.slice(0, 7)}; fetch it first.`);
  }
  const names = [...new Set(TABLES.flatMap(t => t.sources))];
  return Object.fromEntries(names.map(name => {
    try { return [name, JSON.parse(git(['show', `${commit}:specs/${name}`]))]; } catch (error) {
      throw Error(`specs/${name} at ${commit.slice(0, 7)}: ${error.stderr?.toString().trim() || error.message}`);
    }
  }));
}

function main(argv) {
  const at = argv.indexOf('--sdk');
  const sdkDir = at >= 0 ? path.resolve(argv[at + 1]) : path.resolve(root, '..', 'clementina-sdk');
  const pin = JSON.parse(readFileSync(path.join(root, 'manifest.json'), 'utf8')).repositories.find(r => r.name === 'clementina-sdk');
  const specs = readSpecs(sdkDir, pin.commit);
  const files = new Map(TABLES.map(t => [t.file, renderTable(t, specs)]));
  if (argv.includes('--check')) {
    const stale = [...files].filter(([file, text]) => { try { return readFileSync(path.join(tablesDir, file), 'utf8') !== text; } catch { return true; } }).map(([file]) => file);
    const extra = readdirSync(tablesDir).filter(f => f.endsWith('.md') && f !== 'README.md' && !files.has(f));
    if (stale.length || extra.length) throw Error(`tables/ is stale (${[...stale, ...extra].join(', ')}); run node tools/generate-tables.mjs`);
    console.log(`tables/: ${files.size} tables match clementina-sdk ${pin.commit.slice(0, 7)}.`);
    return;
  }
  mkdirSync(tablesDir, {recursive: true});
  for (const f of readdirSync(tablesDir)) if (f.endsWith('.md') && f !== 'README.md' && !files.has(f)) rmSync(path.join(tablesDir, f));
  for (const [file, text] of files) writeFileSync(path.join(tablesDir, file), text);
  console.log(`Wrote ${files.size} tables from clementina-sdk ${pin.commit.slice(0, 7)}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
