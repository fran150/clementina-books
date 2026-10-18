# The 65C02 instruction set

This chapter lists every instruction of the WDC W65C02S, the CPU in
Clementina. The entries are in alphabetical order. For the same
information sorted by opcode, see
[Appendix G: 65C02 opcode matrix](../appendix/opcodes.md).

The W65C02S runs all programs written for the NMOS 6502, the CPU of the
Apple II and, as the 6510, of the Commodore 64. It adds instructions and
addressing modes. An entry marks these additions with "65C02". The
undocumented NMOS opcodes, such as LAX, do not exist on the 65C02.

## How to read an entry

Each entry has:

- the mnemonic and its name,
- the operation in a short notation, such as `A + M + C -> A`,
- a description, with any 65C02 differences,
- the flags the instruction changes,
- a table with one row for each addressing mode.

In the operation, `A`, `X` and `Y` are the registers, `M` is the memory
byte the instruction uses, `S` is the stack pointer, `P` is the status
register and `PC` is the program counter. `->` means "goes to".

The table columns are:

| Column | Meaning |
| --- | --- |
| Addressing mode | How the instruction finds its operand. |
| Assembler form | An example in ca65 syntax. |
| Opcode | The first byte of the instruction, in hex. |
| Bytes | The length of the instruction, including the opcode. |
| Cycles | Clock cycles, from the WDC W65C02S datasheet. |

A cycle count may carry a note:

- **(+1)** after an indexed mode: one more cycle if adding the index
  crosses a page boundary, for example from $12FF to $1300.
- **(+1/+2)** after a branch: one more cycle if the branch is taken, and
  one more again if the target is on another page.

With ca65, start the source with `.setcpu "65C02"`, as Clementina's
tools do. Recent ca65 releases accept WAI and STP only after
`.setcpu "W65C02"`.

## Addressing modes

In the assembler forms, `$12` stands for any zero page address and
`$1234` for any address. `label` is a branch target.

| Mode | Form | Bytes | Operand |
| --- | --- | --- | --- |
| Immediate | `LDA #$12` | 2 | The byte after the opcode. |
| Zero page | `LDA $12` | 2 | The byte at $0012. |
| Zero page,X | `LDA $12,X` | 2 | The byte at $12 + X. The sum wraps within page zero. |
| Zero page,Y | `LDX $12,Y` | 2 | The byte at $12 + Y, wrapping within page zero. Only LDX and STX. |
| Absolute | `LDA $1234` | 3 | The byte at $1234. |
| Absolute,X | `LDA $1234,X` | 3 | The byte at $1234 + X. |
| Absolute,Y | `LDA $1234,Y` | 3 | The byte at $1234 + Y. |
| (Zero page,X) | `LDA ($12,X)` | 2 | Add X to $12, read a pointer there, use the byte it points to. |
| (Zero page),Y | `LDA ($12),Y` | 2 | Read a pointer at $12, add Y, use that byte. |
| (Zero page) | `LDA ($12)` | 2 | 65C02. Read a pointer at $12, use the byte it points to. |
| (Absolute) | `JMP ($1234)` | 3 | Jump to the address stored at $1234. Only JMP. |
| (Absolute,X) | `JMP ($1234,X)` | 3 | 65C02. Jump to the address stored at $1234 + X. Only JMP. |
| Relative | `BNE label` | 2 | A signed offset from -128 to +127, counted from the next instruction. |
| Implied | `INX` | 1 | The instruction names its operand. |
| Accumulator | `ASL A` | 1 | The accumulator. |
| Zero page + relative | `BBR3 $12,label` | 3 | 65C02. A zero page byte to test, then a relative offset. Only BBR and BBS. |
| Stack | `PHA` | 1 | The stack in page one, at $0100 + S. |

Pointers are two bytes, low byte first. A zero page pointer at $FF takes
its high byte from $00.

## The status register

| Bit | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Flag | N | V | - | B | D | I | Z | C |

