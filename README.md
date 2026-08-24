> **Public snapshot — runtime `miniasm`.**
> This repo is the version of [`kevin-cazal/miniasm_runtime`](https://github.com/kevin-cazal/miniasm_runtime) that is
> currently deployed by the workshop platform
> [CTFd_coding_platform](https://github.com/kevin-cazal/CTFd_coding_platform),
> taken at commit `7e18bae`. History is not carried over: this is a snapshot, not a fork.
> Used by: [miniasm_subject](https://github.com/kevin-cazal/miniasm_subject).
>
> `docker pull ghcr.io/kevin-cazal/miniasm_runtime.src:latest` — the image is built
> and published by `.github/workflows/` on every push to `main`.

# WDR+E (the not only paper computer)

> **This is the platform port of [kevin-cazal/miniasm](https://github.com/kevin-cazal/miniasm).**
> It is the same app, with history preserved, plus one addition: when embedded
> in a workshop platform that supplies `window.MiniASMTokenSecret`, passing an
> exercise's tests reveals a **completion token** the participant submits there.
> With no secret set the app behaves exactly as upstream — nothing is revealed,
> and it still runs standalone from a file:// or a static host.
>
> The derivation is `asm{first 12 hex of HMAC-SHA256(secret, "miniasm:<id>")}`
> (`js/token.js`, `tests/token.test.js`). The platform computes the same value
> when it imports the exercises, and uses it as the flag. Because the secret is
> per session, tokens rotate between cohorts.
>
> It is a deterrent and a record, not an exam: everything here runs in the
> browser, so a participant who reads the source can compute a token without
> solving anything.
>
> **Two other differences from upstream.** Monaco and Blockly are *vendored*
> (`scripts/vendor.sh` fetches them into `vendor/`, which is gitignored) so a
> room with no internet keeps its editor. And the exercise panel shows only the
> **title**: goal, description and hints now live in the platform's markdown,
> which is the single place they are maintained. The strings stay in `lang*.js`
> because they are what the platform's importer reads.
>
> ```sh
> scripts/vendor.sh    # once, before serving
> python3 -m http.server   # then open index.html
> ```

A browser-based virtual machine and IDE inspired by the [WDR paper computer](https://en.wikipedia.org/wiki/WDR_paper_computer) (Know-how Computer) — the 1983 educational model that used pen, paper, and matches to teach programming. WDR+E (+ extension) keeps the same spirit and a compatible core instruction set, but runs as a web app with registers, memory, and optional block-based editing.

---

## Machine specification

### Registers and memory

| Resource   | Default | Description |
|-----------|--------|-------------|
| **Registers** | 4 (`r0` … `r3`) | General-purpose; hold integers. Names use prefix `r` + index. |
| **Memory**     | 64 cells (`@0` … `@63`) | Addressable RAM; each cell holds an integer. Names use prefix `@` + index. |

Both are configurable (see `js/config.js`). On **Reset**, registers and memory are filled with random values in `[0, randomMax)` (default 256). Execution is limited to **maxSteps** (default 100 000) to guard against infinite loops.

### Operand types

Tokens in source code use a single-character prefix:

| Prefix | Type              | Example | Meaning                    |
|--------|--------------------|---------|----------------------------|
| `r`    | Register           | `r0`    | Register 0                 |
| `#`    | Immediate (literal) | `#42`   | Constant 42                |
| `@`    | Memory address     | `@5`    | Memory cell at index 5     |
| `i`    | Instruction number| `i3`    | Line 3 (1-based) for jumps |

### Instruction set

**Primitives** (always available; match the WDR paper computer’s Turing-complete core):

| Instruction | Arguments | Effect |
|-------------|-----------|--------|
| **INC** *rN* | Register | Add 1 to register *rN*. |
| **DEC** *rN* | Register | Subtract 1 from register *rN*. |
| **ISZ** *rN* | Register | If *rN* is zero, skip the next instruction; otherwise continue. |
| **ISN** *rN* | Register | If *rN* is negative, skip the next instruction; otherwise continue. |
| **JMP** *iN* | Instruction number | Jump to line *N* (1-based). |
| **STP**     | — | Halt the program. |

**Data** (extends the paper computer with copy/load/store):

| Instruction | Arguments | Effect |
|-------------|-----------|--------|
| **SET** *dest* *src* | Register or `@` address, then Register / `@` address / `#` immediate | Copy value from *src* into *dest*. |

**Unlockable arithmetic** (earned by completing exercises):

| Instruction | Arguments | Effect |
|-------------|-----------|--------|
| **ADD** *rX* *rY* | Register, Register | *rX* = *rX* + *rY* (*rY* unchanged). |
| **MUL** *rX* *rY* | Register, Register | *rX* = *rX* × *rY* (*rY* unchanged). |
| **POW** *rX* *rY* | Register, Register | *rX* = *rX* ^ *rY* (*rY* unchanged). |

Comments start with `;` and are ignored. Line numbers in the editor are logical (non-empty, non-comment) lines; **JMP** targets use 1-based instruction line numbers.

---

## Web app

Open `index.html` in a modern browser (or serve the folder with any static server). The UI is split into a **mode navigation bar**, an **editor panel**, and a **state panel**.

### Modes

- **Sandbox** — Free programming. You can use all **primitive** instructions plus any **unlockable** instructions you have already earned. Code is saved per mode in `localStorage`. No tests; focus is on run/step and inspecting registers and memory.
- **Exercise** — Guided challenges. Each exercise has a goal, description, allowed instructions, optional starter code, and hints. You may only use the **allowed** opcodes (primitives + any unlocked so far). Exercises are sequential: complete one to unlock the next. Passing all test cases marks the exercise complete and can unlock a new instruction (ADD, MUL, POW) for both sandbox and later exercises.

### UI elements

**Top: Mode navigation**

- **Sandbox** — Switch to sandbox mode.
- **1. …**, **2. …**, **3. …** — Exercise buttons. Locked (🔒) until previous exercises are done; show ✅ when completed. The active mode is highlighted.

**Editor panel (left)**

- **Code / Blocks** — Toggle between **text editor** (Monaco) and **Blockly** block editor. Both edit the same program; the toolbar’s allowed opcodes apply in both views. In Blockly, only blocks for allowed instructions appear in the toolbox.
- **Run** — Load current program, run until **STP** or maxSteps. Updates registers and memory in the state panel.
- **Step** — Load program if needed, then execute one instruction. Useful for debugging.
- **Reset** — Create a fresh machine (new random registers/memory), reload current program, set PC to first instruction.
- **▶ Test** — Visible only in exercise mode. Run all test cases for the current exercise (see below).
- **Status** — Shows “Stopped”, “Halted”, or “PC = &lt;line&gt;” (current instruction index).

**State panel (right)**

- **Exercise panel** (only in exercise mode):
  - **Title & goal** — Exercise number, title, and short goal.
  - **Description** — Full task text.
  - **Available** — List of opcodes you may use in this exercise.
  - **▶ Test** — Same as toolbar “Test”; runs the exercise test suite.
  - **💡 Hint** — Reveal hints one by one (counter shows remaining).
  - **Test results** — Per-case pass/fail/error and a summary. If you use a forbidden opcode, the report shows which line and opcode; on full pass, an “unlock” message appears if the exercise unlocks a new instruction.

- **Registers** — Table of register names and values. In sandbox/exercise after a Run/Step/Reset, values are **editable** (click a value, type a number, blur to commit). Useful to set inputs or fix state while debugging.

- **Memory** — Grid of memory cells by index. Same as registers: after the machine is created, cell values are **editable** for experimentation.

**Editor behaviour**

- **Code view**: Current program counter (PC) line is highlighted. Line numbers reflect only executable lines (comments are not counted).
- **Blocks view**: Blockly workspace shows the same program; PC is indicated on the blocks, and the toolbox only lists blocks for the currently allowed opcodes (sandbox or current exercise).

---

## Summary

| Aspect | Sandbox | Exercise |
|--------|--------|----------|
| Purpose | Free experimentation | Guided challenges |
| Allowed instructions | Primitives + unlocked | Primitives + unlocked, restricted to exercise’s set |
| Test button | Hidden | Visible; runs exercise tests |
| Exercise panel | Hidden | Visible (goal, description, hints, results) |
| Code storage | One buffer per mode in `localStorage` | Per-exercise buffer + starter code |

The machine is a small extension of the WDR paper computer: same INC/DEC/ISZ/JMP/STP core (plus ISN and SET), with registers and memory and optional ADD/MUL/POW unlocked through the exercise track.
