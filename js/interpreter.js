/**
 * MiniASM VM — vanilla JavaScript implementation.
 * All tuneable knobs (register count, memory size, …) come from config.js.
 * Instruction set: SET, INC, DEC, ISZ, ISN, STP, JMP  (+ unlockable ADD, SUB, MUL, POW, SWP, CMP, JEQ, JLT, JGT, JGE, JLE).
 */

// ─── Read configuration (falls back to sensible defaults) ────────
var _cfg = (typeof window !== 'undefined' && window.MiniASMConfig) || {};

var NUM_REGISTERS    = (_cfg.registers && _cfg.registers.count) || 4;
var REG_PREFIX       = (_cfg.registers && _cfg.registers.prefix) || 'r';
var MEMORY_SIZE      = (_cfg.memory && _cfg.memory.size) || 64;
var RANDOM_MAX       = _cfg.randomMax || 256;
var MAX_STEPS_DEFAULT = _cfg.maxSteps || 100000;
var OPERAND_TYPES    = _cfg.operandTypes || {
  'r': 'Register', '#': 'Immediate', '@': 'MemoryAddress', 'i': 'InstructionNumber'
};

// ─── Derived values ──────────────────────────────────────────────

var Register = _cfg.Register || {};
var REG_NAMES = _cfg.REG_NAMES || [];

// Compute if config wasn't loaded
if (!_cfg.Register) {
  for (var _i = 0; _i < NUM_REGISTERS; _i++) {
    Register['R' + _i] = _i;
    REG_NAMES.push(REG_PREFIX + _i);
  }
}

// ─── Operand parser ──────────────────────────────────────────────

function parseOperand(token) {
  if (!token || token.length < 2) throw new Error('Invalid token: ' + token);
  var prefix = token[0];
  var value = parseInt(token.slice(1), 10);
  if (Number.isNaN(value)) throw new Error('Invalid number in token: ' + token);
  var typeName = OPERAND_TYPES[prefix];
  if (!typeName) throw new Error('Unknown token prefix: ' + prefix);
  return { type: typeName, value: value };
}

// ─── Instruction definitions ─────────────────────────────────────

var INST = {
  SET: {
    args: [
      ['Register', 'MemoryAddress'],
      ['Register', 'MemoryAddress', 'Immediate']
    ],
    run: function (m, dest, src) {
      var v = getValue(m, src);
      setValue(m, dest, v);
    }
  },
  INC: {
    args: [['Register']],
    run: function (m, x) { m.registers[x.value] += 1; }
  },
  DEC: {
    args: [['Register']],
    run: function (m, x) { m.registers[x.value] -= 1; }
  },
  ISZ: {
    args: [['Register']],
    run: function (m, x) { if (m.registers[x.value] === 0) m.pc += 1; }
  },
  ISN: {
    args: [['Register']],
    run: function (m, x) { if (m.registers[x.value] < 0) m.pc += 1; }
  },
  ADD: {
    args: [['Register'], ['Register']],
    run: function (m, x, y) { m.registers[x.value] += m.registers[y.value]; }
  },
  SUB: {
    args: [['Register'], ['Register']],
    run: function (m, x, y) { m.registers[x.value] -= m.registers[y.value]; }
  },
  SWP: {
    args: [['Register'], ['Register']],
    run: function (m, x, y) {
      var t = m.registers[x.value];
      m.registers[x.value] = m.registers[y.value];
      m.registers[y.value] = t;
    }
  },
  MUL: {
    args: [['Register'], ['Register']],
    run: function (m, x, y) { m.registers[x.value] *= m.registers[y.value]; }
  },
  POW: {
    args: [['Register'], ['Register']],
    run: function (m, x, y) { m.registers[x.value] = Math.pow(m.registers[x.value], m.registers[y.value]); }
  },
  CMP: {
    args: [['Register'], ['Register']],
    run: function (m, x, y) {
      var diff = m.registers[x.value] - m.registers[y.value];
      m.registers[x.value] = diff > 0 ? 1 : (diff < 0 ? -1 : 0);
    }
  },
  STP: {
    args: [],
    run: function (m) { m.halted = true; }
  },
  JMP: {
    args: [['InstructionNumber']],
    run: function (m, line) { m.pc = line.value - 1; m.jumped = true; }
  },
  JEQ: {
    args: [['Register'], ['InstructionNumber']],
    run: function (m, x, line) {
      if (m.registers[x.value] === 0) { m.pc = line.value - 1; m.jumped = true; }
    }
  },
  JLT: {
    args: [['Register'], ['InstructionNumber']],
    run: function (m, x, line) {
      if (m.registers[x.value] < 0) { m.pc = line.value - 1; m.jumped = true; }
    }
  },
  JGT: {
    args: [['Register'], ['InstructionNumber']],
    run: function (m, x, line) {
      if (m.registers[x.value] > 0) { m.pc = line.value - 1; m.jumped = true; }
    }
  },
  JGE: {
    args: [['Register'], ['InstructionNumber']],
    run: function (m, x, line) {
      if (m.registers[x.value] >= 0) { m.pc = line.value - 1; m.jumped = true; }
    }
  },
  JLE: {
    args: [['Register'], ['InstructionNumber']],
    run: function (m, x, line) {
      if (m.registers[x.value] <= 0) { m.pc = line.value - 1; m.jumped = true; }
    }
  }
};