| Flag | Name | Meaning |
| --- | --- | --- |
| N | Negative | Bit 7 of the result. |
| V | Overflow | A signed add or subtract went out of range. BIT copies bit 6 here. |
| - | Unused | Always reads as 1. |
| B | Break | Only in the copy pushed on the stack: 1 for BRK and PHP, 0 for IRQ and NMI. |
| D | Decimal | ADC and SBC work in BCD when 1. Reset, interrupts and BRK clear it. |
| I | Interrupt disable | IRQ is masked when 1. Reset and interrupts set it. |
| Z | Zero | The result was 0. |
| C | Carry | Carry out of an add or shift, or "no borrow" after a subtract or compare. |

"Flags" in an entry lists the flags that change. All others keep their
value.

## ADC

**Add with carry** · `A + M + C -> A, C`

Adds memory and the carry to the accumulator. Clear C with CLC before a single add. In decimal mode (D = 1) the add is in BCD. On the 65C02, N and Z are valid after a decimal add; on the NMOS 6502 they were not. The (Zero page) form is a 65C02 addition.

**Flags:** N V Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `ADC #$12` | $69 | 2 | 2 |
| Zero page | `ADC $12` | $65 | 2 | 3 |
| Zero page,X | `ADC $12,X` | $75 | 2 | 4 |
| Absolute | `ADC $1234` | $6D | 3 | 4 |
| Absolute,X | `ADC $1234,X` | $7D | 3 | 4 (+1) |
| Absolute,Y | `ADC $1234,Y` | $79 | 3 | 4 (+1) |
| (Zero page,X) | `ADC ($12,X)` | $61 | 2 | 6 |
| (Zero page),Y | `ADC ($12),Y` | $71 | 2 | 5 (+1) |
| (Zero page) | `ADC ($12)` | $72 | 2 | 5 |

In decimal mode (D = 1) every form takes one more cycle.

## AND

**AND memory with accumulator** · `A AND M -> A`

Clears each bit of the accumulator that is 0 in memory. The (Zero page) form is a 65C02 addition.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `AND #$12` | $29 | 2 | 2 |
| Zero page | `AND $12` | $25 | 2 | 3 |
| Zero page,X | `AND $12,X` | $35 | 2 | 4 |
| Absolute | `AND $1234` | $2D | 3 | 4 |
| Absolute,X | `AND $1234,X` | $3D | 3 | 4 (+1) |
| Absolute,Y | `AND $1234,Y` | $39 | 3 | 4 (+1) |
| (Zero page,X) | `AND ($12,X)` | $21 | 2 | 6 |
| (Zero page),Y | `AND ($12),Y` | $31 | 2 | 5 (+1) |
| (Zero page) | `AND ($12)` | $32 | 2 | 5 |

## ASL

**Arithmetic shift left** · `C <- [76543210] <- 0`

Shifts the accumulator or memory one bit left. Bit 7 goes to C and bit 0 becomes 0. On the 65C02 the Absolute,X form takes 6 cycles unless a page is crossed; on the NMOS 6502 it always took 7.

**Flags:** N Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Accumulator | `ASL A` | $0A | 1 | 2 |
| Zero page | `ASL $12` | $06 | 2 | 5 |
| Zero page,X | `ASL $12,X` | $16 | 2 | 6 |
| Absolute | `ASL $1234` | $0E | 3 | 6 |
| Absolute,X | `ASL $1234,X` | $1E | 3 | 6 (+1) |

## BBR

**Branch on bit reset** · `Branch if bit b of M = 0`

