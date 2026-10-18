# Appendix G: 65C02 opcode matrix

This table shows every opcode of the W65C02S. Find the high hex digit of the opcode in the left column and the low digit in the top row. For example, $A9 is LDA # (LDA immediate). Each instruction is described in [The 65C02 instruction set](../ml/instructions.md).

## Key

| Abbreviation | Addressing mode | Bytes | Example |
| --- | --- | --- | --- |
| imp | Implied | 1 | `INX` |
| A | Accumulator | 1 | `ASL A` |
| # | Immediate | 2 | `LDA #$12` |
| zp | Zero page | 2 | `LDA $12` |
| zp,X | Zero page,X | 2 | `LDA $12,X` |
| zp,Y | Zero page,Y | 2 | `LDX $12,Y` |
| abs | Absolute | 3 | `LDA $1234` |
| abs,X | Absolute,X | 3 | `LDA $1234,X` |
| abs,Y | Absolute,Y | 3 | `LDA $1234,Y` |
| (zp,X) | (Zero page,X) | 2 | `LDA ($12,X)` |
| (zp),Y | (Zero page),Y | 2 | `LDA ($12),Y` |
| (zp) | (Zero page) | 2 | `LDA ($12)` |
| (abs) | (Absolute) | 3 | `JMP ($1234)` |
| (abs,X) | (Absolute,X) | 3 | `JMP ($1234,X)` |
| rel | Relative | 2 | `BNE label` |
| zp,rel | Zero page + relative | 3 | `BBR3 $12,label` |
| stk | Stack | 1 | `PHA` |

A cell with `-` is an unused opcode. 65C02 additions are listed in the instruction chapter.

## Matrix

| | x0 | x1 | x2 | x3 | x4 | x5 | x6 | x7 | x8 | x9 | xA | xB | xC | xD | xE | xF |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **0x** | BRK stk | ORA (zp,X) | - | - | TSB zp | ORA zp | ASL zp | RMB0 zp | PHP stk | ORA # | ASL A | - | TSB abs | ORA abs | ASL abs | BBR0 zp,rel |
| **1x** | BPL rel | ORA (zp),Y | ORA (zp) | - | TRB zp | ORA zp,X | ASL zp,X | RMB1 zp | CLC imp | ORA abs,Y | INC A | - | TRB abs | ORA abs,X | ASL abs,X | BBR1 zp,rel |
| **2x** | JSR abs | AND (zp,X) | - | - | BIT zp | AND zp | ROL zp | RMB2 zp | PLP stk | AND # | ROL A | - | BIT abs | AND abs | ROL abs | BBR2 zp,rel |
| **3x** | BMI rel | AND (zp),Y | AND (zp) | - | BIT zp,X | AND zp,X | ROL zp,X | RMB3 zp | SEC imp | AND abs,Y | DEC A | - | BIT abs,X | AND abs,X | ROL abs,X | BBR3 zp,rel |
| **4x** | RTI stk | EOR (zp,X) | - | - | - | EOR zp | LSR zp | RMB4 zp | PHA stk | EOR # | LSR A | - | JMP abs | EOR abs | LSR abs | BBR4 zp,rel |
| **5x** | BVC rel | EOR (zp),Y | EOR (zp) | - | - | EOR zp,X | LSR zp,X | RMB5 zp | CLI imp | EOR abs,Y | PHY stk | - | - | EOR abs,X | LSR abs,X | BBR5 zp,rel |
| **6x** | RTS stk | ADC (zp,X) | - | - | STZ zp | ADC zp | ROR zp | RMB6 zp | PLA stk | ADC # | ROR A | - | JMP (abs) | ADC abs | ROR abs | BBR6 zp,rel |
| **7x** | BVS rel | ADC (zp),Y | ADC (zp) | - | STZ zp,X | ADC zp,X | ROR zp,X | RMB7 zp | SEI imp | ADC abs,Y | PLY stk | - | JMP (abs,X) | ADC abs,X | ROR abs,X | BBR7 zp,rel |
| **8x** | BRA rel | STA (zp,X) | - | - | STY zp | STA zp | STX zp | SMB0 zp | DEY imp | BIT # | TXA imp | - | STY abs | STA abs | STX abs | BBS0 zp,rel |
| **9x** | BCC rel | STA (zp),Y | STA (zp) | - | STY zp,X | STA zp,X | STX zp,Y | SMB1 zp | TYA imp | STA abs,Y | TXS imp | - | STZ abs | STA abs,X | STZ abs,X | BBS1 zp,rel |
| **Ax** | LDY # | LDA (zp,X) | LDX # | - | LDY zp | LDA zp | LDX zp | SMB2 zp | TAY imp | LDA # | TAX imp | - | LDY abs | LDA abs | LDX abs | BBS2 zp,rel |
| **Bx** | BCS rel | LDA (zp),Y | LDA (zp) | - | LDY zp,X | LDA zp,X | LDX zp,Y | SMB3 zp | CLV imp | LDA abs,Y | TSX imp | - | LDY abs,X | LDA abs,X | LDX abs,Y | BBS3 zp,rel |
| **Cx** | CPY # | CMP (zp,X) | - | - | CPY zp | CMP zp | DEC zp | SMB4 zp | INY imp | CMP # | DEX imp | WAI imp | CPY abs | CMP abs | DEC abs | BBS4 zp,rel |
| **Dx** | BNE rel | CMP (zp),Y | CMP (zp) | - | - | CMP zp,X | DEC zp,X | SMB5 zp | CLD imp | CMP abs,Y | PHX stk | STP imp | - | CMP abs,X | DEC abs,X | BBS5 zp,rel |
| **Ex** | CPX # | SBC (zp,X) | - | - | CPX zp | SBC zp | INC zp | SMB6 zp | INX imp | SBC # | NOP imp | - | CPX abs | SBC abs | INC abs | BBS6 zp,rel |
| **Fx** | BEQ rel | SBC (zp),Y | SBC (zp) | - | - | SBC zp,X | INC zp,X | SMB7 zp | SED imp | SBC abs,Y | PLX stk | - | - | SBC abs,X | INC abs,X | BBS7 zp,rel |

## Unused opcodes

The W65C02S has no illegal opcodes. Each of the 44 unused opcodes acts as a NOP of 1, 2 or 3 bytes. The CPU skips the extra bytes and continues after them. Registers, flags and memory do not change.

| Opcodes | Bytes | Cycles |
| --- | --- | --- |
| $03, $0B, $13, $1B, $23, $2B, $33, $3B, $43, $4B, $53, $5B, $63, $6B, $73, $7B, $83, $8B, $93, $9B, $A3, $AB, $B3, $BB, $C3, $D3, $E3, $EB, $F3, $FB | 1 | 1 |
| $02, $22, $42, $62, $82, $C2, $E2 | 2 | 2 |
| $44 | 2 | 3 |
| $54, $D4, $F4 | 2 | 4 |
| $DC, $FC | 3 | 4 |
| $5C | 3 | 8 |

Apart from WAI ($CB) and STP ($DB), the x3 and xB columns are one-byte, one-cycle NOPs. Do not use any unused opcode in a program.

Clementina's emulator treats every unused opcode as a one-byte, two-cycle NOP, the same as $EA. A program that runs an unused opcode with operand bytes can therefore behave differently in the emulator and on the real machine.
