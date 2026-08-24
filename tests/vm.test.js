/**
 * @jest-environment node
 *
 * Unit tests for the MiniASM VM (interpreter.js).
 * Run in Node so that interpreter uses default config (no window.MiniASMConfig).
 */
const path = require('path');
const MiniASM = require(path.join(__dirname, '../js/interpreter.js'));

const {
  createMachine,
  loadProgram,
  execute,
  run,
  parseInstruction,
  NUM_REGISTERS,
  MEMORY_SIZE,
  REG_NAMES,
  INST,
} = MiniASM;

describe('MiniASM VM', () => {
  describe('constants and config', () => {
    it('exposes NUM_REGISTERS (default 4)', () => {
      expect(NUM_REGISTERS).toBe(4);
    });
    it('exposes MEMORY_SIZE (default 64)', () => {
      expect(MEMORY_SIZE).toBe(64);
    });
    it('exposes REG_NAMES as array of r0, r1, ...', () => {
      expect(REG_NAMES).toEqual(['r0', 'r1', 'r2', 'r3']);
    });
    it('exposes INST with all opcodes', () => {
      expect(INST).toHaveProperty('SET');
      expect(INST).toHaveProperty('INC');
      expect(INST).toHaveProperty('DEC');
      expect(INST).toHaveProperty('ISZ');
      expect(INST).toHaveProperty('ISN');
      expect(INST).toHaveProperty('ADD');
      expect(INST).toHaveProperty('SUB');
      expect(INST).toHaveProperty('SWP');
      expect(INST).toHaveProperty('MUL');
      expect(INST).toHaveProperty('POW');
      expect(INST).toHaveProperty('CMP');
      expect(INST).toHaveProperty('STP');
      expect(INST).toHaveProperty('JMP');
      expect(INST).toHaveProperty('JEQ');
      expect(INST).toHaveProperty('JLT');
      expect(INST).toHaveProperty('JGT');
      expect(INST).toHaveProperty('JGE');
      expect(INST).toHaveProperty('JLE');
    });
  });

  describe('parseInstruction', () => {
    it('parses SET with register and memory address', () => {
      const instr = parseInstruction('SET r0 @5');
      expect(instr.opcode).toBe('SET');
      expect(instr.operands).toHaveLength(2);
      expect(instr.operands[0]).toEqual({ type: 'Register', value: 0 });
      expect(instr.operands[1]).toEqual({ type: 'MemoryAddress', value: 5 });
    });
    it('parses SET with register and immediate', () => {
      const instr = parseInstruction('SET r1 #42');
      expect(instr.opcode).toBe('SET');
      expect(instr.operands[1]).toEqual({ type: 'Immediate', value: 42 });
    });
    it('parses INC rN', () => {
      const instr = parseInstruction('INC r2');
      expect(instr.opcode).toBe('INC');
      expect(instr.operands[0]).toEqual({ type: 'Register', value: 2 });
    });
    it('parses DEC rN', () => {
      const instr = parseInstruction('DEC r0');
      expect(instr.opcode).toBe('DEC');
      expect(instr.operands[0]).toEqual({ type: 'Register', value: 0 });
    });
    it('parses ISZ and ISN', () => {
      expect(parseInstruction('ISZ r3').opcode).toBe('ISZ');
      expect(parseInstruction('ISN r1').opcode).toBe('ISN');
    });
    it('parses ADD rX rY', () => {
      const instr = parseInstruction('ADD r0 r1');
      expect(instr.opcode).toBe('ADD');
      expect(instr.operands[0].value).toBe(0);
      expect(instr.operands[1].value).toBe(1);
    });
    it('parses SUB rX rY', () => {
      const instr = parseInstruction('SUB r0 r1');
      expect(instr.opcode).toBe('SUB');
      expect(instr.operands[0].value).toBe(0);
      expect(instr.operands[1].value).toBe(1);
    });
    it('parses SWP rX rY', () => {
      const instr = parseInstruction('SWP r2 r3');
      expect(instr.opcode).toBe('SWP');
      expect(instr.operands[0].value).toBe(2);
      expect(instr.operands[1].value).toBe(3);
    });
    it('parses MUL and POW', () => {
      expect(parseInstruction('MUL r2 r3').opcode).toBe('MUL');
      expect(parseInstruction('POW r0 r1').opcode).toBe('POW');
    });
    it('parses CMP rX rY', () => {
      const instr = parseInstruction('CMP r0 r1');
      expect(instr.opcode).toBe('CMP');
      expect(instr.operands[0].value).toBe(0);
      expect(instr.operands[1].value).toBe(1);
    });
    it('parses conditional jumps (JEQ, JLT, JGT, JGE, JLE)', () => {
      ['JEQ', 'JLT', 'JGT', 'JGE', 'JLE'].forEach(op => {
        const instr = parseInstruction(op + ' r2 i5');
        expect(instr.opcode).toBe(op);
        expect(instr.operands[0]).toEqual({ type: 'Register', value: 2 });
        expect(instr.operands[1]).toEqual({ type: 'InstructionNumber', value: 5 });
      });
    });
    it('parses JMP iN (instruction number)', () => {
      const instr = parseInstruction('JMP i1');
      expect(instr.opcode).toBe('JMP');
      expect(instr.operands[0]).toEqual({ type: 'InstructionNumber', value: 1 });
    });
    it('parses STP with no args', () => {
      const instr = parseInstruction('STP');
      expect(instr.opcode).toBe('STP');
      expect(instr.operands).toHaveLength(0);
    });
    it('returns null for empty line', () => {
      expect(parseInstruction('')).toBeNull();
      expect(parseInstruction('   ')).toBeNull();
    });
    it('throws for unknown opcode', () => {
      expect(() => parseInstruction('FOO r0')).toThrow(/Unknown opcode/);
    });
    it('throws for wrong number of arguments', () => {
      expect(() => parseInstruction('SET r0')).toThrow(/Expected .* arguments/);
      expect(() => parseInstruction('INC r0 r1')).toThrow(/Expected .* arguments/);
    });
    it('throws for invalid token (too short)', () => {
      expect(() => parseInstruction('INC r')).toThrow(/Invalid token/);
    });
    it('throws for invalid token (unknown prefix)', () => {
      expect(() => parseInstruction('SET x0 r1')).toThrow(/Unknown token prefix/);
    });
    it('throws for non-numeric value in token', () => {
      expect(() => parseInstruction('SET r0 rX')).toThrow(/Invalid number/);
    });
    it('throws for wrong operand type (e.g. Immediate where Register expected)', () => {
      expect(() => parseInstruction('INC #5')).toThrow(/expected one of/);
    });
    it('accepts SET with memory destination', () => {
      const instr = parseInstruction('SET @0 r1');
      expect(instr.operands[0]).toEqual({ type: 'MemoryAddress', value: 0 });
      expect(instr.operands[1]).toEqual({ type: 'Register', value: 1 });
    });
  });

  describe('createMachine', () => {
    it('returns object with instructions, code, registers, memory, pc, halted', () => {
      const m = createMachine();
      expect(m).toHaveProperty('instructions');
      expect(m).toHaveProperty('code');
      expect(m).toHaveProperty('registers');
      expect(m).toHaveProperty('memory');
      expect(m).toHaveProperty('pc');
      expect(m).toHaveProperty('halted');
      expect(Array.isArray(m.instructions)).toBe(true);
      expect(Array.isArray(m.code)).toBe(true);
      expect(m.pc).toBe(0);
      expect(m.halted).toBe(false);
    });
    it('has NUM_REGISTERS register slots', () => {
      const m = createMachine();
      expect(Object.keys(m.registers).length).toBe(NUM_REGISTERS);
      for (let i = 0; i < NUM_REGISTERS; i++) {
        expect(m.registers).toHaveProperty(String(i));
        expect(typeof m.registers[i]).toBe('number');
      }
    });
    it('has MEMORY_SIZE memory cells', () => {
      const m = createMachine();
      expect(m.memory.length).toBe(MEMORY_SIZE);
    });
  });

  describe('loadProgram', () => {
    it('accepts string source', () => {
      const m = createMachine();
      loadProgram(m, 'INC r0\nSTP');
      expect(m.instructions).toEqual(['INC r0', 'STP']);
      expect(m.code.length).toBe(2);
    });
    it('accepts object with source', () => {
      const m = createMachine();
      loadProgram(m, { source: 'DEC r1\nSTP' });
      expect(m.instructions).toEqual(['DEC r1', 'STP']);
    });
    it('accepts object with lines array', () => {
      const m = createMachine();
      loadProgram(m, { lines: ['SET r0 #0', 'STP'] });
      expect(m.instructions).toEqual(['SET r0 #0', 'STP']);
    });
    it('skips empty lines and comment lines', () => {
      const m = createMachine();
      loadProgram(m, '; comment\n\nINC r0\n  \nSTP');
      expect(m.instructions).toEqual(['INC r0', 'STP']);
    });
    it('sets lineNumbers for source line mapping', () => {
      const m = createMachine();
      loadProgram(m, '; line 1\nINC r0\n; line 3\nSTP');
      expect(m.lineNumbers).toEqual([2, 4]);
    });
    it('throws for non-string, non-object program', () => {
      const m = createMachine();
      expect(() => loadProgram(m, 42)).toThrow(/Program must be/);
      expect(() => loadProgram(m, null)).toThrow(/Program must be/);
    });
    it('throws for object without source or lines', () => {
      const m = createMachine();
      expect(() => loadProgram(m, {})).toThrow(/source.*lines/);
    });
    it('throws on parse error in source', () => {
      const m = createMachine();
      expect(() => loadProgram(m, 'BAD r0')).toThrow();
    });
  });

  describe('execute (single step)', () => {
    it('INC increments register', () => {
      const m = createMachine();
      m.registers[0] = 10;
      loadProgram(m, 'INC r0\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(11);
      expect(m.pc).toBe(1);
    });
    it('DEC decrements register', () => {
      const m = createMachine();
      m.registers[1] = 5;
      loadProgram(m, 'DEC r1\nSTP');
      execute(m);
      expect(m.registers[1]).toBe(4);
    });
    it('SET copies value (reg to reg)', () => {
      const m = createMachine();
      m.registers[1] = 99;
      loadProgram(m, 'SET r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(99);
    });
    it('SET copies immediate to register', () => {
      const m = createMachine();
      loadProgram(m, 'SET r0 #42\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(42);
    });
    it('SET copies memory to register', () => {
      const m = createMachine();
      m.memory[3] = 77;
      loadProgram(m, 'SET r0 @3\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(77);
    });
    it('SET copies register to memory', () => {
      const m = createMachine();
      m.registers[2] = 11;
      loadProgram(m, 'SET @0 r2\nSTP');
      execute(m);
      expect(m.memory[0]).toBe(11);
    });
    it('ISZ skips next instruction when register is zero', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'ISZ r0\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2); // skipped INC
    });
    it('ISZ does not skip when register is non-zero', () => {
      const m = createMachine();
      m.registers[0] = 1;
      loadProgram(m, 'ISZ r0\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(1);
    });
    it('ISN skips next instruction when register is negative', () => {
      const m = createMachine();
      m.registers[0] = -1;
      loadProgram(m, 'ISN r0\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2);
    });
    it('ISN does not skip when register is non-negative', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'ISN r0\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(1);
    });
    it('JMP sets pc to line number (1-based)', () => {
      const m = createMachine();
      loadProgram(m, 'JMP i3\nINC r0\nSTP\nDEC r0\nSTP');
      execute(m);
      expect(m.pc).toBe(2); // line 3 -> index 2
    });
    it('STP sets halted and does not advance pc', () => {
      const m = createMachine();
      loadProgram(m, 'STP');
      execute(m);
      expect(m.halted).toBe(true);
      expect(m.pc).toBe(0);
    });
    it('SUB subtracts second register from first', () => {
      const m = createMachine();
      m.registers[0] = 10;
      m.registers[1] = 3;
      loadProgram(m, 'SUB r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(7);
      expect(m.registers[1]).toBe(3);
    });
    it('SUB can produce negative results', () => {
      const m = createMachine();
      m.registers[0] = 3;
      m.registers[1] = 5;
      loadProgram(m, 'SUB r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(-2);
    });
    it('SWP swaps two registers', () => {
      const m = createMachine();
      m.registers[2] = 10;
      m.registers[3] = 20;
      loadProgram(m, 'SWP r2 r3\nSTP');
      execute(m);
      expect(m.registers[2]).toBe(20);
      expect(m.registers[3]).toBe(10);
    });
    it('ADD adds second register into first', () => {
      const m = createMachine();
      m.registers[0] = 10;
      m.registers[1] = 5;
      loadProgram(m, 'ADD r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(15);
      expect(m.registers[1]).toBe(5);
    });
    it('MUL multiplies', () => {
      const m = createMachine();
      m.registers[0] = 3;
      m.registers[1] = 4;
      loadProgram(m, 'MUL r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(12);
    });
    it('POW computes exponentiation', () => {
      const m = createMachine();
      m.registers[0] = 2;
      m.registers[1] = 3;
      loadProgram(m, 'POW r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(8);
    });
    it('CMP sets register to sgn(rX - rY)', () => {
      const m = createMachine();
      m.registers[0] = 5; m.registers[1] = 3;
      loadProgram(m, 'CMP r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(1);
      expect(m.registers[1]).toBe(3);
    });
    it('CMP sets -1 when rX < rY', () => {
      const m = createMachine();
      m.registers[0] = 2; m.registers[1] = 7;
      loadProgram(m, 'CMP r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(-1);
    });
    it('CMP sets 0 when rX == rY', () => {
      const m = createMachine();
      m.registers[0] = 4; m.registers[1] = 4;
      loadProgram(m, 'CMP r0 r1\nSTP');
      execute(m);
      expect(m.registers[0]).toBe(0);
    });
    it('JEQ jumps when register is zero', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'JEQ r0 i3\nINC r1\nSTP\nDEC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2); // jumped to line 3 = index 2
    });
    it('JEQ does not jump when register is non-zero', () => {
      const m = createMachine();
      m.registers[0] = 5;
      loadProgram(m, 'JEQ r0 i3\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(1); // fell through
    });
    it('JLT jumps when register is negative', () => {
      const m = createMachine();
      m.registers[0] = -1;
      loadProgram(m, 'JLT r0 i3\nINC r1\nSTP\nDEC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2);
    });
    it('JLT does not jump when register is non-negative', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'JLT r0 i3\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(1);
    });
    it('JGT jumps when register is positive', () => {
      const m = createMachine();
      m.registers[0] = 1;
      loadProgram(m, 'JGT r0 i3\nINC r1\nSTP\nDEC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2);
    });
    it('JGT does not jump when register is zero or negative', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'JGT r0 i3\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(1);
    });
    it('JGE jumps when register is zero', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'JGE r0 i3\nINC r1\nSTP\nDEC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2);
    });
    it('JGE jumps when register is positive', () => {
      const m = createMachine();
      m.registers[0] = 3;
      loadProgram(m, 'JGE r0 i3\nINC r1\nSTP\nDEC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2);
    });
    it('JGE does not jump when register is negative', () => {
      const m = createMachine();
      m.registers[0] = -1;
      loadProgram(m, 'JGE r0 i3\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(1);
    });
    it('JLE jumps when register is zero', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'JLE r0 i3\nINC r1\nSTP\nDEC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2);
    });
    it('JLE jumps when register is negative', () => {
      const m = createMachine();
      m.registers[0] = -5;
      loadProgram(m, 'JLE r0 i3\nINC r1\nSTP\nDEC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(2);
    });
    it('JLE does not jump when register is positive', () => {
      const m = createMachine();
      m.registers[0] = 1;
      loadProgram(m, 'JLE r0 i3\nINC r1\nSTP');
      execute(m);
      expect(m.pc).toBe(1);
    });
  });

  describe('run (full execution)', () => {
    it('runs until STP', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'INC r0\nINC r0\nSTP');
      const halted = run(m);
      expect(halted).toBe(true);
      expect(m.registers[0]).toBe(2);
      expect(m.pc).toBe(2);
    });
    it('stops at end of code if no STP', () => {
      const m = createMachine();
      m.registers[0] = 0;
      loadProgram(m, 'INC r0\nINC r0');
      const halted = run(m);
      expect(halted).toBe(false);
      expect(m.registers[0]).toBe(2);
      expect(m.pc).toBe(2);
    });
    it('respects maxSteps (infinite loop guard)', () => {
      const m = createMachine();
      loadProgram(m, 'JMP i1\nJMP i1');
      const halted = run(m, 100);
      expect(halted).toBe(false);
      expect(m.pc).toBe(0);
    });
    it('addition program: r2+r3 -> r0', () => {
      const m = createMachine();
      m.registers[0] = 0;
      m.registers[1] = 0;
      m.registers[2] = 5;
      m.registers[3] = 3;
      const source = [
        'SET r0 r2',
        'ISZ r3',
        'JMP i5',
        'STP',
        'INC r0',
        'DEC r3',
        'JMP i2',
      ].join('\n');
      loadProgram(m, source);
      const halted = run(m);
      expect(halted).toBe(true);
      expect(m.registers[0]).toBe(8);
    });
    it('subtraction program: r2-r3 -> r0 using DEC loop', () => {
      const m = createMachine();
      m.registers[0] = 0;
      m.registers[2] = 8;
      m.registers[3] = 3;
      const source = [
        'SET r0 r2',
        'ISZ r3',
        'JMP i5',
        'STP',
        'DEC r0',
        'DEC r3',
        'JMP i2',
      ].join('\n');
      loadProgram(m, source);
      const halted = run(m);
      expect(halted).toBe(true);
      expect(m.registers[0]).toBe(5);
    });
    it('subtraction using SUB instruction', () => {
      const m = createMachine();
      m.registers[0] = 15;
      m.registers[1] = 6;
      loadProgram(m, 'SUB r0 r1\nSTP');
      run(m);
      expect(m.registers[0]).toBe(9);
    });
    it('multiplication via ADD loop', () => {
      const m = createMachine();
      m.registers[0] = 0;
      m.registers[1] = 0;
      m.registers[2] = 3;
      m.registers[3] = 4;
      const source = [
        'SET r0 #0',
        'SET r1 r2',
        'ISZ r3',
        'JMP i6',
        'STP',
        'ADD r0 r1',
        'DEC r3',
        'JMP i2',
      ].join('\n');
      loadProgram(m, source);
      const halted = run(m);
      expect(halted).toBe(true);
      expect(m.registers[0]).toBe(12);
    });
  });

  describe('edge cases', () => {
    it('empty program loads with no instructions', () => {
      const m = createMachine();
      loadProgram(m, ';\n\n  ');
      expect(m.instructions).toEqual([]);
      expect(m.code).toEqual([]);
    });
    it('run with empty code does not throw', () => {
      const m = createMachine();
      loadProgram(m, '; only comments');
      expect(() => run(m)).not.toThrow();
      expect(m.pc).toBe(0);
    });
    it('JMP to first line (i1) sets pc to 0', () => {
      const m = createMachine();
      loadProgram(m, 'JMP i1\nSTP');
      execute(m);
      expect(m.pc).toBe(0);
    });
    it('SET @ to # (immediate to memory)', () => {
      const m = createMachine();
      loadProgram(m, 'SET @10 #100\nSTP');
      execute(m);
      expect(m.memory[10]).toBe(100);
    });
  });
});