65C02. BBR0 to BBR7 test bit 0 to 7 of a zero page byte and branch to *label* if that bit is 0. The bit number is part of the mnemonic. The target must be within -128 to +127 bytes of the next instruction. These are WDC and Rockwell instructions; some other CMOS 65C02 chips lack them.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page + relative | `BBR0 $12,label` | $0F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBR1 $12,label` | $1F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBR2 $12,label` | $2F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBR3 $12,label` | $3F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBR4 $12,label` | $4F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBR5 $12,label` | $5F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBR6 $12,label` | $6F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBR7 $12,label` | $7F | 3 | 5 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BBS

**Branch on bit set** · `Branch if bit b of M = 1`

65C02. BBS0 to BBS7 test bit 0 to 7 of a zero page byte and branch to *label* if that bit is 1. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page + relative | `BBS0 $12,label` | $8F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBS1 $12,label` | $9F | 3 | 5 (+1/+2) |
| Zero page + relative | `BBS2 $12,label` | $AF | 3 | 5 (+1/+2) |
| Zero page + relative | `BBS3 $12,label` | $BF | 3 | 5 (+1/+2) |
| Zero page + relative | `BBS4 $12,label` | $CF | 3 | 5 (+1/+2) |
| Zero page + relative | `BBS5 $12,label` | $DF | 3 | 5 (+1/+2) |
| Zero page + relative | `BBS6 $12,label` | $EF | 3 | 5 (+1/+2) |
| Zero page + relative | `BBS7 $12,label` | $FF | 3 | 5 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BCC

**Branch on carry clear** · `Branch if C = 0`

Branches to *label* if C = 0. The target must be within -128 to +127 bytes of the next instruction. After a compare, BCC branches if the register was less than memory.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BCC label` | $90 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BCS

**Branch on carry set** · `Branch if C = 1`

Branches to *label* if C = 1. The target must be within -128 to +127 bytes of the next instruction. After a compare, BCS branches if the register was greater than or equal to memory.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BCS label` | $B0 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BEQ

**Branch on equal** · `Branch if Z = 1`

Branches to *label* if Z = 1. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BEQ label` | $F0 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BIT

**Test bits** · `A AND M -> Z, M7 -> N, M6 -> V`

Sets Z if A AND M is 0. Neither A nor memory changes. Bits 7 and 6 of memory are copied to N and V. The Immediate form affects only Z, since there is no memory byte to copy from. The Immediate, Zero page,X and Absolute,X forms are 65C02 additions.

**Flags:** N V Z (Immediate: Z only)

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `BIT #$12` | $89 | 2 | 2 |
| Zero page | `BIT $12` | $24 | 2 | 3 |
| Zero page,X | `BIT $12,X` | $34 | 2 | 4 |
| Absolute | `BIT $1234` | $2C | 3 | 4 |
| Absolute,X | `BIT $1234,X` | $3C | 3 | 4 (+1) |

## BMI

**Branch on minus** · `Branch if N = 1`

Branches to *label* if N = 1. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BMI label` | $30 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BNE

**Branch on not equal** · `Branch if Z = 0`

Branches to *label* if Z = 0. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BNE label` | $D0 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BPL

**Branch on plus** · `Branch if N = 0`

Branches to *label* if N = 0. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BPL label` | $10 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BRA

**Branch always** · `Branch always`

65C02. Always branches to *label*. It is one byte shorter than JMP and the code stays relocatable. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BRA label` | $80 | 2 | 3 (+1) |

Add 1 cycle if the target is on another page.

## BRK

**Break** · `PC + 2 -> stack, P -> stack, ($FFFE) -> PC`

Starts an interrupt from software. The CPU pushes the address of BRK plus 2 and the status with B = 1, sets I, and jumps through the IRQ/BRK vector at $FFFE. The byte after BRK is skipped, so it is often used as a signature byte. An IRQ handler tells BRK from IRQ by testing B in the pushed status. On the 65C02, BRK also clears D; on the NMOS 6502, D was left alone.

**Flags:** B (pushed copy only), I = 1, D = 0

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `BRK` | $00 | 1 | 7 |

## BVC

**Branch on overflow clear** · `Branch if V = 0`

