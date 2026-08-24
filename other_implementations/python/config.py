"""MiniASM — Central Configuration.

╔══════════════════════════════════════════════════════════════════╗
║  Change the values below to customise the virtual machine.      ║
║                                                                  ║
║  • REGISTER_COUNT   — number of general-purpose registers        ║
║  • REGISTER_PREFIX  — single-char prefix in source code          ║
║  • MEMORY_SIZE      — number of addressable memory cells         ║
║  • MEMORY_PREFIX    — single-char prefix in source code          ║
║  • RANDOM_MAX       — random init range [0, RANDOM_MAX)          ║
║  • MAX_STEPS        — execution timeout (infinite-loop guard)    ║
║  • OPERAND_PREFIXES — token-prefix → type-name mapping           ║
║                       (add a new prefix here to support a        ║
║                        new operand type; then add a matching     ║
║                        class and handle it in interpreter.py)    ║
╚══════════════════════════════════════════════════════════════════╝
"""

# ─── Registers ────────────────────────────────────────────────────
REGISTER_COUNT  = 4       # r0 … r(REGISTER_COUNT - 1)
REGISTER_PREFIX = 'r'     # single-char prefix used in source code

# ─── Memory ──────────────────────────────────────────────────────
MEMORY_SIZE   = 64        # total addressable cells (@0 … @MEMORY_SIZE-1)
MEMORY_PREFIX = '@'       # single-char prefix used in source code

# ─── Value range ─────────────────────────────────────────────────
RANDOM_MAX = 256          # registers & memory randomised in [0, RANDOM_MAX)

# ─── Execution ───────────────────────────────────────────────────
MAX_STEPS = 100_000       # steps before the VM aborts (infinite-loop guard)

# ─── Operand type prefixes ───────────────────────────────────────
# Maps a single-character token prefix to a human-readable type name.
# The interpreter maps these to actual Python classes.
# To add a new type:
#   1. Add an entry here       (e.g.  '%': 'StackPointer')
#   2. Create a class for it in interpreter.py
#   3. Register it in Token_types inside parse_instruction
OPERAND_PREFIXES = {
    'r': 'Register',
    '#': 'Immediate',
    '@': 'MemoryAddress',
    'l': 'InstructionNumber',
}
