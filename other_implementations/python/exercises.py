#!/usr/bin/env python3
"""MiniASM Exercise System — Learn programming through progressive challenges.

Each exercise asks you to implement a higher-level operation using only
the instructions you've unlocked so far. Completing an exercise unlocks
a new instruction you can use in future exercises.

Usage:
    cd other_implementations/python && python exercises.py
"""

import json
import os
from dataclasses import dataclass
from interpreter import (
    Machine, Instruction, Register,
    Inst, Union,
)
from config import REGISTER_COUNT, REGISTER_PREFIX, MAX_STEPS

# ─── Directory / file paths ───────────────────────────────────────────────────

BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
EXERCISES_DIR = os.path.join(BASE_DIR, "exercises")
PROGRESS_FILE = os.path.join(BASE_DIR, "progress.json")

# ─── Unlockable instructions (rewards) ────────────────────────────────────────

@dataclass
class ADD(Instruction):
    """ADD rX rY — rX = rX + rY  (rY is preserved)"""
    x: Register
    y: Register

    def execute(self, machine: Machine) -> None:
        machine.registers[self.x] += machine.registers[self.y]


@dataclass
class SUB(Instruction):
    """SUB rX rY — rX = rX - rY  (rY is preserved)"""
    x: Register
    y: Register

    def execute(self, machine: Machine) -> None:
        machine.registers[self.x] -= machine.registers[self.y]


@dataclass
class MUL(Instruction):
    """MUL rX rY — rX = rX × rY  (rY is preserved)"""
    x: Register
    y: Register

    def execute(self, machine: Machine) -> None:
        machine.registers[self.x] *= machine.registers[self.y]


@dataclass
class POW(Instruction):
    """POW rX rY — rX = rX ^ rY  (rY is preserved)"""
    x: Register
    y: Register

    def execute(self, machine: Machine) -> None:
        machine.registers[self.x] **= machine.registers[self.y]


@dataclass
class CMP(Instruction):
    """CMP rX rY — rX = 1 if rX > rY, else rX = 0  (rY is preserved)"""
    x: Register
    y: Register

    def execute(self, machine: Machine) -> None:
        machine.registers[self.x] = 1 if machine.registers[self.x] > machine.registers[self.y] else 0


UNLOCKABLE = {
    "ADD": {"args": [Register, Register], "inst": ADD,
            "usage": "ADD rX rY", "desc": "rX = rX + rY (rY preserved)"},
    "SUB": {"args": [Register, Register], "inst": SUB,
            "usage": "SUB rX rY", "desc": "rX = rX - rY (rY preserved)"},
    "MUL": {"args": [Register, Register], "inst": MUL,
            "usage": "MUL rX rY", "desc": "rX = rX × rY (rY preserved)"},
    "POW": {"args": [Register, Register], "inst": POW,
            "usage": "POW rX rY", "desc": "rX = rX ^ rY (rY preserved)"},
    "CMP": {"args": [Register, Register], "inst": CMP,
            "usage": "CMP rX rY", "desc": "rX = 1 if rX > rY, else 0 (rY preserved)"},
}

# ─── Primitive instruction set (always available) ─────────────────────────────

PRIMITIVES = ["LDR", "STM", "INC", "DEC", "ISZ", "STP", "JMP"]

# ─── Exercise definitions ─────────────────────────────────────────────────────