Branches to *label* if V = 0. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BVC label` | $50 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## BVS

**Branch on overflow set** · `Branch if V = 1`

Branches to *label* if V = 1. The target must be within -128 to +127 bytes of the next instruction.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Relative | `BVS label` | $70 | 2 | 2 (+1/+2) |

Add 1 cycle if the branch is taken, and 1 more if the target is on another page.

## CLC

**Clear carry** · `0 -> C`

Clears the carry flag. Use it before ADC.

**Flags:** C = 0

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `CLC` | $18 | 1 | 2 |

## CLD

**Clear decimal mode** · `0 -> D`

Selects binary arithmetic for ADC and SBC.

**Flags:** D = 0

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `CLD` | $D8 | 1 | 2 |

## CLI

**Clear interrupt disable** · `0 -> I`

Allows IRQ interrupts. NMI is never masked.

**Flags:** I = 0

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `CLI` | $58 | 1 | 2 |

## CLV

**Clear overflow** · `0 -> V`

Clears the overflow flag. There is no SEV.

**Flags:** V = 0

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `CLV` | $B8 | 1 | 2 |

## CMP

**Compare with accumulator** · `A - M`

Subtracts memory from A without storing the result. C = 1 if A >= M, Z = 1 if A = M, and N is bit 7 of the difference. The (Zero page) form is a 65C02 addition.

**Flags:** N Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `CMP #$12` | $C9 | 2 | 2 |
| Zero page | `CMP $12` | $C5 | 2 | 3 |
| Zero page,X | `CMP $12,X` | $D5 | 2 | 4 |
| Absolute | `CMP $1234` | $CD | 3 | 4 |
| Absolute,X | `CMP $1234,X` | $DD | 3 | 4 (+1) |
| Absolute,Y | `CMP $1234,Y` | $D9 | 3 | 4 (+1) |
| (Zero page,X) | `CMP ($12,X)` | $C1 | 2 | 6 |
| (Zero page),Y | `CMP ($12),Y` | $D1 | 2 | 5 (+1) |
| (Zero page) | `CMP ($12)` | $D2 | 2 | 5 |

## CPX

**Compare with X** · `X - M`

Compares X with memory, like CMP does with A.

**Flags:** N Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `CPX #$12` | $E0 | 2 | 2 |
| Zero page | `CPX $12` | $E4 | 2 | 3 |
| Absolute | `CPX $1234` | $EC | 3 | 4 |

## CPY

**Compare with Y** · `Y - M`

Compares Y with memory, like CMP does with A.

**Flags:** N Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `CPY #$12` | $C0 | 2 | 2 |
| Zero page | `CPY $12` | $C4 | 2 | 3 |
| Absolute | `CPY $1234` | $CC | 3 | 4 |

## DEC

**Decrement** · `M - 1 -> M, or A - 1 -> A`

Subtracts 1 from memory or the accumulator. C is not changed. The Accumulator form (DEC A) is a 65C02 addition.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Accumulator | `DEC A` | $3A | 1 | 2 |
| Zero page | `DEC $12` | $C6 | 2 | 5 |
| Zero page,X | `DEC $12,X` | $D6 | 2 | 6 |
| Absolute | `DEC $1234` | $CE | 3 | 6 |
| Absolute,X | `DEC $1234,X` | $DE | 3 | 7 |

## DEX

**Decrement X** · `X - 1 -> X`

Subtracts 1 from X.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `DEX` | $CA | 1 | 2 |

## DEY

**Decrement Y** · `Y - 1 -> Y`

Subtracts 1 from Y.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `DEY` | $88 | 1 | 2 |

## EOR

**Exclusive OR with accumulator** · `A XOR M -> A`

Flips each bit of the accumulator that is 1 in memory. EOR #$FF inverts A. The (Zero page) form is a 65C02 addition.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `EOR #$12` | $49 | 2 | 2 |
| Zero page | `EOR $12` | $45 | 2 | 3 |
| Zero page,X | `EOR $12,X` | $55 | 2 | 4 |
| Absolute | `EOR $1234` | $4D | 3 | 4 |
| Absolute,X | `EOR $1234,X` | $5D | 3 | 4 (+1) |
| Absolute,Y | `EOR $1234,Y` | $59 | 3 | 4 (+1) |
| (Zero page,X) | `EOR ($12,X)` | $41 | 2 | 6 |
| (Zero page),Y | `EOR ($12),Y` | $51 | 2 | 5 (+1) |
| (Zero page) | `EOR ($12)` | $52 | 2 | 5 |

