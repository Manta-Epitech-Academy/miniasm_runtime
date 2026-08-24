/**
 * MiniASM — Internationalization strings.
 * Each entry in LANGUAGES is a complete set of translatable text.
 * English is bundled here as the base language.
 * Additional language packs can register themselves at runtime.
 */
(function () {
  var LANGUAGES = [
    {
      code: 'en',
      name: 'English',

      // ─── Toolbar & Navigation ─────────────────────────────────
      sandbox: '🏖️ Sandbox',
      btnCode: 'Code',
      btnBlocks: 'Blocks',
      btnRun: 'Run',
      btnStop: 'Stop',
      btnStep: 'Step',
      btnReset: 'Reset',
      btnTest: '▶ Test',
      btnHint: '💡 Hint',
      speedLabel: 'Speed',
      speedInstant: 'Instant',
      resetOnEdit: 'Reset program on edit',
      confirmRestart: 'Program has finished. Restart from the beginning?',
      layoutReset: 'Reset panels',
      exShowResults: 'Show the test results',
      exHideResults: 'Hide the test results',
      navTutorials: 'Tutorials',
      navChallenges: 'Challenges',
      typeTutorial: 'tutorial',
      typeChallenge: 'challenge',

      // ─── Status bar ───────────────────────────────────────────
      stopped: 'Stopped',
      halted: 'Halted',
      pcLabel: 'PC = ',

      // ─── Tables ───────────────────────────────────────────────
      registers: 'Registers',
      value: 'Value',
      memory: 'Memory',

      // ─── Errors (shown to user) ───────────────────────────────
      parseError: 'Parse error: ',
      noInstructions: 'No instructions to execute',
      timeout: 'TIMEOUT — possible infinite loop (100 000 steps)',

      // ─── Challenge panel ──────────────────────────────────────
      challengePrefix: '{title}',
      tutorialPrefix: 'Tutorial: {title}',
      availableLabel: 'Available: ',
      hintBox: '💡 Hint {num}/{total}:\n{text}',
      hintsRemaining: '({n} left)',
      hintsNone: '(none left)',
      alreadyCompleted: '✅ Already completed!',
      dropdownPlaceholder: 'Challenges ▾',
      sandboxPanelTitle: '🏖️ Sandbox',
      sandboxPanelNote: 'Try anything you like here. Nothing is graded.\nGo back to the exercise tab to test it.',

      // ─── Test results ─────────────────────────────────────────
      forbiddenSingular: '⚠️ Forbidden instruction',
      forbiddenPlural: '⚠️ Forbidden instructions',
      lineLabel: 'Line ',
      allowedLabel: 'Allowed: ',
      testErrorLine: '⚠️ Test {n}: {io} → ERROR: {err}',
      testPassLine: '✅ Test {n}: {io} → {actual}',
      testFailLine: '❌ Test {n}: {io} → expected {expected}, got {actual}',
      allPassed: '🎉 All tests passed! Challenge completed!',
      unlockMsg: '🔓 New instruction unlocked: {instr}',
      tokenLabel: 'Completion token: ',
      tokenCopy: 'Copy',
      tokenCopied: 'Copied',
      stillPass: '🎉 All tests still pass!',
      someFailed: 'Some tests failed — keep trying!',

      // ─── Blockly blocks ───────────────────────────────────────
      blockStart: 'start',
      blockTo: 'to',
      tooltipStart: 'Program entry point. All instructions chain below this block.',
      tooltipSet: 'SET dest src — Copy a value into a register or memory cell.\ndest: reg (rN) or mem (@N)\nsrc: reg (rN), mem (@N), or immediate (#N)',
      tooltipInc: 'INC rN — Increment register rN by 1.',
      tooltipDec: 'DEC rN — Decrement register rN by 1.',
      tooltipIsz: 'ISZ rN — If register rN is zero, skip the next instruction.',
      tooltipIsn: 'ISN rN — If register rN is negative, skip the next instruction.',
      tooltipJmp: 'JMP iN — Jump to instruction N (unconditional goto).',
      tooltipStp: 'STP — Stop execution and halt the program.',
      tooltipAdd: 'ADD rX rY — rX = rX + rY  (rY is preserved)',
      tooltipSub: 'SUB rX rY — rX = rX − rY  (rY is preserved)',
      tooltipSwp: 'SWP rX rY — swap the values in rX and rY',
      tooltipMul: 'MUL rX rY — rX = rX × rY  (rY is preserved)',
      tooltipPow: 'POW rX rY — rX = rX ^ rY  (rY is preserved)',
      tooltipCmp: 'CMP rX rY — rX = sgn(rX − rY)\nSets rX to 1 (rX>rY), 0 (equal), or −1 (rX<rY).\nrY is preserved.',
      tooltipJeq: 'JEQ rX iN — If rX == 0, jump to instruction N.\nOften used after CMP to jump when values were equal.',
      tooltipJlt: 'JLT rX iN — If rX < 0, jump to instruction N.\nOften used after CMP to jump when first was less.',
      tooltipJgt: 'JGT rX iN — If rX > 0, jump to instruction N.\nOften used after CMP to jump when first was greater.',
      tooltipJge: 'JGE rX iN — If rX >= 0, jump to instruction N.\nOften used after CMP to jump when first was greater or equal.',
      tooltipJle: 'JLE rX iN — If rX <= 0, jump to instruction N.\nOften used after CMP to jump when first was less or equal.',
      blockComment: '; comment',
      tooltipComment: 'A comment line. Ignored by the machine.\nUse comments to document your code.',

      // ─── Blockly category names ───────────────────────────────
      catData: 'Data',
      catArithmetic: 'Arithmetic',
      catSwaps: 'Swaps',
      catControl: 'Control',
      catComparisons: 'Comparisons',
      catComments: 'Comments',
      categoryArithmetic: 'Arithmetic',
      categoryComparisons: 'Comparisons & Logic',
      categorySwaps: 'Swaps & Rearrangement',

      // ─── Challenge/tutorial text (keyed by id) ─────────────────
      exercises: {
        // ─── Tutorials (0–3) ─────────────────────────────────────
        0: {
          name: 'Tutorial',
          title: 'Hello, Machine!',
          goal: 'Set r0 to 42 and halt the program',
          description:
            'Welcome to MiniASM! This tutorial teaches you the basics.\n' +
            '\n' +
            '🖥️ THE MACHINE\n' +
            'You have 4 registers (r0, r1, r2, r3) — small numbered slots that hold values.\n' +
            'You also have 64 memory cells (@0–@63).\n' +
            'During tests, all registers start at 0 (unless the test sets them).\n' +
            '\n' +
            '📝 HOW TO WRITE CODE\n' +
            'Each line is one instruction:  OPCODE arguments\n' +
            'Lines starting with ; are comments (ignored by the machine).\n' +
            '\n' +
            '🧰 TWO INSTRUCTIONS TO LEARN\n' +
            '  SET r0 #42  → Put the number 42 into register r0\n' +
            '  STP         → Stop the program (REQUIRED at the end!)\n' +
            '\n' +
            '🎯 YOUR TASK\n' +
            'Write a program that sets r0 to exactly 42, then stops.\n' +
            'You only need two lines!\n' +
            '\n' +
            '▶ Click "Run" to execute, or "Step" to go one instruction at a time.\n' +
            '   When ready, click "Test" in this panel to check your answer.',
          hints: [
            'The SET instruction copies a value into a register.\nTo write a constant number, prefix it with #.\nExample: SET r0 #42',
            'Don\'t forget to end your program with STP!\nYour full program:\n  SET r0 #42\n  STP',
          ],
          starterCode:
            '; ─── Tutorial 0: Hello, Machine! ───\n' +
            '; Goal: Set r0 to 42 and halt\n' +
            ';\n' +
            '; Useful instructions:\n' +
            ';   SET r0 #42  — put 42 into r0\n' +
            ';   STP         — stop the program\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        1: {
          name: 'Tutorial',
          title: 'Copy Cat',
          goal: 'Copy the value of r2 into r0',
          description:
            'SET can also copy one register into another!\n' +
            '\n' +
            '🧰 NEW SKILL\n' +
            '  SET r0 r2   → Copy the value of r2 into r0\n' +
            '\n' +
            'You already know:\n' +
            '  SET r0 #N   → Put a constant N into r0\n' +
            '  STP         → Stop the program\n' +
            '\n' +
            '🎯 YOUR TASK\n' +
            'Register r2 is pre-loaded with a value by the test.\n' +
            'Copy that value into r0, then stop.\n' +
            '\n' +
            '💡 The difference:\n' +
            '  SET r0 #5   → Always puts 5 (a fixed number)\n' +
            '  SET r0 r2   → Copies whatever is in r2 (could be anything!)',
          hints: [
            'Use SET with two registers: SET r0 r2\nThis copies the value of r2 into r0.',
            'Your full program:\n  SET r0 r2\n  STP',
          ],
          starterCode:
            '; ─── Tutorial 1: Copy Cat ───\n' +
            '; Goal: Copy r2 into r0\n' +
            ';\n' +
            '; Useful instructions:\n' +
            ';   SET r0 r2  — copy r2 into r0\n' +
            ';   STP        — stop the program\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        2: {
          name: 'Tutorial',
          title: 'Step by Step',
          goal: 'Put r2 + 3 into r0',
          description:
            'Programs run one line at a time, top to bottom.\n' +
            'You can chain instructions to build up a result!\n' +
            '\n' +
            '🧰 NEW INSTRUCTIONS\n' +
            '  INC r0   → Add 1 to r0\n' +
            '  DEC r0   → Subtract 1 from r0\n' +
            '\n' +
            'You already know:\n' +
            '  SET r0 r2   → Copy r2 into r0\n' +
            '  STP         → Stop the program\n' +
            '\n' +
            '🎯 YOUR TASK\n' +
            'Register r2 has a number. Put r2 + 3 into r0.\n' +
            '\n' +
            '💡 STRATEGY\n' +
            '1. First, copy r2 into r0 (so you start with its value)\n' +
            '2. Then, add 1 to r0 three times\n' +
            '3. Stop!\n' +
            '\n' +
            '📌 Use "Step" to watch each instruction execute one at a time.',
          hints: [
            'Start by copying r2 into r0 with SET.\nThen use INC r0 three times to add 3.',
            'Your full program:\n  SET r0 r2\n  INC r0\n  INC r0\n  INC r0\n  STP',
          ],
          starterCode:
            '; ─── Tutorial 2: Step by Step ───\n' +
            '; Goal: Put r2 + 3 into r0\n' +
            ';\n' +
            '; Useful instructions:\n' +
            ';   SET r0 r2  — copy r2 into r0\n' +
            ';   INC r0     — add 1 to r0\n' +
            ';   DEC r0     — subtract 1 from r0\n' +
            ';   STP        — stop the program\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        3: {
          name: 'Tutorial',
          title: 'The Loop',
          goal: 'Transfer the value of r2 into r0 using a loop',
          description:
            'The most powerful concept: LOOPS!\n' +
            'A loop repeats instructions until a condition is met.\n' +
            '\n' +
            '🧰 NEW INSTRUCTIONS\n' +
            '  ISZ r2    → If r2 is zero, SKIP the next line\n' +
            '  JMP i4    → Jump to line 4 (go back / go forward)\n' +
            '\n' +
            '🔄 THE LOOP PATTERN\n' +
            'Here\'s how to repeat something until r2 reaches 0:\n' +
            '\n' +
            '  Line 1: ISZ r2    ← Is r2 zero?\n' +
            '  Line 2: JMP i4    ← NO → jump to loop body (line 4)\n' +
            '  Line 3: STP       ← YES → done! stop here\n' +
            '  Line 4: ...       ← loop body (do your work)\n' +
            '  Line 5: ...       ← more work\n' +
            '  Line 6: JMP i1    ← go back to check again\n' +
            '\n' +
            '🎯 YOUR TASK\n' +
            'r2 has a number. Transfer it into r0, one unit at a time.\n' +
            'Each loop step: DEC r2 (remove 1) and INC r0 (add 1).\n' +
            'When r2 reaches 0, r0 holds the original value!\n' +
            '\n' +
            '⚠️ SET is NOT available — you must use the loop!\n' +
            '   (During tests, r0 starts at 0.)',
          hints: [
            'Follow the loop pattern from the description.\nYour loop body should DEC r2 and INC r0.\nThen JMP back to the ISZ check.',
            'Full solution:\n  ISZ r2\n  JMP i4\n  STP\n  DEC r2\n  INC r0\n  JMP i1',
          ],
          starterCode:
            '; ─── Tutorial 3: The Loop ───\n' +
            '; Goal: Transfer r2 into r0 using a loop\n' +
            ';\n' +
            '; Available: INC, DEC, ISZ, ISN, JMP, STP\n' +
            '; (SET is NOT available!)\n' +
            ';\n' +
            '; The loop pattern:\n' +
            ';   ISZ r2    ; check if r2 is 0\n' +
            ';   JMP i?    ; if not, jump to loop body\n' +
            ';   STP       ; if yes, we\'re done\n' +
            ';   ...       ; loop body\n' +
            ';   JMP i1    ; go back to check\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        // ─── Challenges (4–6) ────────────────────────────────────
        4: {
          name: 'ADD',
          title: 'Addition',
          goal: 'Put r2 + r3 into r0',
          description:
            'Registers r2 and r3 are pre-loaded with values.\n' +
            'Write a program that:\n' +
            '  • Computes r2 + r3\n' +
            '  • Stores the result in r0\n' +
            '  • Ends with STP\n' +
            '\n' +
            'You may use r0, r1 as scratch registers and memory (@0–@63).\n' +
            '\n' +
            '💡 Hint: combine what you learned in the tutorials!\n' +
            '   Copy r2 into r0 (SET), then loop to add r3 into r0.',
          hints: [
            'You can only INC and DEC by 1.\nThink: how would you move a value from r3 into r0, one unit at a time?',
            'First copy r2 into r0 (SET r0 r2).\nThen loop: INC r0, DEC r3, repeat until r3 == 0.\nUse ISZ r3 to detect when to stop.',
          ],
          starterCode:
            '; ─── Challenge: Addition ───\n' +
            '; Goal: Put r2 + r3 into r0\n' +
            ';\n' +
            '; Available: SET, INC, DEC, ISZ, ISN, STP, JMP\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            '; r0, r1 are free to use as scratch.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        5: {
          name: 'MUL',
          title: 'Multiplication',
          goal: 'Put r2 × r3 into r0',
          description:
            'Registers r2 and r3 are pre-loaded with values.\n' +
            'Write a program that:\n' +
            '  • Computes r2 × r3\n' +
            '  • Stores the result in r0\n' +
            '  • Ends with STP\n' +
            '\n' +
            'You may use r0, r1 as scratch registers and memory (@0–@63).\n' +
            '\n' +
            '💡 You now have ADD rX rY available from the previous exercise!',
          hints: [
            'Multiplication is repeated addition.\n3 × 4 = 3 + 3 + 3 + 3  (add 3 to a result, 4 times).',
            'Set r0 to 0. Copy r2 into r1 (to preserve it).\nLoop: ADD r0 r1, DEC r3, repeat until r3 == 0.\nUse ISZ r3 to detect when to stop.',
          ],
          starterCode:
            '; ─── Challenge: Multiplication ───\n' +
            '; Goal: Put r2 × r3 into r0\n' +
            ';\n' +
            '; Available: SET, INC, DEC, ISZ, ISN, STP, JMP, ADD\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            '; r0, r1 are free to use as scratch.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        6: {
          name: 'POW',
          title: 'Exponentiation',
          goal: 'Put r2 ^ r3 into r0  (r2 raised to the power r3)',
          description:
            'Registers r2 and r3 are pre-loaded with values.\n' +
            'Write a program that:\n' +
            '  • Raises r2 to the power of r3\n' +
            '  • Stores the result in r0\n' +
            '  • Ends with STP\n' +
            '\n' +
            'You may use r0, r1 as scratch registers and memory (@0–@63).\n' +
            '\n' +
            '💡 You now have ADD and MUL available!',
          hints: [
            'Exponentiation is repeated multiplication.\n2^3 = 2 × 2 × 2  (multiply 1 by the base, exponent times).',
            'Remember: x^0 = 1 for any x.\nStart r0 at 1. Copy r2 into r1 (to preserve the base).\nLoop: MUL r0 r1, DEC r3, repeat until r3 == 0.',
          ],
          starterCode:
            '; ─── Challenge: Exponentiation ───\n' +
            '; Goal: Put r2 ^ r3 into r0\n' +
            ';\n' +
            '; Available: SET, INC, DEC, ISZ, ISN, STP, JMP, ADD, MUL\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            '; r0, r1 are free to use as scratch.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },

        // ─── Comparisons & Logic — Tutorials (7–8) ─────────────
        7: {
          name: 'Tutorial',
          title: 'Going Down',
          goal: 'Put r2 − 5 into r0',
          description:
            'You know INC adds 1. Time to learn its twin: DEC subtracts 1!\n' +
            '\n' +
            '🧰 KEY INSTRUCTION\n' +
            '  DEC r0   → Subtract 1 from r0\n' +
            '\n' +
            '⚠️ VALUES CAN GO NEGATIVE\n' +
            'If r0 is 3 and you DEC three times, r0 becomes 0.\n' +
            'DEC one more time? r0 becomes −1!\n' +
            'Registers can hold negative numbers.\n' +
            '\n' +
            '🎯 YOUR TASK\n' +
            'Register r2 has a number. Put r2 − 5 into r0, then stop.\n' +
            '\n' +
            '💡 STRATEGY\n' +
            '1. Copy r2 into r0\n' +
            '2. DEC r0 five times\n' +
            '3. Stop!',
          hints: [
            'Copy r2 into r0 with SET, then use DEC r0 five times.',
            'Full solution:\n  SET r0 r2\n  DEC r0\n  DEC r0\n  DEC r0\n  DEC r0\n  DEC r0\n  STP',
          ],
          starterCode:
            '; ─── Tutorial: Going Down ───\n' +
            '; Goal: Put r2 − 5 into r0\n' +
            ';\n' +
            '; Useful instructions:\n' +
            ';   SET r0 r2  — copy r2 into r0\n' +
            ';   DEC r0     — subtract 1 from r0\n' +
            ';   STP        — stop the program\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        8: {
          name: 'Tutorial',
          title: 'Which Way?',
          goal: 'Set r0 to 1 if r2 is negative, 0 otherwise',
          description:
            'Now that you know values can be negative, let\'s learn to detect it!\n' +
            '\n' +
            '🧰 KEY INSTRUCTION\n' +
            '  ISN r2   → If r2 is negative, SKIP the next line\n' +
            '\n' +
            'This is like ISZ (skip if zero), but for negative numbers.\n' +
            'The pattern is the same:\n' +
            '\n' +
            '  ISN r2       ← Is r2 negative?\n' +
            '  JMP i4       ← NO → jump somewhere\n' +
            '  ...          ← YES → this runs (the skip jumped over JMP)\n' +
            '  STP\n' +
            '\n' +
            '🎯 YOUR TASK\n' +
            'If r2 is negative, set r0 to 1. Otherwise, set r0 to 0.\n' +
            'Think of it as answering: "Is r2 negative? Yes (1) or No (0)".',
          hints: [
            'Use ISN r2 to check if r2 is negative.\nIf it IS negative, ISN skips the next line.\nUse JMP to skip over the "yes" code when it\'s not negative.',
            'Full solution:\n  SET r0 #0\n  ISN r2\n  JMP i5\n  SET r0 #1\n  STP',
          ],
          starterCode:
            '; ─── Tutorial: Which Way? ───\n' +
            '; Goal: r0 = 1 if r2 < 0, else r0 = 0\n' +
            ';\n' +
            '; Key instruction:\n' +
            ';   ISN r2  — if r2 < 0, skip the next line\n' +
            ';\n' +
            '; The pattern:\n' +
            ';   ISN r2      ; check if negative\n' +
            ';   JMP i?      ; not negative → jump past\n' +
            ';   ...         ; negative → do something here\n' +
            ';   STP\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        // ─── Comparisons & Logic — Challenges (9–13) ───────────
        9: {
          name: 'SUB',
          title: 'Subtraction',
          goal: 'Put r2 − r3 into r0',
          description:
            'You built ADD with a loop (INC in a loop).\n' +
            'Now do the opposite: build subtraction!\n' +
            '\n' +
            'Registers r2 and r3 are pre-loaded with values.\n' +
            'Write a program that:\n' +
            '  • Computes r2 − r3\n' +
            '  • Stores the result in r0\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 Hint: it\'s like ADD, but use DEC instead of INC.\n' +
            '   Copy r2 into r0, then DEC r0 once for each unit in r3.',
          hints: [
            'Copy r2 into r0 with SET.\nThen loop: DEC r0 and DEC r3, until r3 reaches 0.\nUse ISZ r3 to check.',
            'Full approach:\n  SET r0 r2\n  ISZ r3\n  JMP i5\n  STP\n  DEC r0\n  DEC r3\n  JMP i2',
          ],
          starterCode:
            '; ─── Challenge: Subtraction ───\n' +
            '; Goal: Put r2 − r3 into r0\n' +
            ';\n' +
            '; Available: SET, INC, DEC, ISZ, ISN, STP, JMP\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        10: {
          name: 'ABS',
          title: 'Absolute Value',
          goal: 'Put |r2| into r0 (always non-negative)',
          description:
            'The absolute value of a number is its "distance from zero":\n' +
            '  |5| = 5,  |−5| = 5,  |0| = 0\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Computes |r2| (absolute value of r2)\n' +
            '  • Stores the result in r0\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 You now have SUB! Think about how to negate a negative number.\n' +
            '   If r2 is negative: 0 − r2 gives you the positive version.',
          hints: [
            'Copy r2 into r0.\nCheck if r0 is negative (ISN).\nIf not negative, you\'re done.\nIf negative, compute 0 − r0 to flip the sign.',
            'One approach:\n  SET r0 r2\n  ISN r0\n  JMP i7\n  SET r1 #0\n  SUB r1 r0\n  SET r0 r1\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Absolute Value ───\n' +
            '; Goal: Put |r2| into r0\n' +
            ';\n' +
            '; You have SUB now!\n' +
            '; Input in r2. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        11: {
          name: 'SGN',
          title: 'Sign Function',
          goal: 'Set r0 to the sign of r2: 1, 0, or −1',
          description:
            'The sign function tells you the "direction" of a number:\n' +
            '  sgn(5)  = 1   (positive)\n' +
            '  sgn(0)  = 0   (zero)\n' +
            '  sgn(−3) = −1  (negative)\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Sets r0 to 1 if r2 > 0\n' +
            '  • Sets r0 to 0 if r2 = 0\n' +
            '  • Sets r0 to −1 if r2 < 0\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 You need three branches:\n' +
            '   Check zero (ISZ), check negative (ISN), otherwise positive.',
          hints: [
            'Use ISZ to check if r2 is zero, and ISN to check if r2 is negative.\nIf neither: r2 is positive, so r0 = 1.',
            'One approach:\n  ISZ r2\n  JMP i5\n  SET r0 #0\n  STP\n  ISN r2\n  JMP i10\n  SET r0 #0\n  DEC r0\n  STP\n  SET r0 #1\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Sign Function ───\n' +
            '; Goal: r0 = 1 if r2>0, 0 if r2=0, −1 if r2<0\n' +
            ';\n' +
            '; Input in r2. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        12: {
          name: 'MIN',
          title: 'Minimum',
          goal: 'Put min(r2, r3) into r0',
          description:
            'Write a program that finds the smaller of two values.\n' +
            '\n' +
            'Registers r2 and r3 hold two numbers.\n' +
            'Write a program that:\n' +
            '  • Computes the minimum of r2 and r3\n' +
            '  • Stores it in r0\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 Compare r2 and r3 using SUB.\n' +
            '   If r2 − r3 is negative, r2 is smaller.',
          hints: [
            'Compute r2 − r3 and check its sign with ISN.\nIf negative → r2 < r3, so r0 = r2.\nOtherwise → r0 = r3.',
            'One approach:\n  SET r0 r2\n  SUB r0 r3\n  ISN r0\n  JMP i7\n  SET r0 r2\n  STP\n  SET r0 r3\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Minimum ───\n' +
            '; Goal: r0 = min(r2, r3)\n' +
            ';\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        13: {
          name: 'MAX',
          title: 'Maximum',
          goal: 'Put max(r2, r3) into r0',
          description:
            'Write a program that finds the larger of two values.\n' +
            '\n' +
            'Registers r2 and r3 hold two numbers.\n' +
            'Write a program that:\n' +
            '  • Computes the maximum of r2 and r3\n' +
            '  • Stores it in r0\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 Same approach as MIN, but swap which value you pick!',
          hints: [
            'Compute r2 − r3 and check its sign with ISN.\nIf negative → r2 < r3, so r0 = r3 (the bigger one).\nOtherwise → r0 = r2.',
            'One approach:\n  SET r0 r2\n  SUB r0 r3\n  ISN r0\n  JMP i7\n  SET r0 r3\n  STP\n  SET r0 r2\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Maximum ───\n' +
            '; Goal: r0 = max(r2, r3)\n' +
            ';\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        // ─── Comparisons & Logic — CMP & Conditional Jumps (14–19) ──
        14: {
          name: 'CMP',
          title: 'Compare',
          goal: 'Put sgn(r2 − r3) into r0: 1, 0, or −1',
          description:
            'You already know SUB (subtraction) and SGN (sign function).\n' +
            'Now combine them into a single comparison!\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Sets r0 to 1 if r2 > r3\n' +
            '  • Sets r0 to 0 if r2 = r3\n' +
            '  • Sets r0 to −1 if r2 < r3\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 This is SUB followed by SGN!\n' +
            '   Compute r2 − r3, then find its sign.',
          hints: [
            'Copy r2 into r0, then SUB r0 r3.\nNow r0 = r2 − r3. Apply the SGN pattern: check ISZ and ISN.',
            'One approach:\n  SET r0 r2\n  SUB r0 r3\n  ISZ r0\n  JMP i6\n  STP\n  ISN r0\n  JMP i11\n  SET r0 #0\n  DEC r0\n  STP\n  SET r0 #1\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Compare ───\n' +
            '; Goal: r0 = sgn(r2 − r3)\n' +
            ';\n' +
            '; Hint: SUB then SGN!\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        15: {
          name: 'JEQ',
          title: 'Jump if Equal',
          goal: 'Set r0 to 1 if r2 == r3, else 0',
          description:
            'Detect whether two values are equal.\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Sets r0 to 1 if r2 equals r3\n' +
            '  • Sets r0 to 0 otherwise\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 You now have CMP! Use CMP to get the comparison result,\n' +
            '   then check if it\'s zero with ISZ.',
          hints: [
            'CMP r0 r3 gives 0 when equal.\nUse ISZ to detect that and branch to set r0 = 1.',
            'One approach:\n  SET r0 r2\n  CMP r0 r3\n  ISZ r0\n  JMP i7\n  SET r0 #1\n  STP\n  SET r0 #0\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Jump if Equal ───\n' +
            '; Goal: r0 = 1 if r2 == r3, else 0\n' +
            ';\n' +
            '; You have CMP now!\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        16: {
          name: 'JLT',
          title: 'Jump if Less Than',
          goal: 'Set r0 to 1 if r2 < r3, else 0',
          description:
            'Detect whether one value is strictly less than another.\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Sets r0 to 1 if r2 < r3\n' +
            '  • Sets r0 to 0 otherwise\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 Use CMP to get the comparison result,\n' +
            '   then check if it\'s negative with ISN.',
          hints: [
            'CMP r0 r3 gives −1 when r2 < r3.\nUse ISN to detect negative and branch to set r0 = 1.',
            'One approach:\n  SET r0 r2\n  CMP r0 r3\n  ISN r0\n  JMP i7\n  SET r0 #1\n  STP\n  SET r0 #0\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Jump if Less Than ───\n' +
            '; Goal: r0 = 1 if r2 < r3, else 0\n' +
            ';\n' +
            '; You have CMP now!\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        17: {
          name: 'JGE',
          title: 'Jump if Greater or Equal',
          goal: 'Set r0 to 1 if r2 >= r3, else 0',
          description:
            'Detect whether one value is greater than or equal to another.\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Sets r0 to 1 if r2 ≥ r3\n' +
            '  • Sets r0 to 0 otherwise\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 Think about it: r2 ≥ r3 is the opposite of r2 < r3.\n' +
            '   Use CMP + ISN, but swap which branch gives 1 vs 0!',
          hints: [
            'CMP r0 r3 gives −1 when r2 < r3 (NOT ≥).\nISN skips when negative. So if it\'s NOT negative, r2 ≥ r3.',
            'One approach:\n  SET r0 r2\n  CMP r0 r3\n  ISN r0\n  JMP i7\n  SET r0 #0\n  STP\n  SET r0 #1\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Jump if Greater or Equal ───\n' +
            '; Goal: r0 = 1 if r2 >= r3, else 0\n' +
            ';\n' +
            '; You have CMP now!\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        18: {
          name: 'JGT',
          title: 'Jump if Greater Than',
          goal: 'Set r0 to 1 if r2 > r3, else 0',
          description:
            'Detect whether one value is strictly greater than another.\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Sets r0 to 1 if r2 > r3\n' +
            '  • Sets r0 to 0 otherwise\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 This is trickier! r2 > r3 means "not equal AND not less".\n' +
            '   After CMP, the result is 1 (positive) only when r2 > r3.\n' +
            '   You need to check: NOT zero AND NOT negative.',
          hints: [
            'After CMP, check ISZ first (equal → 0), then check ISN (less → 0).\nIf neither: r2 > r3 → set r0 = 1.',
            'One approach:\n  SET r0 r2\n  CMP r0 r3\n  ISZ r0\n  JMP i7\n  SET r0 #0\n  STP\n  ISN r0\n  JMP i11\n  SET r0 #0\n  STP\n  SET r0 #1\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Jump if Greater Than ───\n' +
            '; Goal: r0 = 1 if r2 > r3, else 0\n' +
            ';\n' +
            '; You have CMP now!\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        19: {
          name: 'JLE',
          title: 'Jump if Less or Equal',
          goal: 'Set r0 to 1 if r2 <= r3, else 0',
          description:
            'Detect whether one value is less than or equal to another.\n' +
            '\n' +
            'Write a program that:\n' +
            '  • Sets r0 to 1 if r2 ≤ r3\n' +
            '  • Sets r0 to 0 otherwise\n' +
            '  • Ends with STP\n' +
            '\n' +
            '💡 r2 ≤ r3 is the opposite of r2 > r3.\n' +
            '   After CMP, the result is ≤ 0 (zero or negative).\n' +
            '   Check: zero OR negative.',
          hints: [
            'After CMP, check ISZ (equal → 1), then ISN (less → 1).\nIf neither: r2 > r3 → set r0 = 0.',
            'One approach:\n  SET r0 r2\n  CMP r0 r3\n  ISZ r0\n  JMP i7\n  SET r0 #1\n  STP\n  ISN r0\n  JMP i11\n  SET r0 #1\n  STP\n  SET r0 #0\n  STP',
          ],
          starterCode:
            '; ─── Challenge: Jump if Less or Equal ───\n' +
            '; Goal: r0 = 1 if r2 <= r3, else 0\n' +
            ';\n' +
            '; You have CMP now!\n' +
            '; Inputs in r2 and r3. Store result in r0.\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        // ─── Swaps & Rearrangement — Tutorial (20) ─────────────────
        20: {
          name: 'Tutorial',
          title: 'The Spare Drawer',
          goal: 'Swap the values in r2 and r3 using a third register as temp',
          description:
            '; ─── Tutorial: The Spare Drawer ───\n' +
            ';\n' +
            '; You have two values in r2 and r3. Your job: swap them.\n' +
            '; After your program halts, r2 must hold the old r3, and r3 the old r2.\n' +
            ';\n' +
            '; You don\'t have a SWAP instruction yet — use a "spare drawer":\n' +
            '; copy one value into another register (e.g. r0), then move the second\n' +
            '; into the first slot, then restore from the spare.\n' +
            ';\n' +
            '; Useful: SET r0 r2  (copy r2 into r0), then SET r2 r3, then SET r3 r0.',
          hints: [
            'Use r0 (or r1) as a temporary. First save r2 there, then overwrite r2 with r3, then write the saved value into r3.',
          ],
          starterCode:
            '; ─── Tutorial: The Spare Drawer ───\n' +
            '; Goal: swap r2 and r3 using a temp register\n' +
            ';\n' +
            '; Write your code below:\n' +
            '\n' +
            'STP\n',
        },
        // ─── Swaps & Rearrangement — Challenges (21–24) ─────────────
        21: {
          name: 'SWAP',
          title: 'Swap',
          goal: 'Swap r2 and r3 (r2 gets old r3, r3 gets old r2)',
          description:
            'Same as the tutorial: swap the values in r2 and r3.\n' +
            'Complete this challenge to unlock the SWP instruction!',
          hints: [
            'Use a temp register (r0 or r1): SET temp r2, SET r2 r3, SET r3 temp.',
          ],
          starterCode:
            '; ─── Challenge: Swap ───\n' +
            '; Goal: swap r2 and r3\n' +
            ';\n' +
            '\n' +
            'STP\n',
        },
        22: {
          name: 'ROTATE3',
          title: 'Rotate three',
          goal: 'Rotate r1→r2→r3→r1 (cyclic shift)',
          description:
            'After your program halts: r1 must hold the old r3, r2 the old r1, r3 the old r2.\n' +
            'You now have SWP — use it to do the rotation with a couple of swaps.',
          hints: [
            'Two swaps can rotate three values: e.g. SWP r1 r2 then SWP r2 r3 (or SWP r1 r3 then SWP r2 r3). Try different orders.',
          ],
          starterCode:
            '; ─── Challenge: Rotate three ───\n' +
            '; Goal: r1←r3, r2←r1, r3←r2\n' +
            ';\n' +
            '\n' +
            'STP\n',
        },
        23: {
          name: 'SORT2',
          title: 'Sort two',
          goal: 'Put min(r2,r3) in r2 and max(r2,r3) in r3',
          description:
            'Sort the two values: when you halt, r2 must be ≤ r3.\n' +
            'You have CMP and conditional jumps for comparison, and SWP for swapping!',
          hints: [
            'If r2 > r3, swap them. Use CMP + JLE (or JGT) to decide.',
          ],
          starterCode:
            '; ─── Challenge: Sort two ───\n' +
            '; Goal: r2 = min, r3 = max\n' +
            ';\n' +
            '\n' +
            'STP\n',
        },
        24: {
          name: 'SORT3',
          title: 'Sort three',
          goal: 'Sort r1 ≤ r2 ≤ r3 (ascending order)',
          description:
            'When you halt, r1 must be the smallest, r2 the middle, r3 the largest.\n' +
            'Use CMP and conditional jumps for comparisons, and SWP for swaps.',
          hints: [
            'Sort r1 and r2, then r2 and r3, then r1 and r2 again (like a tiny bubble sort).',
          ],
          starterCode:
            '; ─── Challenge: Sort three ───\n' +
            '; Goal: r1 ≤ r2 ≤ r3\n' +
            ';\n' +
            '\n' +
            'STP\n',
        },
      },
    },
  ];

  function cloneArray(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) out.push(cloneValue(arr[i]));
    return out;
  }

  function cloneObject(obj) {
    var out = {};
    for (var key in obj) out[key] = cloneValue(obj[key]);
    return out;
  }

  function cloneValue(value) {
    if (Array.isArray(value)) return cloneArray(value);
    if (value && typeof value === 'object') return cloneObject(value);
    return value;
  }

  function deepMerge(base, extra) {
    var out = cloneValue(base);
    for (var key in extra) {
      var v = extra[key];
      if (v && typeof v === 'object' && !Array.isArray(v) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
        out[key] = deepMerge(out[key], v);
      } else {
        out[key] = cloneValue(v);
      }
    }
    return out;
  }

  var languageByCode = {};
  function rebuildLanguageIndex() {
    languageByCode = {};
    for (var i = 0; i < LANGUAGES.length; i++) {
      languageByCode[LANGUAGES[i].code] = LANGUAGES[i];
    }
  }
  rebuildLanguageIndex();

  function getPreferredCode() {
    try {
      var saved = localStorage.getItem('miniasm-lang');
      if (saved) return saved;
    } catch (e) { /* ignore */ }

    return 'en';
  }

  var preferredCode = getPreferredCode();
  var current = languageByCode[preferredCode] || LANGUAGES[0];

  function resolvePath(obj, key) {
    if (!obj || !key) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];

    var parts = key.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, parts[i])) {
        return undefined;
      }
      cur = cur[parts[i]];
    }
    return cur;
  }

  /**
   * Get a translated value by key.
   * Supports key paths (e.g. "exercises.0.title").
   * For strings, optional placeholders are substituted.
   * Falls back to English when key is missing in current language.
   */
  function T(key, params) {
    var value = resolvePath(current, key);
    if (value === undefined) value = resolvePath(LANGUAGES[0], key);
    if (value === undefined) return key;

    if (typeof value !== 'string') return cloneValue(value);
    if (!params) return value;

    var s = value;
    for (var p in params) {
      s = s.replace(new RegExp('\\{' + p + '\\}', 'g'), params[p]);
    }
    return s;
  }

  window.MiniASMLang = {
    LANGUAGES: LANGUAGES,
    current: function () { return current; },
    setCurrent: function (code) {
      if (languageByCode[code]) {
        current = languageByCode[code];
        try { localStorage.setItem('miniasm-lang', code); } catch (e) { /* ignore */ }
        return true;
      }
      return false;
    },
    registerLanguage: function (language, baseCode) {
      if (!language || !language.code) return false;

      var base = languageByCode[baseCode || LANGUAGES[0].code] || LANGUAGES[0];
      var merged = deepMerge(base, language);
      var existing = languageByCode[merged.code];

      if (existing) {
        for (var i = 0; i < LANGUAGES.length; i++) {
          if (LANGUAGES[i].code === merged.code) {
            LANGUAGES[i] = merged;
            break;
          }
        }
      } else {
        LANGUAGES.push(merged);
      }
      rebuildLanguageIndex();
      if (preferredCode === merged.code) current = merged;
      return true;
    },
    T: T,
  };
})();