EXERCISES = [
    {
        "id": 1,
        "name": "ADD",
        "title": "Addition",
        "goal": "Compute r0 = r0 + r1",
        "description": (
            "Given r0 and r1 already loaded with values, write a program that:\n"
            "  • Adds r0 and r1 together\n"
            "  • Stores the result in r0\n"
            "  • Ends with STP\n"
            "\n"
            "You may use r2, r3 as scratch registers and memory (@0–@63)."
        ),
        "hints": [
            "You can only INC and DEC by 1.\n"
            "Think: how would you move a value from r1 into r0,\n"
            "one unit at a time?",
            "Loop: INC r0, DEC r1, repeat until r1 == 0.\n"
            "Use ISZ r1 to detect when to stop.",
        ],
        "available": PRIMITIVES,
        "unlocks": "ADD",
        "file": "01_add.x",
        "tests": [
            ({"r0": 5,  "r1": 3},  {"r0": 8}),
            ({"r0": 0,  "r1": 0},  {"r0": 0}),
            ({"r0": 1,  "r1": 0},  {"r0": 1}),
            ({"r0": 0,  "r1": 7},  {"r0": 7}),
            ({"r0": 10, "r1": 10}, {"r0": 20}),
        ],
    },
    {
        "id": 2,
        "name": "MUL",
        "title": "Multiplication",
        "goal": "Compute r0 = r0 × r1",
        "description": (
            "Given r0 and r1 already loaded with values, write a program that:\n"
            "  • Multiplies r0 by r1\n"
            "  • Stores the result in r0\n"
            "  • Ends with STP\n"
            "\n"
            "You may use r2, r3 as scratch registers and memory (@0–@63).\n"
            "\n"
            "💡 You now have ADD rX rY available from Exercise 1!"
        ),
        "hints": [
            "Multiplication is repeated addition.\n"
            "3 × 4 = 3 + 3 + 3 + 3  (add 3 to a result, 4 times).",
            "Save the multiplicand in memory so you can reload it\n"
            "each iteration. Use ADD to accumulate the result.",
        ],
        "available": PRIMITIVES + ["ADD"],
        "unlocks": "MUL",
        "file": "02_mul.x",
        "tests": [
            ({"r0": 3, "r1": 4}, {"r0": 12}),
            ({"r0": 0, "r1": 5}, {"r0": 0}),
            ({"r0": 5, "r1": 0}, {"r0": 0}),
            ({"r0": 1, "r1": 7}, {"r0": 7}),
            ({"r0": 7, "r1": 1}, {"r0": 7}),
            ({"r0": 6, "r1": 6}, {"r0": 36}),
        ],
    },
    {
        "id": 3,
        "name": "POW",
        "title": "Exponentiation",
        "goal": "Compute r0 = r0 ^ r1  (r0 raised to the power r1)",
        "description": (
            "Given r0 and r1 already loaded with values, write a program that:\n"
            "  • Raises r0 to the power of r1\n"
            "  • Stores the result in r0\n"
            "  • Ends with STP\n"
            "\n"
            "You may use r2, r3 as scratch registers and memory (@0–@63).\n"
            "\n"
            "💡 You now have ADD and MUL available!"
        ),
        "hints": [
            "Exponentiation is repeated multiplication.\n"
            "2^3 = 2 × 2 × 2  (multiply 1 by 2, three times).",
            "Remember: x^0 = 1 for any x.\n"
            "Start the result at 1 (not 0!), then MUL by the base\n"
            "in a loop counted by r1.",
        ],
        "available": PRIMITIVES + ["ADD", "MUL"],
        "unlocks": "POW",
        "file": "03_pow.x",
        "tests": [
            ({"r0": 2, "r1": 3},  {"r0": 8}),
            ({"r0": 3, "r1": 2},  {"r0": 9}),
            ({"r0": 5, "r1": 0},  {"r0": 1}),
            ({"r0": 2, "r1": 0},  {"r0": 1}),
            ({"r0": 1, "r1": 10}, {"r0": 1}),
            ({"r0": 3, "r1": 3},  {"r0": 27}),
        ],
    },
    {
        "id": 4,
        "name": "SUB",
        "title": "Subtraction",
        "goal": "Compute r0 = r0 - r1",
        "description": (
            "Given r0 and r1 already loaded with values, write a program that:\n"
            "  • Subtracts r1 from r0\n"
            "  • Stores the result in r0\n"
            "  • Ends with STP\n"
            "\n"
            "You may assume r0 ≥ r1 (result is never negative).\n"
            "You may use r2, r3 as scratch registers and memory (@0–@63)."
        ),
        "hints": [
            "Subtraction is the mirror of addition.\n"
            "Instead of INC r0 each step, what should you do?",
            "Loop: DEC r0, DEC r1, repeat until r1 == 0.\n"
            "The same pattern as ADD but with DEC r0 instead of INC r0.",
        ],
        "available": PRIMITIVES,
        "unlocks": "SUB",
        "file": "04_sub.x",
        "tests": [
            ({"r0": 8,  "r1": 3},  {"r0": 5}),
            ({"r0": 5,  "r1": 5},  {"r0": 0}),
            ({"r0": 0,  "r1": 0},  {"r0": 0}),
            ({"r0": 10, "r1": 1},  {"r0": 9}),
            ({"r0": 20, "r1": 15}, {"r0": 5}),
        ],
    },
    {
        "id": 5,
        "name": "CMP",
        "title": "Comparison",
        "goal": "r0 = 1 if r0 > r1, else r0 = 0",
        "description": (
            "Given r0 and r1 already loaded with values, write a program that:\n"
            "  • Sets r0 to 1 if r0 is strictly greater than r1\n"
            "  • Sets r0 to 0 otherwise (less than or equal)\n"
            "  • Ends with STP\n"
            "\n"
            "You may assume both values are ≥ 0.\n"
            "You may use r2, r3 as scratch registers and memory (@0–@63)."
        ),
        "hints": [
            "You have no comparison instruction yet — build one!\n"
            "If you DEC both registers simultaneously, the first\n"
            "one to reach 0 was the smaller (or equal) value.",
            "Loop: check ISZ r0, check ISZ r1, DEC both, repeat.\n"
            "  • r0 hits 0 first (or same time) → r0 ≤ r1 → result = 0\n"
            "  • r1 hits 0 first                → r0 > r1 → result = 1\n"
            "Use LDR r0 #0 or LDR r0 #1 to set the result before STP.",
        ],
        "available": PRIMITIVES,
        "unlocks": "CMP",
        "file": "05_cmp.x",
        "tests": [
            ({"r0": 5,  "r1": 3},  {"r0": 1}),
            ({"r0": 3,  "r1": 5},  {"r0": 0}),
            ({"r0": 4,  "r1": 4},  {"r0": 0}),
            ({"r0": 0,  "r1": 0},  {"r0": 0}),
            ({"r0": 1,  "r1": 0},  {"r0": 1}),
            ({"r0": 0,  "r1": 1},  {"r0": 0}),
            ({"r0": 10, "r1": 9},  {"r0": 1}),
        ],
    },
    {
        "id": 6,
        "name": "SWAP",
        "title": "Swap memory",
        "goal": "Swap the values at @0 and @1",
        "description": (
            "Two values are stored in memory at addresses @0 and @1.\n"
            "Write a program that swaps them.\n"
            "\n"
            "  • Input:  values at @0 and @1\n"
            "  • Output: @0 has the old value of @1, @1 has the old value of @0\n"
            "  • Ends with STP\n"
            "\n"
            "Registers are free to use as scratch space."
        ),
        "hints": [
            "You can't swap two memory cells directly.\n"
            "Use registers as temporary storage:\n"
            "load both values into registers, then store them\n"
            "back into the opposite addresses.",
        ],
        "available": PRIMITIVES,
        "unlocks": None,
        "file": "06_swap.x",
        "tests": [
            ({"@0": 3, "@1": 7}, {"@0": 7, "@1": 3}),
            ({"@0": 0, "@1": 5}, {"@0": 5, "@1": 0}),
            ({"@0": 4, "@1": 4}, {"@0": 4, "@1": 4}),
            ({"@0": 1, "@1": 9}, {"@0": 9, "@1": 1}),
        ],
    },
    {
        "id": 7,
        "name": "SORT",
        "title": "Sort 3 values",
        "goal": "Sort @0, @1, @2 in ascending order",
        "description": (
            "Three values are stored in memory at @0, @1, and @2.\n"
            "Write a program that sorts them in ascending order\n"
            "(smallest at @0, largest at @2).\n"
            "\n"
            "  • Input:  3 values already in memory at @0, @1, @2\n"
            "  • Output: same 3 values sorted ascending in @0, @1, @2\n"
            "  • Ends with STP\n"
            "\n"
            "Registers are free to use as scratch space.\n"
            "\n"
            "💡 You now have CMP rX rY from Exercise 5!"
        ),
        "hints": [
            # ── Hint 1: high-level strategy ──
            "Think about Bubble Sort: compare adjacent pairs\n"
            "and swap them if the left one is bigger.\n"
            "For 3 elements you need 3 compare-and-swaps:\n"
            "  (@0,@1)  then  (@1,@2)  then  (@0,@1) again.",

            # ── Hint 2: compare-and-conditional-swap ──
            "For each pair @A, @B:\n"
            "  1. Load both into r0, r1\n"
            "  2. CMP r0 r1  →  r0 = 1 if @A > @B\n"
            "  3. ISZ r0 to skip the swap when r0 = 0\n"
            "  4. If swapping: reload from memory, STM in reversed positions",

            # ── Hint 3: code pattern ──
            "Pattern for one compare-and-swap (@A vs @B):\n"
            "\n"
            "  LDR r0 @A\n"
            "  LDR r1 @B\n"
            "  CMP r0 r1       ; r0 = 1 if @A > @B\n"
            "  ISZ r0           ; skip next if r0 = 0\n"
            "  JMP l_do_swap    ; @A > @B → swap\n"
            "  JMP l_no_swap    ; @A ≤ @B → skip\n"
            "  LDR r0 @A       ; ── do_swap ──\n"
            "  LDR r1 @B\n"
            "  STM @A r1\n"
            "  STM @B r0\n"
            "                   ; ── no_swap ──\n"
            "\n"
            "Each block is 10 lines. Repeat for pairs\n"
            "(@0,@1), (@1,@2), (@0,@1). End with STP.",
        ],
        "available": PRIMITIVES + ["ADD", "SUB", "MUL", "POW", "CMP"],
        "unlocks": None,
        "file": "07_sort.x",
        "tests": [
            ({"@0": 3, "@1": 1, "@2": 2}, {"@0": 1, "@1": 2, "@2": 3}),
            ({"@0": 1, "@1": 2, "@2": 3}, {"@0": 1, "@1": 2, "@2": 3}),
            ({"@0": 3, "@1": 2, "@2": 1}, {"@0": 1, "@1": 2, "@2": 3}),
            ({"@0": 5, "@1": 5, "@2": 5}, {"@0": 5, "@1": 5, "@2": 5}),
            ({"@0": 2, "@1": 1, "@2": 2}, {"@0": 1, "@1": 2, "@2": 2}),
            ({"@0": 9, "@1": 1, "@2": 5}, {"@0": 1, "@1": 5, "@2": 9}),
        ],
    },
]