// ─── Argument validation ─────────────────────────────────────────

function checkArg(opcode, argIndex, operand, allowedTypes) {
  if (!allowedTypes.includes(operand.type)) {
    throw new Error(
      'Argument ' + (argIndex + 1) + ' for ' + opcode +
      ': expected one of [' + allowedTypes.join(', ') + '], got ' + operand.type
    );
  }
}

// ─── Value get / set (extend here when adding new operand types) ─

function getValue(m, op) {
  switch (op.type) {
    case 'Register':      return m.registers[op.value];
    case 'MemoryAddress': return m.memory[op.value];
    case 'Immediate':     return op.value;
    default: throw new Error('Cannot get value for type: ' + op.type);
  }
}

function setValue(m, dest, value) {
  switch (dest.type) {
    case 'Register':      m.registers[dest.value] = value; break;
    case 'MemoryAddress': m.memory[dest.value] = value; break;
    default: throw new Error('Cannot set value for type: ' + dest.type);
  }
}

// ─── Comment stripping ───────────────────────────────────────────

/**
 * Strip inline comment from a line.
 * Returns the instruction part only (trimmed).
 * "; full-line comment" → ""
 * "INC r2 ; bump"       → "INC r2"
 * "INC r2"              → "INC r2"
 */
function stripComment(line) {
  var idx = line.indexOf(';');
  if (idx === -1) return line.trim();
  return line.slice(0, idx).trim();
}

// ─── Instruction parsing ─────────────────────────────────────────

