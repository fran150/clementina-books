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

/**
 * The 256 glyphs as an inline SVG grid in the text color, row = high nibble, column = low nibble.
 * Each glyph is its rows as hex, top first; bit 0 of a row is the leftmost pixel.
 */
export function glyphChart(glyphs, name) {
  const cell = 10, left = 16, top = 8, size = 16 * cell, nibble = n => n.toString(16).toUpperCase();
  const pixels = glyphs.flatMap((rows, tile) => [...Buffer.from(rows, 'hex')].flatMap((bits, y) => {
    const runs = [], x0 = left + (tile % 16) * cell + 1, y0 = top + Math.floor(tile / 16) * cell + 1 + y;
    for (let x = 0; x < 8; x++) if (bits & (1 << x)) {
      let w = 1;
      while (x + w < 8 && bits & (1 << (x + w))) w++;
      runs.push(`M${x0 + x} ${y0}h${w}v1h-${w}z`);
      x += w;
    }
    return runs;
  }));
  const grid = Array.from({length: 17}, (_, i) => `M${left + i * cell} ${top}v${size}M${left} ${top + i * cell}h${size}`).join('');
  const label = (x, y, text, anchor) => `<text x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
  const labels = Array.from({length: 16}, (_, i) => label(left + i * cell + cell / 2, top - 2, nibble(i), 'middle') + label(left - 2, top + i * cell + 7, `$${nibble(i)}_`, 'end')).join('');
  return [`<div class="charset-chart">`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${left + size + 1} ${top + size + 1}" width="100%" style="max-width:36rem" role="img" aria-label="The ${name} character set: 256 glyphs, 16 to a row">`,
    `<g font-family="monospace" font-size="5" fill="currentColor">${labels}</g>`,
    `<path d="${grid}" stroke="currentColor" stroke-opacity="0.25" stroke-width="0.25" fill="none"/>`,
    `<path d="${pixels.join('')}" fill="currentColor"/>`,
    `</svg>`, `</div>`].join('\n');
}