## INC

**Increment** · `M + 1 -> M, or A + 1 -> A`

Adds 1 to memory or the accumulator. C is not changed. The Accumulator form (INC A) is a 65C02 addition.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Accumulator | `INC A` | $1A | 1 | 2 |
| Zero page | `INC $12` | $E6 | 2 | 5 |
| Zero page,X | `INC $12,X` | $F6 | 2 | 6 |
| Absolute | `INC $1234` | $EE | 3 | 6 |
| Absolute,X | `INC $1234,X` | $FE | 3 | 7 |

## INX

**Increment X** · `X + 1 -> X`

Adds 1 to X.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `INX` | $E8 | 1 | 2 |

## INY

**Increment Y** · `Y + 1 -> Y`

Adds 1 to Y.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `INY` | $C8 | 1 | 2 |

## JMP

**Jump** · `Address -> PC`

Continues execution at a new address. The (Absolute) form reads the target from a two-byte pointer. On the NMOS 6502, a pointer at $xxFF read its high byte from $xx00; the 65C02 fixes this and takes one more cycle. The (Absolute,X) form is a 65C02 addition. It reads the pointer at address + X and suits jump tables.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Absolute | `JMP $1234` | $4C | 3 | 3 |
| (Absolute) | `JMP ($1234)` | $6C | 3 | 6 |
| (Absolute,X) | `JMP ($1234,X)` | $7C | 3 | 6 |

## JSR

**Jump to subroutine** · `PC + 2 -> stack, address -> PC`

Pushes the address of its own last byte, high byte first, and jumps. RTS returns to the instruction after the JSR.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Absolute | `JSR $1234` | $20 | 3 | 6 |

## LDA

**Load accumulator** · `M -> A`

Loads the accumulator from memory. The (Zero page) form is a 65C02 addition.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `LDA #$12` | $A9 | 2 | 2 |
| Zero page | `LDA $12` | $A5 | 2 | 3 |
| Zero page,X | `LDA $12,X` | $B5 | 2 | 4 |
| Absolute | `LDA $1234` | $AD | 3 | 4 |
| Absolute,X | `LDA $1234,X` | $BD | 3 | 4 (+1) |
| Absolute,Y | `LDA $1234,Y` | $B9 | 3 | 4 (+1) |
| (Zero page,X) | `LDA ($12,X)` | $A1 | 2 | 6 |
| (Zero page),Y | `LDA ($12),Y` | $B1 | 2 | 5 (+1) |
| (Zero page) | `LDA ($12)` | $B2 | 2 | 5 |

## LDX

**Load X** · `M -> X`

Loads X from memory.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `LDX #$12` | $A2 | 2 | 2 |
| Zero page | `LDX $12` | $A6 | 2 | 3 |
| Zero page,Y | `LDX $12,Y` | $B6 | 2 | 4 |
| Absolute | `LDX $1234` | $AE | 3 | 4 |
| Absolute,Y | `LDX $1234,Y` | $BE | 3 | 4 (+1) |

## LDY

**Load Y** · `M -> Y`

Loads Y from memory.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `LDY #$12` | $A0 | 2 | 2 |
| Zero page | `LDY $12` | $A4 | 2 | 3 |
| Zero page,X | `LDY $12,X` | $B4 | 2 | 4 |
| Absolute | `LDY $1234` | $AC | 3 | 4 |
| Absolute,X | `LDY $1234,X` | $BC | 3 | 4 (+1) |

## LSR

**Logical shift right** · `0 -> [76543210] -> C`

Shifts the accumulator or memory one bit right. Bit 0 goes to C and bit 7 becomes 0, so N is always cleared. The Absolute,X form takes 6 cycles unless a page is crossed.

