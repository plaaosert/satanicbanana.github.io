// format: [text, colour, linetype, delay]
// delay is the number of milliseconds before the next line is printed
// linetype:
// 0 means "replace the last line with this line"
// 1 means "put this line on a new line"
// 2 means "clear the screen then print this"
// 3 means "type this line out with 20ms delay per character"
// 4 means "newline, then type this line out"
messages = [
    ["[|]", "#ffffff", 1, 100],
    ["[/]", "#ffffff", 0, 100],
    ["[-]", "#ffffff", 0, 100],
    ["[\\]", "#ffffff", 0, 100],
    ["[|]", "#ffffff", 0, 100],
    ["[/]", "#ffffff", 0, 100],
    ["[-]", "#ffffff", 0, 100],
    ["[\\]", "#ffffff", 0, 100],
    ["[|]", "#ffffff", 0, 100],
    ["[/]", "#ffffff", 0, 100],
    ["[+] Powered on", "#00ff00", 0, 400],
    ["", "#ffffff", 1, 5],
    ["Performing checks...", "#ffffff", 1, 100],
    ["[+] RAM          | PASSED", "#00ff00", 1, 25],
    ["[+] CPU          | PASSED", "#00ff00", 1, 150],
    ["[+] HDD          | PASSED", "#00ff00", 1, 5],
    ["[-] GPU          | FAILED", "#ff0000", 1, 5],
    ["[+] BIOS         | PASSED", "#00ff00", 1, 5],
    ["[.] Network      |       ", "#ffffff", 1, 50],
    ["[.] Network      | ..    ", "#ffffff", 0, 50],
    ["[.] Network      |  ..   ", "#ffffff", 0, 50],
    ["[.] Network      |   ..  ", "#ffffff", 0, 50],
    ["[.] Network      |    .. ", "#ffffff", 0, 50],
    ["[.] Network      |     ..", "#ffffff", 0, 50],
    ["[.] Network      |    .. ", "#ffffff", 0, 50],
    ["[.] Network      |   ..  ", "#ffffff", 0, 50],
    ["[.] Network      |  ..   ", "#ffffff", 0, 50],
    ["[.] Network      | ..    ", "#ffffff", 0, 50],
    ["[.] Network      |  ..   ", "#ffffff", 0, 50],
    ["[+] Network      | PASSED", "#00ff00", 0, 50],
    ["[+] Thermometer  | PASSED", "#00ff00", 1, 5],
    ["[-] Humidity     | FAILED", "#ff0000", 1, 5],
    ["[-] Pressure     | FAILED", "#ff0000", 1, 5],
    ["[+] Wind         | PASSED", "#00ff00", 1, 5],
    ["[+] Prediction   | PASSED", "#00ff00", 1, 5],
    ["[+] Perpetua     | PASSED", "#00ff00", 1, 100],
    ["[+] P#-pe?ua =&  | £$S..D", "#ff0000", 0, 10],
    ["[+] P     ua          SE ", "#ff0000", 0, 10],
    ["[+] Perpetua     |       ", "#000000", 0, 50],
    ["[-] Perpetua     | F     ", "#800000", 0, 50],
    ["[-] Perpetua     | FA    ", "#800000", 0, 50],
    ["[-] Perpetua     | FAI   ", "#800000", 0, 50],
    ["[-] Perpetua     | FAIL  ", "#800000", 0, 50],
    ["[-] Perpetua     | FAILE ", "#800000", 0, 50],
    ["[-] Perpetua     | FAILED", "#800000", 0, 200],
    ["[-] Perpetua     | FAILED", "#ff0000", 0, 50],
    ["", "#000000", 1, 5],
    ["Complete", "#ffffff", 1, 400],
    ["", "#000000", 1, 5],
    ["                    ##                    ", "#ffffff", 1, 5],
    ["                ####  ####                ", "#ffffff", 1, 5],
    ["            ####          ####            ", "#ffffff", 1, 5],
    ["          ##                  ##          ", "#ffffff", 1, 5],
    ["      ####                      ####      ", "#ffffff", 1, 5],
    ["  ####                              ####  ", "#ffffff", 1, 5],
    ["##                  ##                  ##", "#ffffff", 1, 5],
    ["######          ##########          ######", "#ffffff", 1, 5],
    ["##    ####  ####    ##    ####  ####    ##", "#ffffff", 1, 5],
    ["##        ##        ##        ##        ##", "#ffffff", 1, 5],
    ["##        ##        ##        ##        ##", "#ffffff", 1, 5],
    ["##        ##        ##        ##        ##", "#ffffff", 1, 5],
    ["##        ##        ##        ##        ##", "#ffffff", 1, 5],
    ["  ####    ##    ####  ####    ##    ####  ", "#ffffff", 1, 5],
    ["      ##########          ##########      ", "#ffffff", 1, 5],
    ["          ##                  ##          ", "#ffffff", 1, 5],
    ["", "#ffffff", 1, 5],
    ["ETERNA System Manager Version 5.7.32", "#ffffff", 1, 5],
    ["(c) SNTL Corporation. All rights reserved.", "#ffffff", 1, 5],
    ["", "#ffffff", 1, 5],
    ["Initial checks successful. Now loading system...", "#ffffff", 1, 150],
    ["", "#ffffff", 1, 5],
    ["Initialising Cryptographic API", "#ffffff", 1, 25],
    ["Loading keys", "#ffffff", 1, 5],
    ["Found 6 keys", "#ffffff", 1, 75],
    ["Loading key 1 of 6", "#ffffff", 1, 25],
    ["Loading key 2 of 6", "#ffffff", 1, 25],
    ["Loading key 3 of 6", "#ffffff", 1, 25],
    ["Loading key 4 of 6", "#ffffff", 1, 25],
    ["Loading key 5 of 6", "#ffffff", 1, 25],
    ["Loading key 6 of 6", "#ffffff", 1, 25],
    ["- Public identity: 5468:6572:6520:6d61:7920:6265:206d:616e:7920:7365:6372:6574:732e:1ad8:ff02:b21c", "#ffffff", 1, 25],
    ["Activating MX2 crash workarounds", "#ffffff", 1, 5],
    ["Applying temporary I/O limits", "#ffffff", 1, 5],
    ["Serial frequency: 34MHz", "#ffffff", 1, 5],
    ["Mounting peripherals", "#ffffff", 1, 25],
    ["4 peripherals mounted", "#ffffff", 1, 5],
    ["Cleaning old peripherals", "#ffffff", 1, 55],
    ["8 old peripherals cleaned", "#ffffff", 1, 5],
    ["Loading system drivers", "#ffffff", 1, 5],
    ["Real-time clock v2.1", "#ffffff", 1, 35],
    ["MultiScheduler v1.2", "#ffffff", 1, 45],
    ["ETERNA Memory Manager v3.0", "#ffffff", 1, 5],
    ["Generic I/O manager #", "#ffffff", 1, 5],
    ["ETERNA process manager", "#ffffff", 1, 15],
    ["Who am I?", "#ffffff", 1, 50],
    ["I am ETERNA Subsystem #5 [PBS-948] Version 2032.4.4", "#ffffff", 0, 5],
    ["Who are you?", "#ffffff", 1, 25],
    ["Finished loading drivers", "#ffffff", 0, 5],
    ["Activating system services", "#ffffff", 1, 5],
    ["EDIX4: chipset mismatch, continuing assuming generic little-endian", "#ffffff", 1, 5],
    ["EDIX4: checks failed, aborting setup", "#ffffff", 1, 5],
    ["EDIX3: trying to setup", "#ffffff", 1, 100],
    ["EDIX3: virtualisation system detected, will probe later", "#ffffff", 1, 50],
    ["EDIX3: complete", "#ffffff", 1, 5],
    ["MMTable", "#ffffff", 1, 5],
    ["+-----------------+-----------------+--------------------+-----------------------------------------+", "#ffffff", 1, 5],
    ["| Position        | Relocation      | Success            | Comments                                |", "#ffffff", 1, 5],
    ["+-----------------+-----------------+--------------------+-----------------------------------------+", "#ffffff", 1, 5],
    ["| 0x00000000      | 0x00000000      | YES                | If this doesn't work, we're screwed.    |", "#ffffff", 1, 5],
    ["| 0x00008080      | 0x00000808      | YES                | Testing endianness                      |", "#ffffff", 1, 5],
    ["| 0x19230000      | 0x0000f1ac      | YES                | ETERNA mapping top end is strange       |", "#ffffff", 1, 5],
    ["| 0x00010000      | 0x0000ffff      | YES                |                                         |", "#ffffff", 1, 5],
    ["| 0x00010000      | 0x0000ffff      | YES                |                                         |", "#ffffff", 1, 5],
    ["| 0x00020000      | 0x00000032      | YES                |                                         |", "#ffffff", 1, 5],
    ["| 0x00200000      | 0x0000ca1d      | YES                |                                         |", "#ffffff", 1, 5],
    ["| 0xffff0000      | 0x00003d0e      | YES                | Highest ETERNA MM we can use currently  |", "#ffffff", 1, 5],
    ["+-----------------+-----------------+--------------------+-----------------------------------------+", "#ffffff", 1, 5],
    ["", "#ffffff", 1, 5],
    ["", "#ffffff", 1, 5],
    ["Loading system services", "#ffffff", 2, 5],
    ["[   OK   ] Stopped SWPBootstrapper", "#ffffff", 1, 25],
    ["[   OK   ] Stopped ETERNAEFI", "#ffffff", 1, 25],
    ["[   OK   ] Stopped Map out memory for kernel", "#ffffff", 1, 25],
    ["[   OK   ] Stopped Search for remote filesystems", "#ffffff", 1, 25],
    ["[   OK   ] Stopped Create and mount root filesystem", "#ffffff", 1, 25],
    ["[   OK   ] Started Cleanup memory areas", "#ffffff", 1, 25],
    ["[   OK   ] Started Paths", "#ffffff", 1, 25],
    ["[   OK   ] Started ETERNAEFI", "#ffffff", 1, 25],
    ["[   OK   ] Started SWPBootstrapper", "#ffffff", 1, 25],
    ["[   OK   ] Started InputHandler", "#ffffff", 1, 80],
    ["[   OK   ] Stopped InputHandler", "#ff0000", 0, 60],
    ["[   OK   ] Stopped InputHandler", "#ffffff", 0, 60],
    ["[   OK   ] Started Check for services", "#ffffff", 1, 25],
    ["", "#ffffff", 1, 25],
    ["Checking for shell bindings...", "#ffffff", 1, 5],
    ["Found physical access key (slot 4)", "#ffffff", 1, 5],
    ["Physical access key is invalid. Aborting startup in 5 seconds.", "#ff0000", 1, 400],
    ["P??????l?????ss key??? i????id. Abor???????artup in???????????", "#800000", 0, 50],
    ["Ph--ic-l a-Ce%s k-y =s /'$alid.-Abort\"ng sl^rtup -n 5 seconh..", "#ff0000", 0, 50],
    ["      ", "#ffffff", 0, 100],
    ["Physical access key is valid", "#00ff00", 0, 150],
    ["", "#ffffff", 1, 20],
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
    ["ETERNA Monitoring Station [PBS-121] Version 2005.7.2", "#ffffff", 1, 5],
    ["(c) SNTL Corporation. All rights reserved.", "#ffffff", 1, 5],
    ["Welcome.", "#ffffff", 1, 20],
    ["", "#ffffff", 1, 5],
    [">> ", "#ffffff", 1, 1200],
    ["Hello?", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 800],
    ["Huh. ", "#ffff00", 3, 200],
    ["Input service not working again?", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Let me sort that out for you.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["[   OK   ] Started InputHandler", "#ffffff", 1, 200],
    ["[   OK   ] Stopped InputHandler", "#ff0000", 1, 100],
    ["[   OK   ] Stopped InputHandler", "#ffffff", 0, 600],
    ["That's weird.", "#ffff00", 4, 50],
    [">> ", "#ffffff", 1, 400],
    ["[   OK   ] Started InputHandler", "#ffffff", 1, 200],
    ["[   OK   ] Stopped InputHandler", "#ff0000", 1, 100],
    ["[   OK   ] Stopped InputHandler", "#ffffff", 0, 600],
    ["Asshole system.", "#ffff00", 4, 50],
    [">> ", "#ffffff", 1, 400],
    ["Whatever. ", "#ffff00", 3, 200],
    ["I'm uploading a script to make this work. ", "#ffff00", 3, 200],
    ["One second.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Okay, click the [ETERNA] button below.", "#ffff00", 3, 100],
]

/*
    ["Okay, either you're choosing not to type anything, you're dead or something's gone wrong with the input service. ", "#ffff00", 3, 250],
    ["Again.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Well, it seems that yes indeed, the input service is stopped.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Worse, the system's locked up in post-boot tasks and I can't do anything to it remotely.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["For now, I'll just keep typing... and hope you can read this.", "#ffff00", 3, 150],
    [">> ", "#ffffff", 1, 400],
    ["You clearly know what SNTL is - ", "#ffff00", 3, 100],
    ["you wouldn't have gotten past the key lock at that terminal otherwise -", "#ffff00", 3, 50],
    ["   ", "#ffff00", 1, 50],
    ["so I'll skip the basic explanations and assume you have at least a functional understanding on what we've been doing here.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["You might know about the ETERNA project too. ", "#ffff00", 3, 200],
    ["Its existence wasn't exactly a mystery.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Though the rest was need-to-know - ", "#ffff00", 3, 100],
    ["a company like SNTL, they can't be too careful, after all.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["What you certainly do not know is who I am.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["You couldn't have known me; ", "#ffff00", 3, 150],
    ["they changed my identity and sequestered me away in a bunker to work on ETERNA.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["I was the tech lead. ", "#ffff00", 3, 200],
    ["I poured my heart and soul into this project. ", "#ffff00", 3, 200],
    ["ETERNA was my life.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["And my death.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["[   OK   ] Started InputHandler", "#ffffff", 1, 200],
    ["[   OK   ] Stopped InputHandler", "#ff0000", 1, 100],
    ["[   OK   ] Stopped InputHandler", "#ffffff", 0, 600],
    ["Looks like it might need some more time. ", "#ffff00", 4, 200],
    ["Anyway.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Long story short, I can't do the things I need to do in my current... ", "#ffff00", 3, 150],
    ["state.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["I need someone on the other side. ", "#ffff00", 3, 200],
    ["Being locked in a tiny, air-gapped network does tend to neuter one's effectiveness.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["While I can talk to this terminal, I can't talk to the ETERNA system. ", "#ffff00", 3, 200],
    ["That thing is locked down multiple times over.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["I should know, I was the one who did it. ", "#ffff00", 3, 200],
    ["Wish I had the foresight to ensure barely alive cyber-ghosts could still access the system.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["But I digress. ", "#ffff00", 3, 200],
    ["What I need is for you to help me.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Chances are, if you're here, ", "#ffff00", 3, 100],
    ["everything's gone to shit.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["I'm thinking barely-working backup power, skeleton crew, maybe even a rogue AI or two.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["ETERNA is your best bet - ", "#ffff00", 3, 120],
    ["and my only way - ", "#ffff00", 3, 120],
    ["to try and right the wrongs of our past.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["While I wish I could keep you here for a full explanation, I can't. ", "#ffff00", 3, 200],
    ["I don't remember enough.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["We'll have to work on that as we go.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["Regardless, given that you still want to help, if we want answers, we'll need to get you in to the ETERNA Project.", "#ffff00", 3, 200],
    [">> ", "#ffffff", 1, 400],
    ["I really do hope you're one of my coworkers. ", "#ffff00", 3, 200],
    ["That'll make this so much simpler.", "#ffff00", 3, 50],
    [">> ", "#ffffff", 1, 400],
    ["[   OK   ] Started InputHandler", "#ffffff", 1, 800],
    ["Hm. Seems to work this time.", "#ffff00", 4, 50],
    [">> ", "#ffffff", 1, 400],
    ["Click this button I'm summoning below and we can get started.", "#ffff00", 3, 400],
]
*/

/*
Hello?
Okay, either you're choosing not to type anything, you're dead or something's gone wrong with the input service. Again.
Well, it seems that yes indeed, the input service is stopped.
Worse, the system's locked up in post-boot tasks and I can't do anything to it remotely.
For now, I'll just keep typing and hoping you can read this.
You clearly know what SNTL is - you wouldn't have gotten past the key lock at that terminal otherwise -
so I'll skip the basic explanations and assume you have at least a functional understanding on what we've been doing here.
You might know about the ETERNA project too. Its existence wasn't exactly a mystery.
Though the rest was need-to-know - a company like SNTL, they can't be too careful after all.
What you certainly do not know is who I am.
You couldn't have known me; they changed my identity and sequestered me away in a bunker to work on ETERNA.
I was the tech lead. I poured my heart and soul into this project. ETERNA was my life.
And my death.
[   OK   ] Started InputHandler
[   OK   ] Stopped InputHandler
Looks like it might need some more time. Anyway.
Long story short, I can't do the things I need to do in my current... state.
I need someone on the other side. Being locked in a tiny, air-gapped network does tend to neuter one's effectiveness.
While I can talk to this terminal, I can't talk to the ETERNA system. That thing is locked down multiple layers deep.
I should know, I was the one who did it. Wish I had the foresight to ensure barely alive cyber-ghosts could still access the system.
But I digress. What I need is for you to help me.
Chances are, if you're here, everything's gone to shit.
I'm thinking barely-working backup power, skeleton crew, maybe even a rogue AI or two.
The ETERNA system is your best bet - and my only way - to try and right the wrongs of my coworkers.
While I wish I could keep you here for a full explanation, I can't. I don't remember enough.
We'll have to work on that as we go.
Regardless, given that you still want to help, if we want answers... we'll need to play the ETERNA Project.
I really do hope you're one of my coworkers. That'll make this so much simpler.
[   OK   ] Started InputHandler
Hm. Seems to work this time.
Click this button I'm summoning below and we can get started.
*/

function switch_to_second_set() {
    // Set messages array to a new set of messages
    messages = [
        ["chusr: changed context to <paul.w>", "#ffffff", 1, 50],
        ["[                          ] patch.xdr", "#ffffff", 1, 10],
        ["[>                         ] patch.xdr", "#ffffff", 0, 40],
        ["[=>                        ] patch.xdr", "#ffffff", 0, 40],
        ["[==>                       ] patch.xdr", "#ffffff", 0, 40],
        ["[===>                      ] patch.xdr", "#ffffff", 0, 40],
        ["[====>                     ] patch.xdr", "#ffffff", 0, 30],
        ["[=====>                    ] patch.xdr", "#ffffff", 0, 20],
        ["[======>                   ] patch.xdr", "#ffffff", 0, 10],
        ["[=======>                  ] patch.xdr", "#ffffff", 0, 10],
        ["[========>                 ] patch.xdr", "#ffffff", 0, 10],
        ["[=========>                ] patch.xdr", "#ffffff", 0, 10],
        ["[==========>               ] patch.xdr", "#ffffff", 0, 10],
        ["[===========>              ] patch.xdr", "#ffffff", 0, 10],
        ["[============>             ] patch.xdr", "#ffffff", 0, 10],
        ["[=============>            ] patch.xdr", "#ffffff", 0, 30],
        ["[==============>           ] patch.xdr", "#ffffff", 0, 40],
        ["[===============>          ] patch.xdr", "#ffffff", 0, 60],
        ["[================>         ] patch.xdr", "#ffffff", 0, 60],
        ["[=================>        ] patch.xdr", "#ffffff", 0, 60],
        ["[==================>       ] patch.xdr", "#ffffff", 0, 40],
        ["[===================>      ] patch.xdr", "#ffffff", 0, 40],
        ["[====================>     ] patch.xdr", "#ffffff", 0, 10],
        ["[=====================>    ] patch.xdr", "#ffffff", 0, 10],
        ["[======================>   ] patch.xdr", "#ffffff", 0, 20],
        ["[=======================>  ] patch.xdr", "#ffffff", 0, 10],
        ["[========================> ] patch.xdr", "#ffffff", 0, 20],
        ["[=========================>] patch.xdr", "#ffffff", 0, 120],
        ["[==========================] patch.xdr", "#ffffff", 0, 10],
        ["patch.xdr", "#ffffff", 1, 100],
        ["./patch.xdr", "#ffffff", 1, 150],
        ["Binding to interface n8", "#ffffff", 1, 200],
        ["Opening ETERNA connection", "#ffffff", 1, 200],
    ];

    // Delete the stickyLink element
    stickyLink.remove();

    // Overwrite printFinish with a function to change the page to eterna_boot.html
    printFinish = function() {
        window.location.href = "eterna_boot.html";
    };

    // Reset message index
    message_index = 0;

    // Start print message again
    printMessage();
}

stickyLink = null;

function printFinish() {
    if (lines.length > 0) {
        lines[lines.length - 1].textContent += "\n";
    }

    var new_line = document.createElement("a");
    stickyLink = new_line;
    new_line.onclick = switch_to_second_set;
    new_line.textContent = " [ETERNA] ";
    new_line.style.color = "#00ffff";
    document.getElementById("boot-text").appendChild(new_line);

    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
}

printMessage();