/** The key that types `tile` in glyph `mode` of the screen editor, or null. */
export function keyFor(tile, mode, modes) {
  const key = (((tile - mode * modes.step) % 256) + 256) % 256;
  return key >= modes.firstKey && key <= modes.lastKey ? key : null;
}
/** The lowest glyph mode that types `tile`, with its key, or null. */
export function typedBy(tile, modes) {
  for (let mode = 0; mode < modes.count; mode++) if (keyFor(tile, mode, modes) !== null) return {mode, key: keyFor(tile, mode, modes)};
  return null;
}
/** Sorted numbers as runs of consecutive values, each [first, last]. */
const runs = list => list.reduce((out, n) => (out.length && out.at(-1)[1] === n - 1 ? (out.at(-1)[1] = n) : out.push([n, n]), out), []);
const keyName = key => (key === 0x20 ? 'Space' : String.fromCharCode(key).replace(/[!-\/:-@[-`{}~]/g, '\\$&'));

// ---------------------------------------------------------------------------------------------
// SDK file formats (specs/schema/*.json) and asset limits (specs/assets.json)

/** The schemas the SDK & Studio Guide documents, in the book's order: [anchor, file]. */
export const SCHEMAS = [
  ['project', 'project.schema.json'], ['palette', 'palette.schema.json'],
  ['palette-config', 'palette-config.schema.json'], ['tileset', 'tileset.schema.json'],
  ['background', 'background.schema.json'], ['overlay', 'overlay.schema.json'],
  ['shape', 'shape.schema.json'], ['animation', 'animation.schema.json'],
  ['instrument', 'instrument.schema.json'], ['sound', 'sound.schema.json'],
  ['song', 'song.schema.json'], ['load-plan', 'load-plan.schema.json'],
];

/** A schema node's type, as words: `string`, `integer or null`, `array of object`. */
function schemaType(node) {
  if ('const' in node) return typeof node.const === 'number' ? 'integer' : typeof node.const;
  if (node.enum) return [...new Set(node.enum.map(v => (typeof v === 'number' ? 'integer' : typeof v)))].join(' or ');
  const alts = node.anyOf ?? node.oneOf;
  if (alts && !node.type) return [...new Set(alts.map(schemaType))].join(' or ');
  if (node.type === 'array') return node.items ? `array of ${schemaType(node.items)}` : 'array';
  return Array.isArray(node.type) ? node.type.join(' or ') : node.type ?? 'any';
}

/** A schema node's own rules: fixed value, choices, pattern, range, length, item count. */
function schemaRule(node) {
  // Hex only where a range reaches into addresses ($8000 up), as in a load address or a MIA RAM offset.
  const wide = node.minimum >= 0 && node.maximum >= 0x8000, out = [], num = n => (wide && n >= 0x100 ? `${n} (${hex(n)})` : `${n}`);
  if ('const' in node) out.push(`always ${code(JSON.stringify(node.const))}`);
  if (node.enum) out.push(`one of ${node.enum.map(v => code(JSON.stringify(v))).join(', ')}`);
  if (node.pattern) out.push(`matches ${code(node.pattern)}`);
  if (node.minimum !== undefined && node.maximum !== undefined) out.push(`${num(node.minimum)} to ${num(node.maximum)}`);
  else if (node.minimum !== undefined) out.push(`at least ${num(node.minimum)}`);
  else if (node.maximum !== undefined) out.push(`at most ${num(node.maximum)}`);
  const len = (lo, hi, unit) => (lo === 1 && hi === undefined ? 'not empty' : lo !== undefined && hi !== undefined ? (lo === hi ? `exactly ${lo} ${unit}` : `${lo} to ${hi} ${unit}`)
    : lo !== undefined ? `at least ${lo} ${unit}` : hi !== undefined ? `at most ${hi} ${unit}` : null);
  const chars = len(node.minLength, node.maxLength, 'characters'), items = len(node.minItems, node.maxItems, 'items');
  if (chars) out.push(chars);
  if (items) out.push(items);
  if (node.uniqueItems) out.push('no duplicates');
  if (node.type === 'array' && node.items && node.items.type !== 'object' && node.items.type !== 'array') { const r = schemaRule(node.items); if (r) out.push(`each ${r}`); }
  const alts = node.anyOf ?? node.oneOf;
  if (alts && !node.type && alts.every(a => !a.properties)) for (const a of alts) { const r = schemaRule(a); if (r) out.push(`${schemaType(a)}: ${r}`); }
  if (node.propertyNames?.pattern) out.push(`names match ${code(node.propertyNames.pattern)}`);
  return out.join('; ');
}

/** Every field of a schema as rows [path, type, required, rule]; nested objects and arrays use `a.b`, `a[]`. */
export function schemaRows(node, prefix = '', required = true) {
  const rows = [];
  if (prefix) rows.push([code(prefix), schemaType(node), required ? 'yes' : '', schemaRule(node)]);
  const object = node.type === 'object' || node.properties;
  if (object) {
    const req = new Set(node.required ?? []);
    for (const [name, child] of Object.entries(node.properties ?? {})) rows.push(...schemaRows(child, prefix ? `${prefix}.${name}` : name, req.has(name)));
    const extra = node.additionalProperties;
    if (extra && typeof extra === 'object') rows.push(...schemaRows(extra, `${prefix}.<name>`, false));
    const choice = node.anyOf?.filter(a => a.required);
    if (choice?.length) rows.push([code(prefix || '(top level)'), '', '', `needs at least one of ${choice.flatMap(a => a.required).map(code).join(', ')}`]);
  }
  if (node.type === 'array' && node.items) {
    const item = node.items, branches = item.oneOf ?? item.anyOf;
    if (branches?.some(b => b.properties)) {
      for (const b of branches) {
        const kind = b.properties?.kind?.const;
        rows.push(...schemaRows({...b, required: b.required}, `${prefix}[${kind ? `kind=${kind}` : ''}]`, true).slice(1));
      }
    } else if (item.type === 'object' || item.type === 'array') rows.push(...schemaRows(item, `${prefix}[]`, true).slice(1));
  }
  return rows;
}

/** What each `specs/assets.json` constraint means; a constraint missing here fails generation. */
export const ASSET_LIMITS = {
  paletteColors: 'Colors in a palette',
  paletteBanks: 'Palette banks in palette RAM (and in a palette config)',
  tilesetBytes: 'Bytes in one tileset (one CHR bank)',
  tilesPerTileset: 'Tiles in a tileset (per plane at 1bpp)',
  tilesetBpp: 'Bits per pixel a tileset may use',
  maxSpritesPerShape: 'Sprites in one shape',
  maxShapesPerProject: 'Shapes in a project',
  maxAnimationsPerProject: 'Animations in a project',
  animationTickHz: 'Animation ticks per second',
  maxFramesPerAnimation: 'Frames in one animation',
  maxBackgroundsPerProject: 'Backgrounds in a project',
  maxBackgroundDimension: 'Cells across or down a background',
  maxBackgroundCells: 'Cells in one background',
  maxOverlaysPerProject: 'Overlays in a project',
  overlayColumns: 'Overlay columns',
  overlayRows: 'Overlay rows',
  overlayCells: 'Overlay cells',
  maxInstrumentsPerProject: 'Instruments in a project',
  maxSoundsPerProject: 'Sound effects in a project',
  maxSongsPerProject: 'Songs in a project',
  maxSoundFrames: 'Frames in one sound effect',
  soundFrameHz: 'Sound effect frames per second',
  maxSongSteps: 'Steps in one song',
  songVoices: 'Voices in a song',
  songStepsPerBeat: 'Steps per beat a song may use',
  songBpm: 'Song tempo, beats per minute (lowest, highest)',
  audioTickHz: 'MIA audio sample rate (Hz)',
};

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

  {file: 'charset.md', title: 'Character set', sources: ['video.json'], render: s => {
    const cs = s['video.json'].chr.default, gm = cs.glyphModes, nibble = n => n.toString(16).toUpperCase();
    const typing = Array.from({length: 16}, (_, row) => [code(`$${nibble(row)}_`), ...Array.from({length: 16}, (__, col) => {
      const t = typedBy(row * 16 + col, gm);
      return t ? `${t.mode} ${keyName(t.key)}` : '';
    })]);
    const tiles = cs.kernelTiles.map(k => [code(range(k.code, k.count, 2)), code(k.name), k.description]);
    const also = Array.from({length: gm.count - 1}, (_, i) => i + 1).flatMap(mode => runs(Array.from({length: 256}, (__, c) => c).filter(c => typedBy(c, gm)?.mode < mode && keyFor(c, mode, gm) !== null))
      .map(([first, last]) => `Mode ${mode} also types ${code(range(first, last - first + 1, 2))}, with the keys ${keyName(keyFor(first, mode, gm))} to ${keyName(keyFor(last, mode, gm))}.`));
    return [`MIA's ${code(cs.name)} character set, bank ${cs.glyphBank} plane ${cs.plane}: tile N is the glyph for character code N. Bank ${cs.reverseBank} holds the same glyphs reversed, drawn for a cell with ${code('CHR_ALT')} set.`, '',
      glyphChart(cs.glyphs, cs.name), '',
      `How the screen editor types each code: the glyph mode (${code('ESC M')} steps it, ${code('ESC SPACE')} returns to 0), then the key. In mode m a key types its character code plus ${code(hex(gm.step))} times m, wrapping past ${code('$FF')}. An empty cell can't be typed.`, '',
      table(['Code', ...Array.from({length: 16}, (_, i) => code(`_${nibble(i)}`))], typing),
      ...(also.length ? ['', also.join(' ')] : []),
      '', 'Tiles the kernel draws as the editor cursor:', '', table(['Codes', 'Name', 'Use'], tiles)].join('\n');
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

  {file: 'mia-input.md', title: 'Input block', sources: ['input.json'], render: s => {
    const i = s['input.json'];
    return [table(['Range', 'Size', 'Region', 'Description'], i.regions.map(r => [code(range(r.start, r.size, 5)), r.size, code(r.name),
      r.hidUsagePage !== undefined ? `HID usage page ${code(hex(r.hidUsagePage, 4))} bitmap: usage N is bit N & 7 of byte N >> 3.` : ''])),
    '', `Gamepad record (${i.gamepads.recordBytes} bytes, ${i.gamepads.count} slots):`, '',
    table(['Offset', 'Field', 'Description'], i.gamepads.fields.map(f => [code(hex(f.offset)), code(f.name),
      f.description ?? (f.directionBits ? `D-pad: ${Object.entries(f.directionBits).map(([k, v]) => `bit ${v} ${k}`).join(', ')}; bit ${f.connectedBit} connected.` : f.type)])),
    '', `${code(i.status.register)} bits (${code('$FFF2')}):`, '', table(['Bit', 'Mask', 'Name', 'Description'], bitRows(i.status.bits))].join('\n');
  }},

  {file: 'mia-video-attributes.md', title: 'Video attribute bits', sources: ['video.json'], render: s => {
    const a = s['video.json'].attributes, bits = ([lo, hi]) => (lo === hi ? `${lo}` : `${lo}-${hi}`);
    const rows = o => Object.entries(o).map(([k, v]) => [Array.isArray(v) ? bits(v) : v, code(k.replace(/Bits?$/, ''))]).sort((x, y) => parseInt(x[0]) - parseInt(y[0]));
    return ['Background and overlay attribute byte:', '', table(['Bits', 'Field'], rows(a.backgroundOverlay)),
      '', 'Sprite `ATTR` byte (OAM byte 3):', '', table(['Bits', 'Field'], rows(a.spriteAttr)),
      '', 'Sprite `EXT` byte (OAM byte 4):', '', table(['Bits', 'Field'], rows(a.spriteExt))].join('\n');
  }},

  {file: 'kernel-abi.md', title: 'Kernel jump table', sources: ['kernel-abi.json'], render: s => {
    const abi = s['kernel-abi.json'];
    return [table(['Address', 'Entry', 'Description'], abi.entries.map(e => [code(e.hex), code(e.symbol), e.description])),
      '', `The ${code('BAS_')} entries jump to BASIC's own routines (${abi.entries.filter(e => e.target).map(e => code(e.target)).join(', ')}), so they work only while BASIC is in memory.`].join('\n');
  }},

  {file: 'cpu-memory-map.md', title: 'CPU memory map', sources: ['cpu-memory-map.json'], render: s => {
    const m = s['cpu-memory-map.json'];
    // Each part sits between mdBook anchors, so a chapter can include only its own part:
    // {{#include ../../tables/cpu-memory-map.md:zero-page}}.
    const part = (anchor, lines) => [`<!-- ANCHOR: ${anchor} -->`, ...lines, `<!-- ANCHOR_END: ${anchor} -->`];
    const out = [...part('regions', [table(['Range', 'Size', 'Region', 'Description'], m.regions.map(r => [code(r.range), bytes(r.size), code(r.name), r.description]))]),
      '', ...part('io-slots', ['I/O slots:', '', table(['Range', 'Select', 'Device', 'Description'], m.io.slots.map(x => [code(x.range), code(x.select), x.device ?? 'free', x.description]))]),
      '', ...part('via', ['VIA registers (repeating every 16 bytes in slot 0):', '', table(['Address', 'Name', 'Description'], m.via.registers.map(r => [code(r.hex), code(r.name), r.description]))])];
    for (const page of m.pages) {
      const lines = [`${page.name.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase())} (${code(range(page.start, page.size, 4))}):`, '',
        table(['Range', 'Block', 'Owner', 'Description'], page.blocks.map(b => [code(b.range), code(b.name), b.owner, b.description]))];
      if (page.locations?.length) lines.push('', table(['Address', 'Size', 'Name', 'Owner', 'Description'],
        page.locations.map(l => [code(l.hex), l.size, [l, ...(l.aliases ?? [])].filter(n => n.name).map(n => code(n.name)).join(', '), l.owner, l.description])));
      out.push('', ...part(page.name.toLowerCase().replace(/_/g, '-'), lines));
    }
    return out.join('\n');
  }},

  {file: 'labels.md', title: 'Labels by name', sources: ['cpu-memory-map.json', 'kernel-abi.json', 'mia-registers.json', 'mia-config.json', 'mia-indexes.json', 'mia-commands.json', 'mia-ram-map.json', 'video.json', 'input.json', 'storage.json', 'audio.json'], render: s => {
    const rows = [], add = (name, value, space) => rows.push([name, value, space]);
    const m = s['cpu-memory-map.json'];
    for (const page of m.pages) for (const l of page.locations ?? []) for (const n of [l, ...(l.aliases ?? [])]) if (n.name) add(n.name, hex(n.address ?? l.address, 2 + 2 * ((n.address ?? l.address) > 0xFF)), 'CPU');
    for (const r of m.via.registers) add(r.name, r.hex, 'CPU');
    for (const e of s['kernel-abi.json'].entries) add(e.symbol, e.hex, 'CPU');
    for (const r of s['mia-registers.json'].registers) if (!r.name.startsWith('RESERVED')) add(r.name, r.hex, 'CPU');
    for (const f of s['mia-config.json'].fields) add(`CFG_${f.name}`, f.hex, 'CFG field');
    for (const e of s['mia-indexes.json'].ids) if (e.name) add(e.name, range(e.id, e.count ?? 1, 2), 'Index id');
    for (const c of s['mia-commands.json'].commands) add(`MIA_CMD_${c.name}`, c.hex, 'Command');
    for (const b of s['mia-ram-map.json'].blocks) if (b.owner !== 'firmware') add(b.name, range(b.start, b.size, 5), 'MIA RAM');
    for (const r of s['video.json'].regions) add(r.name, range(r.start, r.size, 5), 'MIA RAM');
    for (const f of s['video.json'].renderControl.fields) add(`MIA_VIDEO_${f.name.replace(/^VIDEO_/, '')}_OFFSET`, hex(f.address, 5), 'MIA RAM');
    for (const r of s['input.json'].regions) add(r.name, range(r.start, r.size, 5), 'MIA RAM');
    const st = s['storage.json'], control = st.regions.find(r => r.name === 'CONTROL');
    for (const f of st.controlFields) add(`MIA_SD_CONTROL_${f.name}`, range(control.start + f.offset, f.size, 5), 'MIA RAM');
    const audio = s['mia-ram-map.json'].blocks.find(b => b.name === 'AUDIO');
    for (const [k, v] of Object.entries(s['audio.json'].headerOffsets)) add(`MIA_AUDIO_HEADER_${k}`, hex(audio.start + v, 5), 'MIA RAM');
    const seen = new Set(), unique = rows.filter(r => !seen.has(r.join()) && seen.add(r.join()));
    unique.sort((a, b) => a[0].localeCompare(b[0], 'en') || a[1].localeCompare(b[1]));
    return [`Every name the specs give an address, id or offset, in alphabetical order. CPU addresses are in the 6502's 64 KiB, MIA RAM addresses in MIA's 256 KiB, and the other spaces are numbered separately.`, '',
      table(['Name', 'Value', 'Space'], unique.map(([n, v, sp]) => [code(n), code(v), sp]))].join('\n');
  }},

  {file: 'basic-keywords.md', title: 'BASIC keywords', sources: ['basic.json'], render: s => table(
    ['Keyword', 'Kind', 'Syntax', 'Summary'],
    s['basic.json'].keywords.entries.map(k => [code(k.keyword), k.kind, code(k.syntax), k.summary]))},

  {file: 'basic-tokens.md', title: 'BASIC tokens', sources: ['basic.json'], render: s => {
    const t = s['basic.json'].tokens;
    const rows = [
      ...t.primary.map((k, i) => [code(k), hex(t.primaryStart + i), String(t.primaryStart + i)]),
      ...Object.entries(t.special).map(([k, v]) => [code(k), hex(v), String(v)]),
      ...[[t.extension, t.extensionPrefix], [t.extension2, t.extension2Prefix], [t.extensionFunction, t.extensionFunctionPrefix]]
        .flatMap(([list, prefix]) => list.map((k, i) => [code(k), `${hex(prefix)} ${hex(t.extensionSubtokenStart + i)}`, `${prefix} ${t.extensionSubtokenStart + i}`])),
    ];
    return table(['Keyword', 'Token', 'Decimal'], rows);
  }},
  {file: 'basic-errors.md', title: 'BASIC error messages', sources: ['basic.json'], render: s => {
    const e = s['basic.json'].errors, f = e.format;
    return [table(['Code', 'Name', 'Message', 'Raised when'], e.entries.map(x => [code(hex(x.code)), code(x.name), code(`${f.prefix}${x.message}${f.suffix}`), x.trigger])),
      '', 'Other messages:', '', table(['Message', 'Printed when'], e.messages.map(m => [code(m.text), m.trigger]))].join('\n');
  }},

  {file: 'sdk-schemas.md', title: 'Project and asset file fields', sources: SCHEMAS.map(([, f]) => `schema/${f}`), render: s =>
    SCHEMAS.flatMap(([anchor, f]) => {
      const schema = s[`schema/${f}`];
      return [`<!-- ANCHOR: ${anchor} -->`, `#### ${schema.title}`, '', `\`${f}\`${schema.properties?.format?.const ? `, format ${code(schema.properties.format.const)}` : ''}`, '',
        table(['Field', 'Type', 'Required', 'Rule'], schemaRows(schema)), `<!-- ANCHOR_END: ${anchor} -->`, ''];
    }).join('\n').trimEnd()},

  {file: 'sdk-asset-limits.md', title: 'Asset limits', sources: ['assets.json'], render: s => {
    const a = s['assets.json'], value = v => (Array.isArray(v) ? v.join(', ') : bytes(v));
    const unknown = Object.keys(a.constraints).filter(k => !ASSET_LIMITS[k]);
    if (unknown.length) throw Error(`assets.json constraints without a label in ASSET_LIMITS: ${unknown.join(', ')}`);
    return [table(['Limit', 'Value', 'Spec name'], Object.entries(a.constraints).map(([k, v]) => [ASSET_LIMITS[k], value(v), code(k)])),
      '', `Asset file formats (portable format version ${a.portableFormatVersion}):`, '',
      table(['Asset', '`format`'], Object.entries(a.formats).map(([k, v]) => [k, code(v)]))].join('\n');
  }},

  {file: 'sdk-automation.md', title: 'Emulator automation methods', sources: ['emulator-automation.json'], render: s => {
    const x = s['emulator-automation.json'], t = x.transport, lim = x.policyLimits;
    return [`Transport: ${t.protocol} ${t.method} to ${code(t.path)} on ${code(t.bind)}; the port is chosen at start (${code('--port 0')} picks a free one).`,
      `Every request carries ${x.request.required.map(code).join(' and ')}; optional fields are ${x.request.optional.map(code).join(', ')}; unknown fields are rejected.`,
      '', table(['Method', 'Parameters', 'Result', 'Behavior'],
        Object.entries(x.methods).map(([n, m]) => [code(n), (m.params ?? []).map(code).join(', '), m.result, m.behavior ?? ''])),
      '', 'Limits:', '', table(['Limit', 'Value'], Object.entries(lim).map(([k, v]) => [code(k), bytes(v)])),
      '', `Stop reasons: ${x.execution.stopReasons.map(code).join(', ')}.`].join('\n');
  }},
];

// ---------------------------------------------------------------------------------------------
// Main

export function renderTable(t, specs) {
  return [`<!-- Generated by tools/generate-tables.mjs from clementina-sdk specs/${t.sources.join(', specs/')}. Do not edit. -->`, '',
    `### ${t.title}`, '', t.render(specs), ''].join('\n');
}

export function readSpecs(sdkDir, commit, names = [...new Set(TABLES.flatMap(t => t.sources))]) {
  const git = args => execFileSync('git', ['-C', sdkDir, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26});
  try { git(['cat-file', '-e', `${commit}^{commit}`]); } catch {
    throw Error(`clementina-sdk at ${sdkDir} does not have the pinned commit ${commit.slice(0, 7)}; fetch it first.`);
  }
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
