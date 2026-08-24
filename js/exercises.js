/**
 * WDR+E Challenge System — progressive challenges for the web IDE.
 * Depends on: lang.js
 *
 * ─── HOW TO ADD A NEW CHALLENGE ───────────────────────────────────────
 *  1. Add the challenge text (name, title, goal, description, hints,
 *     starterCode) to each language file (lang.js, lang-fr.js, etc.)
 *     under exercises[id].
 *  2. Add a category to CATEGORIES (if needed).
 *  3. Append a new data object to EXERCISE_DATA below (id, category,
 *     type, available, unlocks, tests).
 *  4. If the challenge unlocks a new instruction, make sure that
 *     instruction is defined in interpreter.js (INST object) and
 *     has a corresponding Blockly block in blocks-miniasm.js.
 *  5. That's it! Navigation, progress, testing, and unlocking
 *     are all handled automatically.
 * ──────────────────────────────────────────────────────────────────────
 */
(function () {
  var T = window.MiniASMLang.T;
  var CFG = window.MiniASMConfig;

  var STORAGE_KEY = 'miniasm-progress';

  // Primitive instructions — always available
  var PRIMITIVES = ['SET', 'INC', 'DEC', 'ISZ', 'ISN', 'STP', 'JMP'];

  var TEXT_FIELDS = ['name', 'title', 'goal', 'description', 'hints', 'starterCode'];
  var TEXT_DEFAULTS = {
    name: '',
    title: '',
    goal: '',
    description: '',
    hints: [],
    starterCode: ''
  };

  // ─── Categories ─────────────────────────────────────────────────────
  //
  // Each category groups related tutorials and challenges.
  // Add new categories here; items reference them via `category`.
  var CATEGORIES = [
    { id: 'arithmetic', name: T('categoryArithmetic') },
    { id: 'comparisons', name: T('categoryComparisons') },
    { id: 'swaps', name: T('categorySwaps') },
  ];

  // ─── Exercise data (structural / non-translatable) ─────────────────
  //
  // Each entry has:
  //   id          – unique number (determines ordering & prerequisite chain)
  //   category    – category id (matches CATEGORIES[].id)
  //   type        – 'tutorial' | 'challenge'
  //   requires    – array of exercise IDs that must be completed first ([] = always available)
  //   available   – array of opcode strings the learner may use
  //   unlocks     – opcode string unlocked on completion (or null)
  //   tests       – array of { inputs, expected } — keys are 'r0'..'r3' or '@0'..'@63'

  var LOOP_PRIMITIVES = ['INC', 'DEC', 'ISZ', 'ISN', 'STP', 'JMP'];

  var EXERCISE_DATA = [
    // ─── Tutorials (0–3) ──────────────────────────────────────────
    {
      id: 0,
      category: 'arithmetic',
      type: 'tutorial',
      requires: [],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: {},               expected: { r0: 42 } },
        { inputs: { r1: 5 },        expected: { r0: 42 } },
        { inputs: { r2: 100 },      expected: { r0: 42 } },
      ],
    },
    {
      id: 1,
      category: 'arithmetic',
      type: 'tutorial',
      requires: [0],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 7  }, expected: { r0: 7  } },
        { inputs: { r2: 0  }, expected: { r0: 0  } },
        { inputs: { r2: 99 }, expected: { r0: 99 } },
      ],
    },
    {
      id: 2,
      category: 'arithmetic',
      type: 'tutorial',
      requires: [1],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 0  }, expected: { r0: 3  } },
        { inputs: { r2: 5  }, expected: { r0: 8  } },
        { inputs: { r2: 10 }, expected: { r0: 13 } },
        { inputs: { r2: 1  }, expected: { r0: 4  } },
      ],
    },
    {
      id: 3,
      category: 'arithmetic',
      type: 'tutorial',
      requires: [2],
      available: LOOP_PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 0  }, expected: { r0: 0  } },
        { inputs: { r2: 1  }, expected: { r0: 1  } },
        { inputs: { r2: 5  }, expected: { r0: 5  } },
        { inputs: { r2: 10 }, expected: { r0: 10 } },
      ],
    },
    // ─── Challenges (4–6) ─────────────────────────────────────────
    {
      id: 4,
      category: 'arithmetic',
      type: 'challenge',
      requires: [3],
      available: PRIMITIVES,
      unlocks: 'ADD',
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 8  } },
        { inputs: { r2: 0,  r3: 0  }, expected: { r0: 0  } },
        { inputs: { r2: 1,  r3: 0  }, expected: { r0: 1  } },
        { inputs: { r2: 0,  r3: 7  }, expected: { r0: 7  } },
        { inputs: { r2: 10, r3: 10 }, expected: { r0: 20 } },
      ],
    },
    {
      id: 5,
      category: 'arithmetic',
      type: 'challenge',
      requires: [4],
      available: PRIMITIVES.concat(['ADD']),
      unlocks: 'MUL',
      tests: [
        { inputs: { r2: 3, r3: 4 }, expected: { r0: 12 } },
        { inputs: { r2: 0, r3: 5 }, expected: { r0: 0  } },
        { inputs: { r2: 5, r3: 0 }, expected: { r0: 0  } },
        { inputs: { r2: 1, r3: 7 }, expected: { r0: 7  } },
        { inputs: { r2: 7, r3: 1 }, expected: { r0: 7  } },
        { inputs: { r2: 6, r3: 6 }, expected: { r0: 36 } },
      ],
    },
    {
      id: 6,
      category: 'arithmetic',
      type: 'challenge',
      requires: [5],
      available: PRIMITIVES.concat(['ADD', 'MUL']),
      unlocks: 'POW',
      tests: [
        { inputs: { r2: 2, r3: 3  }, expected: { r0: 8  } },
        { inputs: { r2: 3, r3: 2  }, expected: { r0: 9  } },
        { inputs: { r2: 5, r3: 0  }, expected: { r0: 1  } },
        { inputs: { r2: 2, r3: 0  }, expected: { r0: 1  } },
        { inputs: { r2: 1, r3: 10 }, expected: { r0: 1  } },
        { inputs: { r2: 3, r3: 3  }, expected: { r0: 27 } },
      ],
    },

    // ─── Comparisons & Logic — Tutorials (7–8) ──────────────────
    {
      id: 7,
      category: 'comparisons',
      type: 'tutorial',
      requires: [6],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 10 }, expected: { r0: 5  } },
        { inputs: { r2: 5  }, expected: { r0: 0  } },
        { inputs: { r2: 3  }, expected: { r0: -2 } },
        { inputs: { r2: 0  }, expected: { r0: -5 } },
      ],
    },
    {
      id: 8,
      category: 'comparisons',
      type: 'tutorial',
      requires: [7],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 5   }, expected: { r0: 0 } },
        { inputs: { r2: 0   }, expected: { r0: 0 } },
        { inputs: { r2: -1  }, expected: { r0: 1 } },
        { inputs: { r2: -10 }, expected: { r0: 1 } },
      ],
    },
    // ─── Comparisons & Logic — Challenges (9–13) ────────────────
    {
      id: 9,
      category: 'comparisons',
      type: 'challenge',
      requires: [8],
      available: PRIMITIVES,
      unlocks: 'SUB',
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 2  } },
        { inputs: { r2: 10, r3: 10 }, expected: { r0: 0  } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: -2 } },
        { inputs: { r2: 0,  r3: 0  }, expected: { r0: 0  } },
        { inputs: { r2: 7,  r3: 0  }, expected: { r0: 7  } },
      ],
    },
    {
      id: 10,
      category: 'comparisons',
      type: 'challenge',
      requires: [9],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 5   }, expected: { r0: 5   } },
        { inputs: { r2: -5  }, expected: { r0: 5   } },
        { inputs: { r2: 0   }, expected: { r0: 0   } },
        { inputs: { r2: -1  }, expected: { r0: 1   } },
        { inputs: { r2: 100 }, expected: { r0: 100 } },
      ],
    },
    {
      id: 11,
      category: 'comparisons',
      type: 'challenge',
      requires: [10],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 5   }, expected: { r0: 1  } },
        { inputs: { r2: -3  }, expected: { r0: -1 } },
        { inputs: { r2: 0   }, expected: { r0: 0  } },
        { inputs: { r2: 100 }, expected: { r0: 1  } },
        { inputs: { r2: -1  }, expected: { r0: -1 } },
      ],
    },
    {
      id: 12,
      category: 'comparisons',
      type: 'challenge',
      requires: [11],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 3  } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: 3  } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r0: 4  } },
        { inputs: { r2: 0,  r3: 10 }, expected: { r0: 0  } },
        { inputs: { r2: -2, r3: 3  }, expected: { r0: -2 } },
      ],
    },
    {
      id: 13,
      category: 'comparisons',
      type: 'challenge',
      requires: [12],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 5  } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: 5  } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r0: 4  } },
        { inputs: { r2: 0,  r3: 10 }, expected: { r0: 10 } },
        { inputs: { r2: -2, r3: 3  }, expected: { r0: 3  } },
      ],
    },

    // ─── Comparisons & Logic — CMP & Conditional Jumps (14–19) ──────
    {
      id: 14,
      category: 'comparisons',
      type: 'challenge',
      requires: [13],
      available: PRIMITIVES,
      unlocks: 'CMP',
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 1  } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: -1 } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r0: 0  } },
        { inputs: { r2: 0,  r3: 0  }, expected: { r0: 0  } },
        { inputs: { r2: -2, r3: 3  }, expected: { r0: -1 } },
      ],
    },
    {
      id: 15,
      category: 'comparisons',
      type: 'challenge',
      requires: [14],
      available: PRIMITIVES,
      unlocks: 'JEQ',
      tests: [
        { inputs: { r2: 5,  r3: 5  }, expected: { r0: 1 } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: 0 } },
        { inputs: { r2: 0,  r3: 0  }, expected: { r0: 1 } },
        { inputs: { r2: -1, r3: -1 }, expected: { r0: 1 } },
        { inputs: { r2: 7,  r3: 3  }, expected: { r0: 0 } },
      ],
    },
    {
      id: 16,
      category: 'comparisons',
      type: 'challenge',
      requires: [15],
      available: PRIMITIVES,
      unlocks: 'JLT',
      tests: [
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: 1 } },
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 0 } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r0: 0 } },
        { inputs: { r2: -1, r3: 0  }, expected: { r0: 1 } },
        { inputs: { r2: 0,  r3: -1 }, expected: { r0: 0 } },
      ],
    },
    {
      id: 17,
      category: 'comparisons',
      type: 'challenge',
      requires: [16],
      available: PRIMITIVES,
      unlocks: 'JGE',
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 1 } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: 0 } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r0: 1 } },
        { inputs: { r2: 0,  r3: 0  }, expected: { r0: 1 } },
        { inputs: { r2: -1, r3: 0  }, expected: { r0: 0 } },
      ],
    },
    {
      id: 18,
      category: 'comparisons',
      type: 'challenge',
      requires: [17],
      available: PRIMITIVES,
      unlocks: 'JGT',
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 1 } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: 0 } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r0: 0 } },
        { inputs: { r2: 0,  r3: -1 }, expected: { r0: 1 } },
        { inputs: { r2: 1,  r3: 0  }, expected: { r0: 1 } },
      ],
    },
    {
      id: 19,
      category: 'comparisons',
      type: 'challenge',
      requires: [18],
      available: PRIMITIVES,
      unlocks: 'JLE',
      tests: [
        { inputs: { r2: 3,  r3: 5  }, expected: { r0: 1 } },
        { inputs: { r2: 5,  r3: 3  }, expected: { r0: 0 } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r0: 1 } },
        { inputs: { r2: -1, r3: 0  }, expected: { r0: 1 } },
        { inputs: { r2: 0,  r3: -1 }, expected: { r0: 0 } },
      ],
    },

    // ─── Swaps & Rearrangement — Tutorial (20) ───────────────────────
    {
      id: 20,
      category: 'swaps',
      type: 'tutorial',
      requires: [19],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 10, r3: 20 }, expected: { r2: 20, r3: 10 } },
        { inputs: { r2: 7,  r3: 3  }, expected: { r2: 3,  r3: 7  } },
        { inputs: { r2: 0,  r3: 99 }, expected: { r2: 99, r3: 0  } },
      ],
    },
    // ─── Swaps & Rearrangement — Challenges (21–24) ──────────────────
    {
      id: 21,
      category: 'swaps',
      type: 'challenge',
      requires: [20],
      available: PRIMITIVES,
      unlocks: 'SWP',
      tests: [
        { inputs: { r2: 10, r3: 20 }, expected: { r2: 20, r3: 10 } },
        { inputs: { r2: 1,  r3: 2  }, expected: { r2: 2,  r3: 1  } },
        { inputs: { r2: 0,  r3: 0  }, expected: { r2: 0,  r3: 0  } },
      ],
    },
    {
      id: 22,
      category: 'swaps',
      type: 'challenge',
      requires: [21],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r1: 1, r2: 2, r3: 3 }, expected: { r1: 3, r2: 1, r3: 2 } },
        { inputs: { r1: 5, r2: 6, r3: 7 }, expected: { r1: 7, r2: 5, r3: 6 } },
        { inputs: { r1: 0, r2: 0, r3: 0 }, expected: { r1: 0, r2: 0, r3: 0 } },
      ],
    },
    {
      id: 23,
      category: 'swaps',
      type: 'challenge',
      requires: [22],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r2: 5,  r3: 3  }, expected: { r2: 3,  r3: 5  } },
        { inputs: { r2: 3,  r3: 5  }, expected: { r2: 3,  r3: 5  } },
        { inputs: { r2: 4,  r3: 4  }, expected: { r2: 4,  r3: 4  } },
        { inputs: { r2: -2, r3: 3  }, expected: { r2: -2, r3: 3  } },
      ],
    },
    {
      id: 24,
      category: 'swaps',
      type: 'challenge',
      requires: [23],
      available: PRIMITIVES,
      unlocks: null,
      tests: [
        { inputs: { r1: 3, r2: 1, r3: 2 }, expected: { r1: 1, r2: 2, r3: 3 } },
        { inputs: { r1: 1, r2: 2, r3: 3 }, expected: { r1: 1, r2: 2, r3: 3 } },
        { inputs: { r1: 5, r2: 3, r3: 4 }, expected: { r1: 3, r2: 4, r3: 5 } },
      ],
    },
  ];

  // ─── Merge data + language text into full exercise objects ─────────

  function buildExercises() {
    var exercises = [];
    for (var i = 0; i < EXERCISE_DATA.length; i++) {
      var data = EXERCISE_DATA[i];
      var text = window.MiniASMLang.T('exercises.' + data.id);
      if (!text || typeof text !== 'object') text = {};
      var ex = {};
      // Copy structural data
      for (var key in data) ex[key] = data[key];
      // Overlay translatable text from language keys
      for (var t = 0; t < TEXT_FIELDS.length; t++) {
        var field = TEXT_FIELDS[t];
        var value = text[field];
        if (value === undefined || value === null) value = TEXT_DEFAULTS[field];
        ex[field] = Array.isArray(value) ? value.slice() : value;
      }
      exercises.push(ex);
    }
    return exercises;
  }

  var EXERCISES = buildExercises();

  // ─── Progress management (localStorage) ──────────────────────────────

  function loadProgress() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { completed: [] };
    } catch (e) {
      return { completed: [] };
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* quota exceeded or private mode — ignore */ }
  }

  function isCompleted(exerciseId) {
    return loadProgress().completed.indexOf(exerciseId) !== -1;
  }

  function markCompleted(exerciseId) {
    var progress = loadProgress();
    if (progress.completed.indexOf(exerciseId) === -1) {
      progress.completed.push(exerciseId);
    }
    saveProgress(progress);
  }

  /** An exercise is available when all its prerequisites are completed. */
  function isAvailable(exercise) {
    if (exercise.requires) {
      for (var i = 0; i < exercise.requires.length; i++) {
        if (!isCompleted(exercise.requires[i])) return false;
      }
      return true;
    }
    // Fallback for exercises without requires: all earlier exercises must be completed
    for (var i = 0; i < EXERCISES.length; i++) {
      if (EXERCISES[i].id < exercise.id && !isCompleted(EXERCISES[i].id)) {
        return false;
      }
    }
    return true;
  }

  /** Return the list of opcode names unlocked by completed exercises. */
  function getUnlockedInstructions() {
    var unlocked = [];
    for (var i = 0; i < EXERCISES.length; i++) {
      if (isCompleted(EXERCISES[i].id) && EXERCISES[i].unlocks) {
        unlocked.push(EXERCISES[i].unlocks);
      }
    }
    return unlocked;
  }

  // ─── Opcode validation ───────────────────────────────────────────────

  function validateOpcodes(source, allowed) {
    var errors = [];
    var lines = source.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.startsWith(';')) continue;
      var opcode = line.split(/\s+/)[0];
      if (allowed.indexOf(opcode) === -1) {
        errors.push({ line: i + 1, opcode: opcode });
      }
    }
    return errors;
  }

  // ─── Test runner ─────────────────────────────────────────────────────

  function runSingleTest(source, inputs) {
    var machine = window.MiniASM.createMachine();
    // Start with clean state
    var regs = {};
    for (var r = 0; r < CFG.registers.count; r++) regs[r] = 0;
    machine.registers = regs;
    machine.memory = new Array(CFG.memory.size).fill(0);

    try {
      window.MiniASM.loadProgram(machine, { source: source });
    } catch (e) {
      return { error: T('parseError') + e.message };
    }

    if (machine.code.length === 0) {
      return { error: T('noInstructions') };
    }

    // Apply test inputs (after load — loadProgram does not touch regs/memory)
    for (var key in inputs) {
      if (key.startsWith('r')) {
        machine.registers[parseInt(key.slice(1), 10)] = inputs[key];
      } else if (key.startsWith('@')) {
        machine.memory[parseInt(key.slice(1), 10)] = inputs[key];
      }
    }

    var halted = window.MiniASM.run(machine, 100000);
    if (!halted) {
      return { error: T('timeout') };
    }
    return { machine: machine };
  }

  /**
   * Return the effective set of allowed opcodes for an exercise:
   * its base `available` list + any instructions unlocked so far.
   */
  function effectiveAvailable(exercise) {
    var base = exercise.available.slice();
    var unlocked = getUnlockedInstructions();
    for (var i = 0; i < unlocked.length; i++) {
      if (base.indexOf(unlocked[i]) === -1) {
        base.push(unlocked[i]);
      }
    }
    return base;
  }

  /** Run all test cases for an exercise. Returns { results, allPassed, forbidden? }. */
  function runAllTests(exercise, source) {
    // Validate opcodes: base available + unlocked instructions
    var allowed = effectiveAvailable(exercise);
    var opcodeErrors = validateOpcodes(source, allowed);
    if (opcodeErrors.length > 0) {
      return { forbidden: opcodeErrors, results: [], allPassed: false };
    }

    var results = [];
    var allPassed = true;

    for (var i = 0; i < exercise.tests.length; i++) {
      var test = exercise.tests[i];
      var result = runSingleTest(source, test.inputs);

      if (result.error) {
        results.push({
          index: i, inputs: test.inputs, expected: test.expected,
          passed: false, error: result.error
        });
        allPassed = false;
        continue;
      }

      var m = result.machine;
      var passed = true;
      var actual = {};

      for (var key in test.expected) {
        var actualVal;
        if (key.startsWith('r')) {
          actualVal = m.registers[parseInt(key.slice(1), 10)];
        } else if (key.startsWith('@')) {
          actualVal = m.memory[parseInt(key.slice(1), 10)];
        }
        actual[key] = actualVal;
        if (actualVal !== test.expected[key]) passed = false;
      }

      results.push({
        index: i, inputs: test.inputs, expected: test.expected,
        actual: actual, passed: passed
      });
      if (!passed) allPassed = false;
    }

    return { results: results, allPassed: allPassed };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────

  function formatIO(d) {
    var parts = [];
    for (var key in d) {
      if (key.startsWith('@')) parts.push('mem[' + key.slice(1) + ']=' + d[key]);
      else parts.push(key + '=' + d[key]);
    }
    return parts.join(', ');
  }

  // ─── Public API ──────────────────────────────────────────────────────

  window.MiniASMExercises = {
    EXERCISES:    EXERCISES,
    CATEGORIES:   CATEGORIES,
    PRIMITIVES:   PRIMITIVES,
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    isCompleted:  isCompleted,
    markCompleted: markCompleted,
    isAvailable:  isAvailable,
    getUnlockedInstructions: getUnlockedInstructions,
    effectiveAvailable: effectiveAvailable,
    validateOpcodes: validateOpcodes,
    runAllTests:  runAllTests,
    formatIO:     formatIO,
  };
})();