# ─── Progress persistence ─────────────────────────────────────────────────────

def load_progress() -> dict:
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": []}


def save_progress(progress: dict) -> None:
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def is_completed(exercise_id: int) -> bool:
    return exercise_id in load_progress()["completed"]


def mark_completed(exercise_id: int) -> None:
    progress = load_progress()
    if exercise_id not in progress["completed"]:
        progress["completed"].append(exercise_id)
    save_progress(progress)


def is_available(exercise: dict) -> bool:
    """An exercise is available when all previous exercises are completed."""
    for ex in EXERCISES:
        if ex["id"] < exercise["id"] and not is_completed(ex["id"]):
            return False
    return True

# ─── Instruction management ───────────────────────────────────────────────────

def setup_unlocked_instructions(exercise: dict) -> None:
    """Register every instruction unlocked by *earlier* completed exercises."""
    for ex in EXERCISES:
        if ex["id"] < exercise["id"] and is_completed(ex["id"]):
            name = ex["unlocks"]
            if name and name not in Inst:
                Inst[name] = UNLOCKABLE[name]


def validate_allowed_instructions(lines: list[str], allowed: list[str]) -> list[str]:
    """Return a list of error messages for any forbidden opcode used."""
    errors = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped or stripped.startswith(";"):
            continue
        opcode = stripped.split()[0]
        if opcode not in allowed:
            errors.append(f"  Line {i+1}: '{opcode}' is not allowed")
    return errors

