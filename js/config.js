/**
 * MiniASM — Central Configuration.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Change the values below to customise the virtual machine.     ║
 * ║                                                                ║
 * ║  • registers.count  — number of general-purpose registers      ║
 * ║  • memory.size      — number of addressable memory cells       ║
 * ║  • memory.columns   — columns shown in the UI memory table     ║
 * ║  • randomMax        — random init range [0, randomMax)         ║
 * ║  • maxSteps         — execution timeout (infinite-loop guard)  ║
 * ║  • operandTypes     — token-prefix → type-name mapping         ║
 * ║                       (add a new prefix here to support a      ║
 * ║                        new operand type; then handle it in     ║
 * ║                        getValue/setValue in interpreter.js)     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
(function () {
  var CFG = {
    // ─── Registers ─────────────────────────────────────────────
    registers: {
      count: 4,          // r0 … r(count-1)
      prefix: 'r',       // single-char prefix used in source code
    },

    // ─── Memory ────────────────────────────────────────────────
    memory: {
      size: 64,          // total addressable cells (@0 … @size-1)
      // 8, not 16: the app lives in a workshop pane about half a screen wide,
      // and 17 columns of three digits do not fit it. They did not fit before
      // either — the table simply scrolled sideways inside a block that scrolls
      // down, so half of memory was off screen with nothing to say so.
      columns: 8,        // columns in the UI memory table
      prefix: '@',       // single-char prefix used in source code
    },

    // ─── Value range ───────────────────────────────────────────
    randomMax: 256,      // registers & memory randomised in [0, randomMax)

    // ─── Execution ─────────────────────────────────────────────
    maxSteps: 100000,    // steps before the VM aborts (infinite-loop guard)

    // ─── Operand types ─────────────────────────────────────────
    // Maps a single-character token prefix to its operand type name.
    // The interpreter uses these names to dispatch getValue / setValue.
    // To add a new type:
    //   1. Add an entry here       (e.g.  '%': 'StackPointer')
    //   2. Handle it in getValue / setValue in interpreter.js
    operandTypes: {
      'r': 'Register',
      '#': 'Immediate',
      '@': 'MemoryAddress',
      'i': 'InstructionNumber',
    },

    // ─── Feature flags ─────────────────────────────────────────
    // Enable internal-only tools such as the exercise "cheat mode".
    // This should remain false in production builds.
    enableCheats: true,
  };

  // ─── Derived helpers (computed from the settings above) ──────

  /** Register enum object: { R0: 0, R1: 1, … } */
  CFG.Register = {};
  for (var i = 0; i < CFG.registers.count; i++) {
    CFG.Register['R' + i] = i;
  }

  /** Register display names: ['r0', 'r1', …] */
  CFG.REG_NAMES = [];
  for (var i = 0; i < CFG.registers.count; i++) {
    CFG.REG_NAMES.push(CFG.registers.prefix + i);
  }

  /** Blockly dropdown options: [['0','0'], ['1','1'], …] */
  CFG.regOptions = [];
  for (var i = 0; i < CFG.registers.count; i++) {
    CFG.regOptions.push([String(i), String(i)]);
  }

  // ─── Export ──────────────────────────────────────────────────
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CFG;
  }
  if (typeof window !== 'undefined') {
    window.MiniASMConfig = CFG;
  }
})();
