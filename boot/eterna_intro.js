// format: [text, colour, linetype, delay]
// delay is the number of milliseconds before the next line is printed
// linetype:
// 0 means "replace the last line with this line"
// 1 means "put this line on a new line"
// 2 means "clear the screen then print this"
// 3 means "type this line out with 20ms delay per character"
// 4 means "newline, then type this line out"
messages = [
    ["Performing checks...", "#ffffff", 1, 100],
    ["[+] RAM          | PASSED", "#00ff00", 1, 25],
    ["[+] CPU          | PASSED", "#00ff00", 1, 150],
    ["[+] HDD          | PASSED", "#00ff00", 1, 5],
    ["[.] GPU          |       ", "#ffffff", 1, 200],
    ["[+] GPU          | PASSED", "#00ff00", 0, 100],
    ["[+] BIOS         | PASSED", "#00ff00", 1, 5],
    ["Remaining checks skipped.", "#ffffff", 1, 250],
    ["", "#ffffff", 2, 100],
    ["[.] Resuming stored session.", "#ffffff", 1, 30],
    ["[.] Resuming stored session..", "#ffffff", 0, 30],
    ["[.] Resuming stored session...", "#ffffff", 0, 30],
    ["[.] Resuming stored session....", "#ffffff", 0, 30],
    ["[.] Resuming stored session.....", "#ffffff", 0, 30],
    ["[.] Resuming stored session......", "#ffffff", 0, 30],
    ["[.] Resuming stored session.......", "#ffffff", 0, 30],
    ["[.] Resuming stored session........", "#ffffff", 0, 30],
    ["[.] Resuming stored session.........", "#ffffff", 0, 30],
    ["[.] Resuming stored session..........", "#ffffff", 0, 30],
    ["[.] Resuming stored session...........", "#ffffff", 0, 30],
    ["[.] Resuming stored session............", "#ffffff", 0, 30],
    ["[.] Resuming stored session.............", "#ffffff", 0, 30],
    ["[+] Resuming stored session..............success.", "#00ff00", 0, 200],
    ["", "#ffffff", 2, 100],
    ["                    @@                    ", "#00ffff", 1, 5],
    ["                @@@@  @@@@                ", "#00ffff", 1, 5],
    ["            @@@@          @@@@            ", "#00ffff", 1, 5],
    ["          @@                  @@          ", "#00ffff", 1, 5],
    ["      @@@@                      @@@@      ", "#00ffff", 1, 5],
    ["  @@@@                              @@@@  ", "#00ffff", 1, 5],
    ["@@                  @@                  @@", "#00ffff", 1, 5],
    ["@@@@@@          @@@@@@@@@@          @@@@@@", "#00ffff", 1, 5],
    ["@@    @@@@  @@@@    @@    @@@@  @@@@    @@", "#00ffff", 1, 5],
    ["@@        @@        @@        @@        @@", "#00ffff", 1, 5],
    ["@@        @@        @@        @@        @@", "#00ffff", 1, 5],
    ["@@        @@        @@        @@        @@", "#00ffff", 1, 5],
    ["@@        @@        @@        @@        @@", "#00ffff", 1, 5],
    ["  @@@@    @@    @@@@  @@@@    @@    @@@@  ", "#00ffff", 1, 5],
    ["      @@@@@@@@@@          @@@@@@@@@@      ", "#00ffff", 1, 5],
    ["          @@                  @@          ", "#00ffff", 1, 5],
    ["", "#ffffff", 1, 5],
    ["ETERNA Subsystem #5 [PBS-948] Version 2032.4.4", "#ffffff", 1, 5],
    ["(c) SNTL Corporation. All rights reserved.", "#ffffff", 1, 5],
    ["Welcome to Eterna. All systems are working correctly.", "#ffffff", 1, 250],
    ["", "#ffffff", 1, 5],
    ["Welcome, <paul.w>.", "#ffffff", 1, 200],
    ["", "#ffffff", 1, 5],
    ["Now booting into graphical mode.", "#ffffff", 1, 400],
    ["", "#ffffff", 1, 5],
    ["Check this out.", "#ffff00", 4, 150],
    [" This is where the magic happens.", "#ffff00", 3, 500],
    ["", "#ffffff", 1, 5],
    ["Starting...", "#ffffff", 1, 100],
]

function printFinish() {
    window.location.href = "eterna.html";
}

printMessage();