# ─── Register / memory helpers ────────────────────────────────────────────────

REG_MAP = {f'{REGISTER_PREFIX}{i}': Register(i) for i in range(REGISTER_COUNT)}


def _set_inputs(machine: Machine, inputs: dict) -> None:
    """Set registers and/or memory from a test-case input dict."""
    for key, value in inputs.items():
        if key.startswith("@"):
            machine.memory[int(key[1:])] = value
        else:
            machine.registers[REG_MAP[key]] = value


def _get_actual(machine: Machine, key: str) -> int:
    """Read a register or memory cell from the machine."""
    if key.startswith("@"):
        return machine.memory[int(key[1:])]
    return machine.registers[REG_MAP[key]]

# ─── Test runner ──────────────────────────────────────────────────────────────


def run_test(code_file: str, inputs: dict) -> tuple:
    """Run *code_file* with pre-loaded registers/memory.

    Returns (machine, error_string).  On success error_string is None.
    """
    machine = Machine(instructions=[], code=[])
    machine.load_instructions_from_file(code_file)

    _set_inputs(machine, inputs)

    # Execute
    steps = 0
    while machine.pc < len(machine.code) and not machine.halted and steps < MAX_STEPS:
        machine.execute()
        steps += 1

    if steps >= MAX_STEPS:
        return None, "TIMEOUT — possible infinite loop"
    if not machine.halted:
        return None, "Program ended without STP"
    return machine, None

