let shell_display_markup = new EternaDisplayMarkupContainer(
    "Shell", [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "command_area",
                0, 0, "100%", "100%", {
                    backgroundColor: "#000"
                }, false
            ), [
                new EternaDisplayMarkupElement(
                    EternaDisplayObject.label(
                        "text_lines", "I should be replaced.",
                        2, 2, "calc(100% - 4px)", "calc(100% - 4px)", {
                            fontFamily: "nec_apc, \"MS Gothic\", monospace",
                            fontSize: "16px",
                            color: "white",
                            whiteSpace: "pre-wrap",
                            wordBread: "break-all"
                        }, false
                    )
                ),

                new EternaDisplayMarkupElement(
                    EternaDisplayObject.div(
                        "text_caret", 2+16, 14, 8, 2, {
                            animationName: "flash",
                            animationDuration: "1.1s",
                            animationFillMode: "both",
                            animationIterationCount: "infinite",
                            backgroundColor: "white"
                        }, false
                    )
                ),
            ]
        )
    ]
)

function runcmd(cmd, data, parameters, files_ctx) {
    let command_unparsed = cmd;
    let commands = command_unparsed.split(";");
    commands.forEach(cmd => {
        data.text_lines.push(`${data.workdir} >> ${data.cur_typed_cmd}`);
        /*
        X HELP - output help
        X RENAME X Y - rename X to Y. fails if already exists
        X COPY X Y - copy X to Y. fails if already exists
        X DELETE X - delete X.
        X KERNEL X Y - start process with given kernel name and params y (param:"value" param2:value2 ...)
        X [X] - without a directive:
                - tries to open the file as a path
                - searches current directory for file with exactly that name
                    (current directory from desktop icons is the desktop)
                - searches current directory for .xct files matching name
                - searches /SYSTEM/PROGRAMS for exactly that name 
                - searches /SYSTEM/PROGRAMS for .xct files matching name
                - gives up
        */
        let segs = cmd.split(" ");
        let operator = segs[0];
        let operands = segs.slice(1);
        switch (operator.toUpperCase()) {
            case "HELP":
                break;

            case "RENAME":
                break;

            case "COPY":
                break;

            case "DELETE":
                break;

            case "ECHO":
                data.text_lines.push(operands.join(" "));
                break;

            case "LS": {
                let fp = operands.join(" ");
                fp = fp.trim();

                // fp = fp.replaceAll("~", `/users/${files_ctx.user.name}/`)

                let file_to_run = null;
                if (fp) {
                    try {
                        file_to_run = files_ctx.get_object(fp.startsWith("/") ? fp : data.workdir + "/" + fp);
                    } catch {
                        data.text_lines.push(`Couldn't find the directory "${fp}".`);
                        break;
                    }
                } else {
                    file_to_run = files_ctx.get_object(data.workdir)
                }

                file_to_run.children.forEach(l => {
                    data.text_lines.push(`-${((l.name ? " " + l.name : "") + (l instanceof EternaFSDirectory ? "/" : "")).padEnd(24)} ${l.owner.padEnd(12)} ${l.permissions.world_read ? "r" : "-"}${l.permissions.world_write ? "w" : "-"}`)
                })
            }

            case "CD": {
                let fp = operands.join(" ");
                fp = fp.trim();

                // fp = fp.replaceAll("~", `/users/${files_ctx.user.name}/`)

                let file_to_run = null;
                try {
                    file_to_run = files_ctx.get_object(fp.startsWith("/") ? fp : data.workdir + "/" + fp);
                } catch {
                    // oh well!
                }

                if (file_to_run) {
                    data.workdir = file_to_run.get_abs_path();
                } else {
                    data.text_lines.push(`Couldn't find the directory "${fp}".`);
                }
                break;
            }

            case "CONSOLELOG":
                data.text_lines.push("Sending it through the fourth wall...");
                console.log(operands.join(" "));
                break;

            case "KERNEL":
                let params = {};
                let spl = operands.slice(1).join(" ").match(/(?:[^\s"]+|"[^"]*")+/g);
                if (spl) {
                    spl.forEach(s => {
                        if (s) {
                            let sg = s.split(":");
                            let pname = sg[0];
                            let pdata = sg.slice(1).join(" ");

                            params[pname.replaceAll("^\"|\"$", "")] = pdata.replaceAll("^\"|\"$", "")
                        }
                    })
                }

                start_process(operands[0], params, files_ctx.userctx)
                break;

            default:
                // one day, this should also pass parameters through to xct files
                // (and shell expressions should work with custom parameters too)

                let fp = operator;
                fp = fp.trim();

                if (!fp) {
                    break;
                }

                let file_to_run = null;
                try {
                    file_to_run = files_ctx.get_object(fp.startsWith("/") ? fp : data.workdir + "/" + fp);
                } catch {
                    // oh well!
                }

                if (!file_to_run) {
                    // searches current directory for file with exactly that name
                    let workdir_obj = files_ctx.get_object(data.workdir);

                    workdir_obj.children.forEach(c => {
                        if (c.name == fp) {
                            file_to_run = c;
                        }
                    });

                    if (!file_to_run) {
                        // searches current directory for .xct files matching name
                        workdir_obj.children.forEach(c => {
                            if (c.name == (fp + ".xct")) {
                                file_to_run = c;
                            }
                        });

                        if (!file_to_run) {
                            // searches /SYSTEM/PROGRAMS for exactly that name 
                            let system_progs = files_ctx.get_object("/SYSTEM/PROGRAMS/");
                            system_progs.children.forEach(c => {
                                if (c.name == fp) {
                                    file_to_run = c;
                                }
                            });

                            if (!file_to_run) {
                                // searches /SYSTEM/PROGRAMS for .xct files matching name
                                system_progs.children.forEach(c => {
                                    if (c.name == (fp + ".xct")) {
                                        file_to_run = c;
                                    }
                                });

                                // and if this doesn't work we give up.
                            }
                        }
                    }
                }

                if (file_to_run) {
                    open_file(files_ctx.userctx, file_to_run.get_abs_path(), data.workdir);
                    data.text_lines.push(" ");
                } else {
                    data.text_lines.push(`"${cmd}"`);
                    data.text_lines.push(`was not recognised as a command, executable or file name.`);
                }
                break;
        }

        data.text_lines.push(``);
    })
}

function typekey(data, parameters, files_ctx, kp) {
    data.ctrl_down = kp.evt.key.length > 1;

    let cmd_operation_area = data.cur_typed_cmd
    let cmd_suffix = ""

    if (data.caret_offset) {
        cmd_operation_area = data.cur_typed_cmd.slice(0, -data.caret_offset);
        cmd_suffix = data.cur_typed_cmd.slice(-data.caret_offset);
    }

    // if ctrl is pressed, do something special.
    // else, type the char into the terminal
    if (kp.evt.ctrlKey) {
        switch (kp.evt.code) {
            // lmao nothing yet
            case "Backspace":
                let spc_index = Math.max(
                    cmd_operation_area.lastIndexOf("-"),
                    cmd_operation_area.lastIndexOf(" ")
                )

                while (spc_index > 0) {
                    if ("- ".includes(cmd_operation_area[spc_index-1])) {
                        spc_index--;
                    } else {
                        break;
                    }
                }

                cmd_operation_area = cmd_operation_area.slice(0, spc_index > 0 ? spc_index : 0);
                break;
            
            case "KeyC":
                data.cur_typed_cmd += "^C";
                runcmd("", data, parameters, files_ctx)
                data.cur_typed_cmd = "";
                cmd_suffix = "";
                cmd_operation_area = "";
                data.caret_offset = 0;
                break;
        }
    } else if (kp.evt.key.length == 1) {
        cmd_operation_area += kp.evt.key
    } else {
        switch (kp.evt.code) {
            case "Backspace":
                cmd_operation_area = cmd_operation_area.slice(0, -1)
                break;

            case "ArrowLeft":
                data.caret_offset++;
                break;

            case "ArrowRight":
                data.caret_offset--;
                break;

            case "Enter":
                runcmd(data.cur_typed_cmd, data, parameters, files_ctx)
                data.cur_typed_cmd = "";
                cmd_suffix = "";
                cmd_operation_area = "";
                data.caret_offset = 0;
                break;
        }
    }
    
    data.caret_offset = Math.max(0, Math.min(data.cur_typed_cmd.length-1, data.caret_offset))

    data.cur_typed_cmd = cmd_operation_area + cmd_suffix;

    data.typed_something = true;
}

let default_shell_kernel = new EternaProcessKernel(
    shell_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        // process commands if there are any
        data.workdir = parameters["workdir"] ? parameters["workdir"] : "/"
        
        data.workdir = files_ctx.get_object(data.workdir).get_abs_path();
        
        data.ready_to_close = false;
        data.cmd_history = [];
        data.text_lines = [
            "ETERNA Subsystem #5 [PBS-948] Version 2032.4.4",
            "(c) SNTL Corporation. All rights reserved.",
            ""
        ];
        data.cur_typed_cmd = "";
        data.caret_offset = 0;

        data.typed_something = false;
        data.last_text_lines_length = 0;

        data.readd_caret_anim = false;
        data.tcur = "flash2";

        data.keypress_durations = {};
        data.ctrl_down = false;
        data.keypress_das = 60;
        data.keypress_arr = 5;

        console.log("[DEBUG] workdir: ", data.workdir)

        if (parameters["cmd"]) {
            runcmd(parameters["cmd"], data, parameters, files_ctx);
        }

        //console.log(parameters)
        return {endnow: parameters["interactive"] == "false"}
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return !data.ready_to_close;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        if (data.alerts.includes(ProcessAlert.CLOSE)) {
            data.ready_to_close = true;
        }

        if (!data.ctrl_down) {
            Object.keys(data.keypress_durations).forEach(k => {
                if (data.keypress_durations[k]) {
                    data.keypress_durations[k]++;
                    if (data.keypress_durations[k] >= data.keypress_das) {
                        data.keypress_durations[k] - data.keypress_arr;
                        typekey(data, parameters, files_ctx, {evt: {key: k, code: `Key${k.toUpperCase()}`}})
                    }
                }
            })
        }

        if (data.keypresses) {
            data.keypresses.forEach(kp => {
                if (kp.typ != "down" || kp.from != "container") {
                    if (kp.typ == "up") {
                        delete data.keypress_durations[kp.code]
                    }

                    return;
                }

                data.keypress_durations[kp.key] = 1;

                typekey(data, parameters, files_ctx, kp);
            })
        }

        data.clicks = [];
        data.dblclicks = [];
        data.keypresses = [];

        return data;
    },

    // paint
    function(data) {
        let paint_data = {edits: []};
        if (data.last_text_lines_length != data.text_lines.length || data.typed_something) {            
            let content_unwrapped = data.text_lines.join("\n") + `\n${data.workdir} >> ${data.cur_typed_cmd}`;

            let cur_x = 0;
            let cur_y = 1;

            let max_x = Math.floor((data.size.x-9) / 8);
            let max_y = Math.floor((data.size.y-33) / 16) + 1;

            let content_wrapped = "";

            for (let i=0; i<content_unwrapped.length-data.caret_offset; i++) {
                let c = content_unwrapped[i];
                if (c == "\n") {
                    cur_x = 0;
                    cur_y++;
                    content_wrapped += "\n";
                } else {
                    cur_x++;
                    content_wrapped += c;
                    if (cur_x >= max_x) {
                        cur_x = 0;
                        cur_y++;
                        content_wrapped += "\n";
                    }
                }
            }
            
            // we might have too many lines. if we do, slice the content by line
            if (cur_y > max_y) {
                content_wrapped = content_wrapped.split("\n").slice(cur_y-max_y).join("\n");
                cur_y = max_y;
            }

            paint_data.edits.push(...[{
                edit_id: "text_lines",
                changes: {
                    content: content_wrapped
                }
            }, {
                edit_id: "text_caret",
                changes: {
                    styles: {
                        left: `${cur_x*8 + 2}px`,
                        top: `${cur_y*16}px`
                    }
                }
            }])

            if (data.typed_something) {
                data.readd_caret_anim = true;
                paint_data.edits.push({
                    edit_id: "text_caret",
                    changes: {
                        styles: {
                            animationName: "nothing",
                        }
                    }
                })
            }

            data.last_text_lines_length = data.text_lines.length;
            data.typed_something = false;
        }

        if (data.readd_caret_anim) {
            data.readd_caret_anim = false;
            paint_data.edits.push({
                edit_id: "text_caret",
                changes: {
                    styles: {
                        animationName: data.tcur,
                    }
                }
            })
            
            data.tcur = data.tcur == "flash" ? "flash2" : "flash"
        }

        return paint_data;
    },

    {
        // prefs (disallow_resize, disallow_move, always_on_top, ...)
    }
)