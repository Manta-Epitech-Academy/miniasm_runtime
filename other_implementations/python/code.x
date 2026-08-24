; add r0 + r1 -> r0
; r0 = 5, r1 = 3, expected result: r0 = 8
SET r0 #5
SET r1 #3
ISZ r1
JMP l5
STP
INC r0
DEC r1
JMP l2