**Flags:** N = 0, Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Accumulator | `LSR A` | $4A | 1 | 2 |
| Zero page | `LSR $12` | $46 | 2 | 5 |
| Zero page,X | `LSR $12,X` | $56 | 2 | 6 |
| Absolute | `LSR $1234` | $4E | 3 | 6 |
| Absolute,X | `LSR $1234,X` | $5E | 3 | 6 (+1) |

## NOP

**No operation** · `No operation`

Does nothing for two cycles. On the W65C02S, every opcode not listed in this chapter also acts as a NOP, but some of them are 2 or 3 bytes long. See [Appendix G](../appendix/opcodes.md). Do not use them on purpose.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `NOP` | $EA | 1 | 2 |

## ORA

**OR memory with accumulator** · `A OR M -> A`

Sets each bit of the accumulator that is 1 in memory. The (Zero page) form is a 65C02 addition.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `ORA #$12` | $09 | 2 | 2 |
| Zero page | `ORA $12` | $05 | 2 | 3 |
| Zero page,X | `ORA $12,X` | $15 | 2 | 4 |
| Absolute | `ORA $1234` | $0D | 3 | 4 |
| Absolute,X | `ORA $1234,X` | $1D | 3 | 4 (+1) |
| Absolute,Y | `ORA $1234,Y` | $19 | 3 | 4 (+1) |
| (Zero page,X) | `ORA ($12,X)` | $01 | 2 | 6 |
| (Zero page),Y | `ORA ($12),Y` | $11 | 2 | 5 (+1) |
| (Zero page) | `ORA ($12)` | $12 | 2 | 5 |

## PHA

**Push accumulator** · `A -> stack`

Pushes A onto the stack.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PHA` | $48 | 1 | 3 |

## PHP

**Push status** · `P -> stack`

Pushes the status register. The pushed copy has B = 1 and bit 5 = 1.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PHP` | $08 | 1 | 3 |

## PHX

**Push X** · `X -> stack`

65C02. Pushes X onto the stack.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PHX` | $DA | 1 | 3 |

## PHY

**Push Y** · `Y -> stack`

65C02. Pushes Y onto the stack.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PHY` | $5A | 1 | 3 |

## PLA

**Pull accumulator** · `stack -> A`

Pulls A from the stack.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PLA` | $68 | 1 | 4 |

## PLP

**Pull status** · `stack -> P`

Pulls the status register from the stack. B and bit 5 are not real flags and are ignored.

**Flags:** N V D I Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PLP` | $28 | 1 | 4 |

## PLX

**Pull X** · `stack -> X`

