import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Union, get_args

from config import REGISTER_COUNT, REGISTER_PREFIX, MEMORY_SIZE, RANDOM_MAX, MAX_STEPS

# ─── Operand types ─────────────────────────────────────────────────────────────

class Immediate(int):
    """An immediate/literal value."""
    pass

class MemoryAddress(int):
    """A memory address."""
    pass

class InstructionNumber(int):
    """A line number."""
    pass


@dataclass
class Instruction:
    pass

# ─── Register enum (generated from config) ────────────────────────────────────

Register = Enum('Register', {f'R{i}': i for i in range(REGISTER_COUNT)})


@dataclass
class Machine:
    instructions: list[str]
    code: list[Instruction]
    registers: dict[Register, int] = field(
        default_factory=lambda: {r: random.randint(0, RANDOM_MAX - 1) for r in Register}
    )
    memory: list[int] = field(
        default_factory=lambda: [random.randint(0, RANDOM_MAX - 1) for _ in range(MEMORY_SIZE)]
    )
    pc: int = 0
    halted: bool = False

    def load_instructions_from_file(self, filename: str):
        with open(filename, "r") as f:
            self.instructions = f.readlines()
        self.instructions = [*filter(lambda l: l.strip() and not l.strip().startswith(";"), self.instructions)]
        self.code = [*enumerate(map(self.parse_instruction, self.instructions))]


    def parse_instruction(self, line) -> Instruction:
        Token_types = {
            REGISTER_PREFIX: Register,
            "#": Immediate,
            "@": MemoryAddress,
            "l": InstructionNumber
        }
        tokens = [*filter(None, map(lambda x: x.strip(), line.split(" ")))]
        try:
            opcode_info = Inst[tokens[0]]
        except ValueError:
            raise ValueError(f"Unknown opcode: {tokens[0]}")
        opcode_args = Inst[tokens[0]]["args"]
        given_args = tokens[1:]
        try:
            assert(len(opcode_args) == len(given_args))
        except AssertionError:
            raise ValueError(
                f"Expected {len(opcode_args)} arguments for {tokens[0]}, got {len(given_args)}"
            )
        try:
            given_args_types = [Token_types[operand[0]] for operand in given_args]
            for i, (expected, actual) in enumerate(zip(opcode_args, given_args_types)):
                if hasattr(expected, '__origin__') and expected.__origin__ is Union:
                    if actual not in get_args(expected):
                        raise ValueError(
                            f"Argument {i+1} for {tokens[0]}: expected one of {get_args(expected)}, got {actual}"
                        )
                else:
                    if actual is not expected:
                        raise ValueError(
                            f"Argument {i+1} for {tokens[0]}: expected {expected}, got {actual}"
                        )
        except KeyError as e:
            raise ValueError(f"Unknown token prefix: {e}")
        given_args_values = [t(int(operand[1:])) for t, operand in zip(given_args_types, given_args)]
        return  opcode_info["inst"](*given_args_values)
        
    def print_code(self):
        for idx, instr in self.code:
            marker = " <== PC" if idx == self.pc else ""
            print(f"{idx}: {instr}{marker}")

    def print_memory(self):
        for i in range(0, MEMORY_SIZE, 8):
            print([f"{x:02x}" for x in self.memory[i:i+8]], sep=" ")

    def print_registers(self):
        print("Registers:")
        for reg, val in self.registers.items():
            print(f"{REGISTER_PREFIX}{reg.value}: {val}")

    def execute(self):
        index = self.pc
        self.pc += 1
        self.code[index][1].execute(self)

    def run(self, max_steps=MAX_STEPS):
        steps = 0
        while self.pc < len(self.code) and not self.halted and steps < max_steps:
            self.execute()
            steps += 1
        return self.halted

    def run_step_by_step(self):
        while self.pc < len(self.code) and not self.halted:
            self.print_code()
            self.print_registers()
            self.print_memory()
            input("Press Enter to execute next instruction...")
            idx, instr = self.code[self.pc]
            self.execute()
            print("-" * 40)
        self.print_code()
        self.print_registers()
        print(f"\nProgram halted. {REGISTER_PREFIX}0 = {self.registers[Register(0)]}")


@dataclass
class SET(Instruction):
    """SET dest, src — dest and src can be Reg, Mem, or (src only) Immediate."""
    dest: Union[Register, MemoryAddress]
    src: Union[Register, MemoryAddress, Immediate]

    def _get_value(self, machine: Machine, operand: Union[Register, MemoryAddress, Immediate]) -> int:
        if isinstance(operand, Register):
            return machine.registers[operand]
        if isinstance(operand, MemoryAddress):
            return machine.memory[operand]
        return int(operand)  # Immediate

    def execute(self, machine: Machine) -> None:
        value = self._get_value(machine, self.src)
        if isinstance(self.dest, Register):
            machine.registers[self.dest] = value
        else:
            machine.memory[self.dest] = value

@dataclass
class INC(Instruction):
    x: Register

    def execute(self, machine: Machine) -> None:
        machine.registers[self.x] += 1

@dataclass
class DEC(Instruction):
    x: Register

    def execute(self, machine: Machine) -> None:
        machine.registers[self.x] -= 1

@dataclass
class ISZ(Instruction):
    x: Register

    def execute(self, machine: Machine) -> None:
        if machine.registers[self.x] == 0:
            machine.pc += 1

@dataclass
class ISN(Instruction):
    """Skip next instruction if register is negative."""
    x: Register

    def execute(self, machine: Machine) -> None:
        if machine.registers[self.x] < 0:
            machine.pc += 1

class STP(Instruction):
    def execute(self, machine: Machine) -> None:
        machine.halted = True

@dataclass
class JMP(Instruction):
    x: InstructionNumber

    def execute(self, machine: Machine) -> None:
        machine.pc = self.x - 1  # source line numbers are 1-based (l1=first, l2=second, …)


Inst = {
    "SET": {
        "args": [Union[Register, MemoryAddress], Union[Register, MemoryAddress, Immediate]],
        "inst": SET
    },
    "INC": {
        "args": [Register],
        "inst": INC
    },
    "DEC": {
        "args": [Register],
        "inst": DEC
    },
    "ISZ": {
        "args": [Register],
        "inst": ISZ
    },
    "ISN": {
        "args": [Register],
        "inst": ISN
    },
    "STP": {
        "args": [],
        "inst": STP
    },
    "JMP": {
        "args": [InstructionNumber],
        "inst": JMP
    },
}

if __name__ == "__main__":
    m = Machine(instructions=[], code=[])
    m.load_instructions_from_file("code.x")
    m.run_step_by_step()
