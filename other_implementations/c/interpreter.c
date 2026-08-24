#include <stdint.h>

typedef uint8_t immediate_t;
typedef uint16_t memory_address_t;
typedef uint16_t line_number_t;

typedef enum {
    R0 = 0,
    R1 = 1,
    R2 = 2,
    R3 = 3
} register_t;

typedef enum {
    OP_LDR,
    OP_STM,
    OP_INC,
    OP_DEC,
    OP_ISZ,
    OP_STP,
    OP_JMP
} opcode_t;

/* Argument type flags (can be OR'd together to allow multiple types) */
#define T_REG  (1 << 0)
#define T_IMM  (1 << 1)
#define T_MEM  (1 << 2)
#define T_LINE (1 << 3)

#define MAX_ARGS 2

typedef struct {
    const char *mnemonic;
    uint8_t    nb_args;
    uint8_t    arg_types[MAX_ARGS];
    opcode_t   opcode;
    const char *description;
} op_t;

op_t op_tab[] = {
    {"LDR", 2, {T_REG, T_REG | T_MEM | T_IMM}, OP_LDR, "load register"},
    {"STM", 2, {T_MEM, T_REG | T_IMM},         OP_STM, "store memory"},
    {"INC", 1, {T_REG},                         OP_INC, "increment"},
    {"DEC", 1, {T_REG},                         OP_DEC, "decrement"},
    {"ISZ", 1, {T_REG},                         OP_ISZ, "skip if zero"},
    {"STP", 0, {0},                              OP_STP, "stop"},
    {"JMP", 1, {T_LINE},                         OP_JMP, "jump"},
    {0,     0, {0},                              0,      0}
};

#define MEMORY_SIZE 64
#define NUM_REGISTERS 4

typedef struct {
    int8_t registers[NUM_REGISTERS];
    uint8_t memory[MEMORY_SIZE];
    instruction_t *code;
    size_t code_len;
    size_t pc;
} machine_t;