65C02. Pulls X from the stack.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PLX` | $FA | 1 | 4 |

## PLY

**Pull Y** · `stack -> Y`

65C02. Pulls Y from the stack.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `PLY` | $7A | 1 | 4 |

## RMB

**Reset memory bit** · `0 -> bit b of M`

65C02. RMB0 to RMB7 clear bit 0 to 7 of a zero page byte. The other bits do not change. These are WDC and Rockwell instructions.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `RMB0 $12` | $07 | 2 | 5 |
| Zero page | `RMB1 $12` | $17 | 2 | 5 |
| Zero page | `RMB2 $12` | $27 | 2 | 5 |
| Zero page | `RMB3 $12` | $37 | 2 | 5 |
| Zero page | `RMB4 $12` | $47 | 2 | 5 |
| Zero page | `RMB5 $12` | $57 | 2 | 5 |
| Zero page | `RMB6 $12` | $67 | 2 | 5 |
| Zero page | `RMB7 $12` | $77 | 2 | 5 |

## ROL

**Rotate left** · `C <- [76543210] <- C`

Rotates the accumulator or memory one bit left through the carry. The old C goes into bit 0 and bit 7 goes to C. The Absolute,X form takes 6 cycles unless a page is crossed.

**Flags:** N Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Accumulator | `ROL A` | $2A | 1 | 2 |
| Zero page | `ROL $12` | $26 | 2 | 5 |
| Zero page,X | `ROL $12,X` | $36 | 2 | 6 |
| Absolute | `ROL $1234` | $2E | 3 | 6 |
| Absolute,X | `ROL $1234,X` | $3E | 3 | 6 (+1) |

## ROR

**Rotate right** · `C -> [76543210] -> C`

Rotates the accumulator or memory one bit right through the carry. The old C goes into bit 7 and bit 0 goes to C. The Absolute,X form takes 6 cycles unless a page is crossed.

**Flags:** N Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Accumulator | `ROR A` | $6A | 1 | 2 |
| Zero page | `ROR $12` | $66 | 2 | 5 |
| Zero page,X | `ROR $12,X` | $76 | 2 | 6 |
| Absolute | `ROR $1234` | $6E | 3 | 6 |
| Absolute,X | `ROR $1234,X` | $7E | 3 | 6 (+1) |

## RTI

**Return from interrupt** · `stack -> P, stack -> PC`

Pulls the status register, then the return address, and continues there. Unlike RTS, it does not add 1 to the address.

**Flags:** N V D I Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `RTI` | $40 | 1 | 6 |

## RTS

**Return from subroutine** · `stack -> PC, PC + 1 -> PC`

Pulls the address that JSR pushed, adds 1, and continues there.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Stack | `RTS` | $60 | 1 | 6 |

## SBC

**Subtract with borrow** · `A - M - (1 - C) -> A, C`

Subtracts memory and the borrow from the accumulator. The borrow is the inverse of C, so set C with SEC before a single subtract. After SBC, C = 0 means a borrow happened. In decimal mode the subtract is in BCD, and N and Z are valid on the 65C02. The (Zero page) form is a 65C02 addition.

**Flags:** N V Z C

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Immediate | `SBC #$12` | $E9 | 2 | 2 |
| Zero page | `SBC $12` | $E5 | 2 | 3 |
| Zero page,X | `SBC $12,X` | $F5 | 2 | 4 |
| Absolute | `SBC $1234` | $ED | 3 | 4 |
| Absolute,X | `SBC $1234,X` | $FD | 3 | 4 (+1) |
| Absolute,Y | `SBC $1234,Y` | $F9 | 3 | 4 (+1) |
| (Zero page,X) | `SBC ($12,X)` | $E1 | 2 | 6 |
| (Zero page),Y | `SBC ($12),Y` | $F1 | 2 | 5 (+1) |
| (Zero page) | `SBC ($12)` | $F2 | 2 | 5 |

In decimal mode (D = 1) every form takes one more cycle.

## SEC

**Set carry** · `1 -> C`

Sets the carry flag. Use it before SBC.

**Flags:** C = 1

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `SEC` | $38 | 1 | 2 |

## SED

**Set decimal mode** · `1 -> D`

Selects BCD arithmetic for ADC and SBC. Interrupts and BRK clear D on the 65C02, so a handler always starts in binary mode.

**Flags:** D = 1

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `SED` | $F8 | 1 | 2 |

## SEI

**Set interrupt disable** · `1 -> I`

Masks IRQ interrupts. NMI still occurs.

**Flags:** I = 1

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `SEI` | $78 | 1 | 2 |

## SMB

**Set memory bit** · `1 -> bit b of M`

65C02. SMB0 to SMB7 set bit 0 to 7 of a zero page byte. The other bits do not change. These are WDC and Rockwell instructions.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `SMB0 $12` | $87 | 2 | 5 |
| Zero page | `SMB1 $12` | $97 | 2 | 5 |
| Zero page | `SMB2 $12` | $A7 | 2 | 5 |
| Zero page | `SMB3 $12` | $B7 | 2 | 5 |
| Zero page | `SMB4 $12` | $C7 | 2 | 5 |
| Zero page | `SMB5 $12` | $D7 | 2 | 5 |
| Zero page | `SMB6 $12` | $E7 | 2 | 5 |
| Zero page | `SMB7 $12` | $F7 | 2 | 5 |