# ─── Template generation ──────────────────────────────────────────────────────

def create_template(exercise: dict) -> str:
    """Create a starter file for an exercise (won't overwrite existing work)."""
    os.makedirs(EXERCISES_DIR, exist_ok=True)
    filepath = os.path.join(EXERCISES_DIR, exercise["file"])
    if os.path.exists(filepath):
        return filepath

    available = ", ".join(exercise["available"])

    # Check whether this exercise uses memory I/O
    first_inputs = exercise["tests"][0][0]
    uses_memory = any(k.startswith("@") for k in first_inputs)

    content = (
        f"; ─── Exercise {exercise['id']}: {exercise['title']} ───\n"
        f"; Goal: {exercise['goal']}\n"
        f";\n"
        f"; Available instructions: {available}\n"
        f";\n"
    )
    if uses_memory:
        content += "; Input values are pre-loaded in memory.\n"
        content += "; Sort them in place and end with STP.\n"
    else:
        content += "; Registers r0 and r1 are pre-loaded with the input values.\n"
        content += "; Store your result in r0 and end with STP.\n"
    content += (
        f";\n"
        f"; Write your code below:\n"
        f"\n"
        f"STP\n"
    )
    with open(filepath, "w") as f:
        f.write(content)
    return filepath

# ─── Display helpers ──────────────────────────────────────────────────────────

def clear():
    os.system("clear" if os.name != "nt" else "cls")


def print_header():
    print()
    print("╔════════════════════════════════════════════╗")
    print("║        MiniASM  Exercise  System           ║")
    print("╚════════════════════════════════════════════╝")
    print()


def print_exercise_list():
    print("  Exercises:")
    print()
    for ex in EXERCISES:
        if is_completed(ex["id"]):
            icon, status = "✅", "COMPLETED"
        elif is_available(ex):
            icon, status = "🔓", "AVAILABLE"
        else:
            icon, status = "🔒", "LOCKED"
        print(f"  {icon}  {ex['id']}. {ex['title']:<20s}  [{status}]")
        print(f"       {ex['goal']}")
        print()


def _fmt_io(d: dict) -> str:
    """Pretty-print an input or expected-output dict."""
    parts = []
    for k, v in d.items():
        if k.startswith("@"):
            parts.append(f"mem[{k[1:]}]={v}")
        else:
            parts.append(f"{k}={v}")
    return ", ".join(parts)

# ─── Hint state (session-scoped) ─────────────────────────────────────────────

_hint_index: dict[int, int] = {}   # exercise_id → next hint to show

# ─── Exercise detail menu ─────────────────────────────────────────────────────

def show_exercise(exercise: dict) -> None:
    filepath = create_template(exercise)
    ex_id = exercise["id"]

    while True:
        clear()
        print()
        print(f"  ━━━ Exercise {ex_id}: {exercise['title']} ━━━")
        print()
        for line in exercise["description"].split("\n"):
            print(f"  {line}")
        print()
        print(f"  📝 Solution file: exercises/{exercise['file']}")
        print()
        if is_completed(ex_id):
            print(f"  ✅ Already completed — you can still re-test.")
            print()
        hints = exercise["hints"]
        seen = _hint_index.get(ex_id, 0)
        remaining = len(hints) - seen
        hint_label = f"Show hint ({remaining} left)" if remaining else "No more hints"
        print("  [T] Test solution")
        print("  [S] Step through (first test case)")
        print(f"  [H] {hint_label}")
        print("  [B] Back")
        print()
        choice = input("  > ").strip().lower()

        if choice == "b":
            return
        elif choice == "h":
            idx = _hint_index.get(ex_id, 0)
            if idx < len(hints):
                print()
                print(f"  ── Hint {idx + 1}/{len(hints)} ──")
                for line in hints[idx].split("\n"):
                    print(f"  💡 {line}")
                _hint_index[ex_id] = idx + 1
            else:
                print("\n  No more hints — you've seen them all!")
            input("\n  Press Enter to continue...")
        elif choice == "t":
            do_test(exercise, filepath)
        elif choice == "s":
            do_step(exercise, filepath)