function parseInstruction(line) {
  var tokens = line.split(/\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
  if (tokens.length === 0) return null;
  var opcode = tokens[0];
  var info = INST[opcode];
  if (!info) throw new Error('Unknown opcode: ' + opcode);
  var givenArgs = tokens.slice(1);
  if (info.args.length !== givenArgs.length) {
    throw new Error('Expected ' + info.args.length + ' arguments for ' + opcode + ', got ' + givenArgs.length);
  }
  var operands = givenArgs.map(function (t) { return parseOperand(t); });
  for (var i = 0; i < info.args.length; i++) {
    checkArg(opcode, i, operands[i], info.args[i]);
  }
  return { opcode: opcode, operands: operands };
}

// ─── Machine creation ────────────────────────────────────────────

function createMachine() {
  var rand = function () { return Math.floor(Math.random() * RANDOM_MAX); };
  var regs = {};
  for (var i = 0; i < NUM_REGISTERS; i++) regs[i] = rand();
  return {
    instructions: [],
    code: [],
    registers: regs,
    memory: Array.from({ length: MEMORY_SIZE }, rand),
    pc: 0,
    halted: false
  };
}

/**
 * Load program into machine. Accepts:
 * - string: raw source (e.g. from textarea)
 * - object: { source: string } or { lines: string[] }
 */
function loadProgram(machine, program) {
  var text;
  if (typeof program === 'string') {
    text = program;
  } else if (program && typeof program === 'object') {
    if (typeof program.source === 'string') text = program.source;
    else if (Array.isArray(program.lines)) text = program.lines.join('\n');
    else throw new Error('Program object must have "source" or "lines"');
  } else {
    throw new Error('Program must be a string or { source | lines } object');
  }
  var allLines = text.split(/\n/).map(function (l) { return l.trim(); });
  var lines = [];
  var lineNumbers = [];
  for (var i = 0; i < allLines.length; i++) {
    var stripped = stripComment(allLines[i]);
    if (stripped) {
      lines.push(stripped);
      lineNumbers.push(i + 1);
    }
  }
  machine.instructions = lines;
  machine.code = lines.map(function (line, idx) { return [idx, parseInstruction(line)]; });
  machine.lineNumbers = lineNumbers;
  return machine;
}

// ─── Execution ───────────────────────────────────────────────────

function execute(machine) {
  var pair = machine.code[machine.pc];
  var instr = pair[1];
  machine.jumped = false;
  INST[instr.opcode].run(machine, ...instr.operands);
  if (machine.halted) return;
  if (!machine.jumped) {
    machine.pc += 1;
  }
}

function run(machine, maxSteps) {
  if (maxSteps === undefined) maxSteps = MAX_STEPS_DEFAULT;
  var steps = 0;
  while (machine.pc < machine.code.length && !machine.halted && steps < maxSteps) {
    execute(machine);
    steps += 1;
  }
  return machine.halted;
}

// ─── Debug printing ──────────────────────────────────────────────

function printCode(machine) {
  for (var c = 0; c < machine.code.length; c++) {
    var idx = machine.code[c][0];
    var instr = machine.code[c][1];
    var marker = idx === machine.pc ? ' <== PC' : '';
    var argsStr = instr.operands.map(function (op) {
      if (op.type === 'Register') return REG_NAMES[op.value];
      if (op.type === 'Immediate') return '#' + op.value;
      if (op.type === 'MemoryAddress') return '@' + op.value;
      return 'i' + op.value;
    }).join(' ');
    console.log(idx + ': ' + instr.opcode + ' ' + argsStr + marker);
  }
}

function printRegisters(machine) {
  console.log('Registers:');
  for (var i = 0; i < NUM_REGISTERS; i++) {
    console.log(REG_NAMES[i] + ': ' + machine.registers[i]);
  }
}

function printMemory(machine) {
  for (var i = 0; i < MEMORY_SIZE; i += 8) {
    var row = machine.memory.slice(i, i + 8).map(function (x) { return x.toString(16).padStart(2, '0'); });
    console.log(row.join(' '));
  }
}

// ─── Export ──────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Register: Register,
    REG_NAMES: REG_NAMES,
    NUM_REGISTERS: NUM_REGISTERS,
    MEMORY_SIZE: MEMORY_SIZE,
    createMachine: createMachine,
    loadProgram: loadProgram,
    execute: execute,
    run: run,
    parseInstruction: parseInstruction,
    stripComment: stripComment,
    printCode: printCode,
    printRegisters: printRegisters,
    printMemory: printMemory,
    INST: INST
  };
}
if (typeof window !== 'undefined') {
  window.MiniASM = {
    Register: Register,
    REG_NAMES: REG_NAMES,
    NUM_REGISTERS: NUM_REGISTERS,
    MEMORY_SIZE: MEMORY_SIZE,
    createMachine: createMachine,
    loadProgram: loadProgram,
    execute: execute,
    run: run,
    parseInstruction: parseInstruction,
    stripComment: stripComment,
    printCode: printCode,
    printRegisters: printRegisters,
    printMemory: printMemory,
    INST: INST
  };
}