## STA

**Store accumulator** · `A -> M`

Stores the accumulator in memory. The indexed forms always take the extra cycle. The (Zero page) form is a 65C02 addition.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `STA $12` | $85 | 2 | 3 |
| Zero page,X | `STA $12,X` | $95 | 2 | 4 |
| Absolute | `STA $1234` | $8D | 3 | 4 |
| Absolute,X | `STA $1234,X` | $9D | 3 | 5 |
| Absolute,Y | `STA $1234,Y` | $99 | 3 | 5 |
| (Zero page,X) | `STA ($12,X)` | $81 | 2 | 6 |
| (Zero page),Y | `STA ($12),Y` | $91 | 2 | 6 |
| (Zero page) | `STA ($12)` | $92 | 2 | 5 |

## STP

**Stop the processor** · `Stop`

65C02 (WDC). Stops the clock inside the CPU. Only a reset starts it again. Interrupts are ignored.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `STP` | $DB | 1 | 3 |

## STX

**Store X** · `X -> M`

Stores X in memory.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `STX $12` | $86 | 2 | 3 |
| Zero page,Y | `STX $12,Y` | $96 | 2 | 4 |
| Absolute | `STX $1234` | $8E | 3 | 4 |

## STY

**Store Y** · `Y -> M`

Stores Y in memory.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `STY $12` | $84 | 2 | 3 |
| Zero page,X | `STY $12,X` | $94 | 2 | 4 |
| Absolute | `STY $1234` | $8C | 3 | 4 |

## STZ

**Store zero** · `0 -> M`

65C02. Stores 0 in memory without using a register.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `STZ $12` | $64 | 2 | 3 |
| Zero page,X | `STZ $12,X` | $74 | 2 | 4 |
| Absolute | `STZ $1234` | $9C | 3 | 4 |
| Absolute,X | `STZ $1234,X` | $9E | 3 | 5 |

## TAX

**Transfer A to X** · `A -> X`

Copies A to X.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `TAX` | $AA | 1 | 2 |

## TAY

**Transfer A to Y** · `A -> Y`

Copies A to Y.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `TAY` | $A8 | 1 | 2 |

## TRB

**Test and reset bits** · `A AND M -> Z, (NOT A) AND M -> M`

65C02. Sets Z as BIT does, then clears in memory each bit that is 1 in A. A does not change.

**Flags:** Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `TRB $12` | $14 | 2 | 5 |
| Absolute | `TRB $1234` | $1C | 3 | 6 |

## TSB

**Test and set bits** · `A AND M -> Z, A OR M -> M`

65C02. Sets Z as BIT does, then sets in memory each bit that is 1 in A. A does not change.

**Flags:** Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Zero page | `TSB $12` | $04 | 2 | 5 |
| Absolute | `TSB $1234` | $0C | 3 | 6 |

## TSX

**Transfer stack pointer to X** · `S -> X`

Copies the stack pointer to X.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `TSX` | $BA | 1 | 2 |

## TXA

**Transfer X to A** · `X -> A`

Copies X to A.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `TXA` | $8A | 1 | 2 |

## TXS

**Transfer X to stack pointer** · `X -> S`

Copies X to the stack pointer. This is the only way to set S. Flags do not change.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `TXS` | $9A | 1 | 2 |

## TYA

**Transfer Y to A** · `Y -> A`

Copies Y to A.

**Flags:** N Z

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `TYA` | $98 | 1 | 2 |

## WAI

**Wait for interrupt** · `Wait`

65C02 (WDC). Stops the CPU until an IRQ or NMI arrives. With I = 0 the interrupt is taken as usual. With I = 1 an IRQ does not call the handler; execution simply continues after WAI.

**Flags:** None

| Addressing mode | Assembler form | Opcode | Bytes | Cycles |
| --- | --- | --- | --- | --- |
| Implied | `WAI` | $CB | 1 | 3 |