def do_test(exercise: dict, filepath: str) -> None:
    """Run all test cases and report results."""
    print()

    if not os.path.exists(filepath):
        print(f"  ❌ File not found: exercises/{exercise['file']}")
        print(f"     Create this file and write your solution.")
        input("\n  Press Enter to continue...")
        return

    # Read source lines for validation
    with open(filepath) as f:
        lines = f.readlines()

    # Make unlocked instructions available to the parser
    setup_unlocked_instructions(exercise)

    # Validate that only allowed instructions are used
    errors = validate_allowed_instructions(lines, exercise["available"])
    if errors:
        print("  ❌ Forbidden instructions detected:\n")
        for err in errors:
            print(f"   {err}")
        print(f"\n  Allowed: {', '.join(exercise['available'])}")
        input("\n  Press Enter to continue...")
        return

    # Run every test case
    print("  Running tests…\n")
    all_passed = True

    for i, (inputs, expected) in enumerate(exercise["tests"], 1):
        in_str  = _fmt_io(inputs)
        exp_str = _fmt_io(expected)

        machine, error = run_test(filepath, inputs)

        if error:
            print(f"  Test {i}: {in_str}  →  expected {exp_str}")
            print(f"    ❌ ERROR: {error}")
            all_passed = False
            continue

        passed = all(
            _get_actual(machine, k) == v
            for k, v in expected.items()
        )
        act_str = ", ".join(
            f"{'mem['+k[1:]+']' if k.startswith('@') else k}={_get_actual(machine, k)}"
            for k in expected
        )

        print(f"  Test {i}: {in_str}  →  expected {exp_str}")
        if passed:
            print(f"    ✅ PASS ({act_str})")
        else:
            print(f"    ❌ FAIL (got {act_str})")
            all_passed = False

    print()

    if all_passed:
        unlocked = exercise.get("unlocks")
        if not is_completed(exercise["id"]):
            mark_completed(exercise["id"])
            print("  🎉 All tests passed!  Exercise completed!")
            if unlocked:
                info = UNLOCKABLE[unlocked]
                print(f"  🔓 New instruction unlocked:  {info['usage']}  —  {info['desc']}")
        else:
            print("  🎉 All tests still pass!")
    else:
        print("  Some tests failed — keep trying!")

    input("\n  Press Enter to continue...")


def do_step(exercise: dict, filepath: str) -> None:
    """Step through the first test case interactively."""
    if not os.path.exists(filepath):
        print(f"\n  ❌ File not found: exercises/{exercise['file']}")
        input("\n  Press Enter to continue...")
        return

    setup_unlocked_instructions(exercise)

    inputs, expected = exercise["tests"][0]
    in_str  = _fmt_io(inputs)
    exp_str = _fmt_io(expected)

    print(f"\n  Stepping through:  {in_str}  →  expected {exp_str}\n")

    machine = Machine(instructions=[], code=[])
    machine.load_instructions_from_file(filepath)
    _set_inputs(machine, inputs)

    machine.run_step_by_step()

    input("\n  Press Enter to continue...")

# ─── Main menu ────────────────────────────────────────────────────────────────

def main():
    while True:
        clear()
        print_header()
        print_exercise_list()
        print("  Enter exercise number (or 'q' to quit): ", end="")
        choice = input().strip().lower()

        if choice == "q":
            print("\n  Happy coding! 🚀\n")
            break

        try:
            ex_id = int(choice)
        except ValueError:
            continue

        exercise = next((e for e in EXERCISES if e["id"] == ex_id), None)
        if not exercise:
            continue

        if not is_available(exercise) and not is_completed(exercise["id"]):
            print(f"\n  🔒 Complete previous exercises first.")
            input("  Press Enter to continue...")
            continue

        show_exercise(exercise)


if __name__ == "__main__":
    main()
