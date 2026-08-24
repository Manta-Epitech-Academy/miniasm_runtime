/**
 * @jest-environment node
 *
 * Functional tests for comment support:
 * - stripComment helper
 * - loadProgram with inline comments
 * - Full programs with full-line and inline comments
 */
const path = require('path');
const MiniASM = require(path.join(__dirname, '../js/interpreter.js'));

const {
  createMachine,
  loadProgram,
  execute,
  run,
  parseInstruction,
  stripComment,
} = MiniASM;

// ─── stripComment ────────────────────────────────────────────────

describe('stripComment', () => {
  it('returns the line unchanged when there is no comment', () => {
    expect(stripComment('INC r0')).toBe('INC r0');
  });

  it('strips a full-line comment to empty string', () => {
    expect(stripComment('; This is a comment')).toBe('');
  });

  it('strips inline comment from an instruction', () => {
    expect(stripComment('INC r2 ; bump counter')).toBe('INC r2');
  });

  it('handles semicolon immediately after instruction (no space)', () => {
    expect(stripComment('STP;done')).toBe('STP');
  });

  it('handles extra whitespace around the semicolon', () => {
    expect(stripComment('  ADD r0 r1   ; add values  ')).toBe('ADD r0 r1');
  });

  it('returns empty string for empty input', () => {
    expect(stripComment('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(stripComment('   ')).toBe('');
  });

  it('strips comment that is just a semicolon', () => {
    expect(stripComment(';')).toBe('');
  });

  it('keeps only the instruction part for multi-semicolon lines', () => {
    // Only the first ; matters
    expect(stripComment('SET r0 #5 ; init ; reset')).toBe('SET r0 #5');
  });
});

// ─── loadProgram with inline comments ────────────────────────────

describe('loadProgram with inline comments', () => {
  it('strips inline comment and loads instruction correctly', () => {
    const m = createMachine();
    loadProgram(m, 'INC r0 ; bump\nSTP');
    expect(m.instructions).toEqual(['INC r0', 'STP']);
    expect(m.code.length).toBe(2);
  });

  it('strips inline comments from SET instruction', () => {
    const m = createMachine();
    loadProgram(m, 'SET r0 #42 ; initialize r0\nSTP');
    expect(m.instructions).toEqual(['SET r0 #42', 'STP']);
  });

  it('handles mix of full-line comments, inline comments, and blank lines', () => {
    const m = createMachine();
    const source = [
      '; Program header',
      'SET r0 #10 ; load 10',
      '',
      '; middle comment',
      'INC r1 ; count up',
      'STP ; done',
    ].join('\n');
    loadProgram(m, source);
    expect(m.instructions).toEqual(['SET r0 #10', 'INC r1', 'STP']);
    expect(m.code.length).toBe(3);
  });

  it('computes correct lineNumbers with inline comments', () => {
    const m = createMachine();
    const source = [
      '; header comment',        // line 1 → skipped
      'INC r0 ; first instr',    // line 2 → instruction 0
      '; middle comment',        // line 3 → skipped
      'DEC r1 ; second instr',   // line 4 → instruction 1
      'STP',                     // line 5 → instruction 2
    ].join('\n');
    loadProgram(m, source);
    expect(m.instructions).toEqual(['INC r0', 'DEC r1', 'STP']);
    expect(m.lineNumbers).toEqual([2, 4, 5]);
  });

  it('handles a line that is only a semicolon', () => {
    const m = createMachine();
    loadProgram(m, ';\nINC r0\nSTP');
    expect(m.instructions).toEqual(['INC r0', 'STP']);
  });

  it('previously crashing inline comment no longer throws', () => {
    const m = createMachine();
    // This used to throw "Expected 1 arguments for INC, got 6"
    expect(() => {
      loadProgram(m, 'INC r2 ; This is a comment\nSTP');
    }).not.toThrow();
    expect(m.instructions).toEqual(['INC r2', 'STP']);
  });
});

// ─── Execution with inline comments ─────────────────────────────

describe('execution with comments in source', () => {
  it('INC with inline comment executes correctly', () => {
    const m = createMachine();
    m.registers[0] = 10;
    loadProgram(m, 'INC r0 ; add one\nSTP');
    run(m);
    expect(m.halted).toBe(true);
    expect(m.registers[0]).toBe(11);
  });

  it('SET with inline comment executes correctly', () => {
    const m = createMachine();
    loadProgram(m, 'SET r0 #42 ; answer to everything\nSTP');
    run(m);
    expect(m.registers[0]).toBe(42);
  });

  it('ADD with inline comment executes correctly', () => {
    const m = createMachine();
    m.registers[0] = 3;
    m.registers[1] = 7;
    loadProgram(m, 'ADD r0 r1 ; sum\nSTP');
    run(m);
    expect(m.registers[0]).toBe(10);
    expect(m.registers[1]).toBe(7);
  });

  it('JMP with inline comment executes correctly', () => {
    const m = createMachine();
    m.registers[0] = 0;
    loadProgram(m, 'JMP i3 ; skip next\nINC r0\nSTP ; end');
    execute(m);
    expect(m.pc).toBe(2);
  });

  it('full program with mixed comments runs correctly', () => {
    const m = createMachine();
    m.registers[0] = 0;
    m.registers[1] = 0;
    m.registers[2] = 5;
    m.registers[3] = 3;
    const source = [
      '; Addition program: r0 = r2 + r3',
      'SET r0 r2 ; start with r2',
      'ISZ r3 ; check if done',
      'JMP i5 ; skip to increment',
      'STP ; halt',
      'INC r0 ; bump result',
      'DEC r3 ; count down',
      'JMP i2 ; back to check',
    ].join('\n');
    loadProgram(m, source);
    const halted = run(m);
    expect(halted).toBe(true);
    expect(m.registers[0]).toBe(8);
  });

  it('SWP with inline comment executes correctly', () => {
    const m = createMachine();
    m.registers[0] = 1;
    m.registers[1] = 2;
    loadProgram(m, 'SWP r0 r1 ; swap them\nSTP');
    run(m);
    expect(m.registers[0]).toBe(2);
    expect(m.registers[1]).toBe(1);
  });

  it('SUB with inline comment executes correctly', () => {
    const m = createMachine();
    m.registers[0] = 10;
    m.registers[1] = 4;
    loadProgram(m, 'SUB r0 r1 ; difference\nSTP');
    run(m);
    expect(m.registers[0]).toBe(6);
  });

  it('MUL with inline comment executes correctly', () => {
    const m = createMachine();
    m.registers[0] = 6;
    m.registers[1] = 7;
    loadProgram(m, 'MUL r0 r1 ; product\nSTP');
    run(m);
    expect(m.registers[0]).toBe(42);
  });

  it('POW with inline comment executes correctly', () => {
    const m = createMachine();
    m.registers[0] = 2;
    m.registers[1] = 10;
    loadProgram(m, 'POW r0 r1 ; power\nSTP');
    run(m);
    expect(m.registers[0]).toBe(1024);
  });

  it('ISZ with inline comment skips correctly when zero', () => {
    const m = createMachine();
    m.registers[0] = 0;
    m.registers[1] = 0;
    loadProgram(m, 'ISZ r0 ; check zero\nINC r1\nSTP');
    execute(m);
    expect(m.pc).toBe(2); // skipped INC
  });

  it('ISN with inline comment skips correctly when negative', () => {
    const m = createMachine();
    m.registers[0] = -5;
    loadProgram(m, 'ISN r0 ; check negative\nINC r1\nSTP');
    execute(m);
    expect(m.pc).toBe(2); // skipped INC
  });
});

// ─── Backward compatibility ──────────────────────────────────────

describe('backward compatibility (no comments)', () => {
  it('programs without any comments still work', () => {
    const m = createMachine();
    m.registers[0] = 0;
    loadProgram(m, 'INC r0\nINC r0\nSTP');
    run(m);
    expect(m.registers[0]).toBe(2);
  });

  it('full-line comments (legacy) still work', () => {
    const m = createMachine();
    loadProgram(m, '; comment\nINC r0\n; another\nSTP');
    expect(m.instructions).toEqual(['INC r0', 'STP']);
  });

  it('empty program still works', () => {
    const m = createMachine();
    loadProgram(m, '');
    expect(m.instructions).toEqual([]);
    expect(m.code).toEqual([]);
  });

  it('only-comments program still works', () => {
    const m = createMachine();
    loadProgram(m, '; just a comment\n; another one');
    expect(m.instructions).toEqual([]);
    expect(() => run(m)).not.toThrow();
  });
});
