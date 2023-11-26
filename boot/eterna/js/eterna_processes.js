// "processes" are actually just spawned from a .xct file with the js file in programs/{}.js.
// Clock.xct is just "RUN clock", which finds the code added by clock.js.
// when a process is started, it is given a data dict {}. the spawn() function is run on it with this dict, as well as any launch parameters, a file view context and the window handle.
// 60 frames per second, each active process will:
//      be asked to heartbeat(). returning false here terminates the process.
//      be asked to process(). they are given all their data and can edit it, returning the updated version.
//      be asked to paint(). they can return:
//          edits:[{edit_id: "", changes: {}}], which will apply the changes within to the objects inside
//          addtions:[{add_to:"", object:{}}], which will add the objects within to the objects given
//          removals:[remove_id, ...], which will delete the objects given
//          title:"newtitle", to change the window title
//          size:(newsize_x, newsize_y), to change the window size
//          position:(newpos_x, newpos_y), to change the window position
//
//      initial_paint() is called at program creation after spawn(), which essentially acts exactly like a paint() function that can only really operate on additions.
//
// each process is 1:1 connected to an open window
// for a program that doesn't open a window, it will return {endnow: true} on spawn()
// which tells the process manager to immediately end it
// (all work would be done in spawn())
let kernels = {
    "shell": default_shell_kernel,
    "filebrowse": default_filebrowse_kernel,
    "login": default_login_kernel,
    "clock": default_clock_kernel,
    "texpad": default_texpad_kernel,
    "pocket": default_pocket_kernel
}

let cursor_change_bindings = new Map();

let last_mouse_type = MouseDisplayTypes.HIDDEN;
let mouse_type = MouseDisplayTypes.NORMAL;
let mouse_pos = new Vector2(-64, -64);

let window_current_size = new Vector2(1920, 1080);

let wnd_spawn_pos = new Vector2(48, 48);
let wnd_spawn_add = new Vector2(24, 24);

let wnd_default_size = new Vector2(552, 384);
let mouse_currently_down = false;

let maximized_windows = new Set();

class EternaProcessHandle {
    static id_inc = 0;

    constructor(kernel, parameters, user) {
        this.id = EternaProcessHandle.id_inc;
        EternaProcessHandle.id_inc++;

        this.started = false;

        this.kernel = kernel;
        let sthis = this;
        this.data = {
            set_content_size: function(newsiz) {
                let diff = sthis.data.size.sub(sthis.data.content_size);
                sthis.set_size(newsiz.add(diff), true);
            },
            maximize: function() {
                maximize_window(sthis);
            },
            toggle_maximize: function() {
                toggle_maximize_window(sthis);
            },
            set_pos: function(newpos) {
                sthis.set_pos(newpos);
            },
            window_style: WindowStyle.DEFAULT,
            size: wnd_default_size.copy(),
            saved_size: wnd_default_size.copy(), // used when disabling fullscreen
            saved_pos: wnd_spawn_pos.copy(), // same as saved_size
            content_size: wnd_default_size.copy(),
            content_size_diff: new Vector2(0, 0),
            position: wnd_spawn_pos.copy(),
            background: false,
            clicks: [],
            doubleclicks: [],
            keypresses: [],
            alerts: [],
        };

        wnd_spawn_pos = wnd_spawn_pos.add(wnd_spawn_add);
        wnd_spawn_pos = new Vector2(
            Math.max(64, wnd_spawn_pos.x % (0.4 * window_current_size.x)),
            Math.max(64, wnd_spawn_pos.y % (0.4 * window_current_size.y))
        )

        this.parameters = parameters,
        this.query_obj = {get: function(id) {return null}}
        this.wnd = {title: null, content: null, container: null}
        this.status = {
            dragged: false,
            drag_offset: new Vector2(0, 0),
            resizing: false,
            resize_type: "",
            resize_offset: new Vector2(0, 0),
            resize_original_size: new Vector2(0, 0)
        }

        if (user.user && !user.name) {
            console.log("invalid userctx!")
            debugger;
        }

        this.files_ctx = fs.make_context({user: user});
    }

    start(custom_xy) {
        if (custom_xy) {
            this.data.position = custom_xy
        }

        let result = do_spawn(this);
        if (!result || !result.endnow) {
            this.started = true;
        }
    }

    set_pos(to, do_not_alert) {
        this.data.position = to;

        this.wnd.container.style.left = `${to.x}px`;
        this.wnd.container.style.top = `${to.y}px`;

        if (!do_not_alert) {
            this.data.alerts.push(ProcessAlert.MOVED);
        }
    }

    set_size(to, do_not_alert) {
        this.data.size = to;

        this.wnd.container.style.width = `${to.x}px`;
        this.wnd.container.style.height = `${to.y}px`;

        this.data.content_size = to.sub(this.data.content_size_diff);

        if (!do_not_alert) {
            this.data.alerts.push(ProcessAlert.RESIZED);
        }
    }

    make_window() {
        let sthis = this;

        // make the html
        let container = document.createElement("div");
        container.id = `window-${this.id}`;
        container.classList.add("eterna-window");
        container.classList.add(this.data.window_style.replaceAll("@", ""));

        container.style.width = `${this.data.size.x}px`;
        container.style.height = `${this.data.size.y}px`;
        
        container.style.left = `${this.data.position.x}px`;
        container.style.top = `${this.data.position.y}px`;

        let title_container = document.createElement("div");
        title_container.classList.add("wnd-title-container");
        container.appendChild(title_container);

        let title_text = document.createElement("p");
        title_text.classList.add("wnd-title");
        title_text.textContent = "Title";
        title_container.appendChild(title_text);

        let window_content = document.createElement("div");
        window_content.classList.add("wnd-content");
        container.appendChild(window_content);

        ["horizontal", "vertical", "diagonal"].forEach((v, i) => {
            let bar = document.createElement("div");
            bar.classList.add(`${v}-resize-bar`);
            container.appendChild(bar);

            bar.addEventListener("mouseenter", function(e) {
                mouse_type = (sthis.kernel.prefs.disallow_resize || maximized_windows.has(sthis.id)) ? MouseDisplayTypes.NORMAL : (MouseDisplayTypes.RESIZE_H + i);
            });
    
            bar.addEventListener("mouseleave", function(e) {
                mouse_type = MouseDisplayTypes.NORMAL;
            })
            
            bar.addEventListener("mousedown", function(e) {
                sthis.status.resizing = !sthis.kernel.prefs.disallow_resize ? true : false;
                sthis.status.resize_type = v;
                sthis.status.resize_offset = mouse_pos;
                sthis.status.resize_original_size = sthis.data.size.copy();
            })
    
            bar.addEventListener("mouseup", function(e) {
                sthis.status.dragged = false;
            })
        })

        // probably stick in some special div at some point
        document.body.appendChild(container);

        container.style.zIndex = this.kernel.prefs.always_on_top ? 9999 : 0;

        container.addEventListener("mousedown", function(e) {
            change_focused_window(sthis);
        });

        title_container.addEventListener("mouseenter", function(e) {
            mouse_type = sthis.kernel.prefs.disallow_move ? MouseDisplayTypes.NORMAL : MouseDisplayTypes.HAND;
        });

        title_container.addEventListener("mouseleave", function(e) {
            mouse_type = MouseDisplayTypes.NORMAL;
        })

        title_container.addEventListener("mousedown", function(e) {
            if (maximized_windows.has(sthis.id)) {
                // we want the window to demaximize such that its new position is the same distance
                // across the total window size as it was before
                // so, if it's 25% across the screen, demaximize then move the window drag offset 25% backwards from top left
                let original_proportion = Math.min(mouse_pos.x, sthis.data.size.x - 160) / sthis.data.size.x;
                let diff = mouse_pos.sub(sthis.data.position)

                disable_maximize_window(sthis);

                sthis.set_pos(mouse_pos.sub(new Vector2(original_proportion * sthis.data.size.x, diff.y)));
            }

            sthis.status.dragged = !sthis.kernel.prefs.disallow_move ? true : false;
            sthis.status.drag_offset = sthis.data.position.sub(mouse_pos)
        })

        title_container.addEventListener("mouseup", function(e) {
            sthis.status.dragged = false;
        })

        this.wnd.container = container;
        this.wnd.title = title_text;
        this.wnd.content = window_content;

        let r = window_content.getBoundingClientRect();
        this.data.content_size = new Vector2(
            r.width,
            r.height,
        )

        this.data.content_size_diff = this.data.size.sub(this.data.content_size);

        this.query_obj.get = function(id) {
            return sthis.wnd.content.querySelector(`#${id}`);
        }

        do_initial_paint(this);
        change_focused_window(this);

        if (this.kernel.prefs.always_on_top) {
            this.wnd.container.classList.add("focused");
        }
    }
}

function setup_global_keybindings() {
    document.addEventListener("keydown", function(event) {
        if (focused_window) {
            focused_window.data.keypresses.push({from: "container", typ: "down", evt: event})   
        }
    })

    document.addEventListener("keyup", function(event) {
        /*
        if (event.code == "KeyQ") {
            fs.make_context(cur_user_ctx).write_to_file(
                "~/.configs/cursor.con",
                "source|/SYSTEM/ICONS/CURSOR/sntl/", true
            )
            
            last_mouse_type = MouseDisplayTypes.HIDDEN;
        }

        if (event.code == "KeyA") {
            fs.make_context(cur_user_ctx).write_to_file(
                "~/.configs/cursor.con",
                "source|/SYSTEM/ICONS/CURSOR/triptych/", true
            )

            last_mouse_type = MouseDisplayTypes.HIDDEN;
        }

        if (event.code == "KeyW") {
            mouse_type = (mouse_type + 1) % 9;
        }

        if (event.code == "KeyS") {
            mouse_type = (mouse_type - 1) % 9;
            if (mouse_type < 0) {
                mouse_type += 9;
            }
        }
        */

        if (focused_window) {
            focused_window.data.keypresses.push({from: "container", typ: "up", evt: event})
        }
    })
}

function update_desktop() {
    // cursor and icons
    // icons will just link into the eterna_desktop functions
    
    // cursor
    if (cursor_obj ) {
        let mouse_type_final = mouse_type;
        if (mouse_type == MouseDisplayTypes.HAND && processes.some(p => p.status.dragged)) {
            mouse_type_final = MouseDisplayTypes.HAND_CLOSED;
        }

        if (last_mouse_type != mouse_type_final) {
            // need to update the cursor obj
            // load the cursor source from user directory -> .configs/cursor.con
            last_mouse_type = mouse_type_final;
            let fctx = fs.make_context(cur_user_ctx);

            let config_content = fctx.get_file("~/.configs/cursor.con").get_content();
            let config_lines = config_content.split("\n");
            let config = {};
            config_lines.forEach(line => {
                let sp = line.split("|", 2);
                config[sp[0]] = sp[1];
            })

            let cursorpath = config["source"];

            let cursor_img = fctx.get_file(`${cursorpath}/${mouse_type_final}.img`).get_content();
            cursor_obj.src = `${cursor_img}`;
        }

        // set cursor position, include offset
        let cursor_obj_pos = mouse_pos.sub(MouseOffsets[mouse_type_final]);

        cursor_obj.style.left = `${cursor_obj_pos.x}px`;
        cursor_obj.style.top = `${cursor_obj_pos.y}px`;
    }
}

function handle_element_mouse_event(typ, handleid, elemid) {
    if (typ == "mouseleave") {
        mouse_type = MouseDisplayTypes.NORMAL;
        return;
    }

    let events = cursor_change_bindings.get(handleid);
    if (events) {
        let event = events.get(elemid);
        if (event) {
            mouse_type = event;
        }
    }
}

function check_processes() {
    processes_iter = [...processes];
    processes.length = 0;

    processes_iter.forEach(process => {
        if (process.started) {
            // if it needs a window, make it now
            if (!process.wnd.container) {
                process.make_window();
            }

            let v = do_heartbeat(process)
            if (v) {
                do_process(process)
                do_paint(process)
            } else {
                process.started = false;
                cursor_change_bindings.delete(process.id);
                if (focused_window && process.id == focused_window.id) {
                    focused_window = null;
                }
            }

            if (process.status.dragged) {
                // if the mouse isn't down, just disable dragged and leave
                if (mouse_currently_down) {
                    // make sure it doesn't get dragged offscreen
                    let drag_pos = mouse_pos.add(process.status.drag_offset);

                    drag_pos = new Vector2(
                        Math.max(-process.data.size.x + 96, Math.min(drag_pos.x, window_current_size.x - 96)),
                        Math.max(0, Math.min(drag_pos.y, window_current_size.y - 96))
                    )

                    process.set_pos(drag_pos);
                } else {
                    process.status.dragged = false;
                    mouse_type = MouseDisplayTypes.NORMAL;
                }
            }

            if (process.status.resizing) {
                if (mouse_currently_down) {
                    // window minimum size is 128x64
                    // make sure size doesn't get bigger than the total desktop size either,
                    // or out of bounds of the desktop
                    let resize_pos = process.status.resize_original_size.add(mouse_pos.sub(process.status.resize_offset));

                    // limit axes if we're horizontal or vertical
                    switch (process.status.resize_type) {
                        case "horizontal": {
                            resize_pos.x = process.data.size.x;
                            break;
                        }

                        case "vertical": {
                            resize_pos.y = process.data.size.y;
                            break;
                        }
                    }

                    let resize_pos_final = new Vector2(
                        Math.max(process.data.min_size ? process.data.min_size.x : 128, Math.min(window_current_size.x - process.data.position.x - 2, resize_pos.x)),
                        Math.max(process.data.min_size ? process.data.min_size.y : 64, Math.min(window_current_size.y - process.data.position.y - 2, resize_pos.y))
                    )

                    process.set_size(resize_pos_final);
                } else {
                    process.status.resizing = false;
                    mouse_type = MouseDisplayTypes.NORMAL;
                }
            }

            processes.push(process);
        } else {
            // cleanup window if it exists
            if (process.wnd.container) {
                process.wnd.container.remove()
            }
        }
    });

    processes_iter = [...processes];
}

function handle_resize(evt) {
    window_current_size = new Vector2(vw(100), vh(100, true));

    processes_iter.forEach(process => {
        if (!process.wnd.container) {
            return;
        }

        if (maximized_windows.has(process.id)) {
            process.set_pos(new Vector2(0, 0));
            process.set_size(window_current_size.sub(new Vector2(2, 2)));
        } else {
            let drag_pos = process.data.position;

            drag_pos = new Vector2(
                Math.max(-process.data.size.x + 96, Math.min(drag_pos.x, window_current_size.x - 96)),
                Math.max(0, Math.min(drag_pos.y, window_current_size.y - 96))
            )
    
            process.set_pos(drag_pos);
        }
    })
}

function toggle_maximize_window(handle) {
    if (maximized_windows.has(handle.id)) {
        disable_maximize_window(handle);
    } else {
        maximize_window(handle);
    }
}

function disable_maximize_window(handle) {
    if (!maximized_windows.has(handle.id)) {
        return;
    }

    maximized_windows.delete(handle.id);

    handle.set_size(handle.data.saved_size);
    handle.set_pos(handle.data.saved_pos);

    console.log(handle.data.size, handle.data.position);

    handle_resize();
}

function maximize_window(handle) {
    handle.data.saved_size = handle.data.size.copy();
    handle.data.saved_pos = handle.data.position.copy();

    maximized_windows.add(handle.id);

    handle_resize();
}

function start_process(name, parameters, user, custom_xy) {
    console.log(`running ${name} with`, parameters, "as", user);
    let kernel = kernels[name];
    if (kernel) {
        let handle = new EternaProcessHandle(
            kernel, parameters, user
        );

        cursor_change_bindings.set(handle.id, new Map());

        handle.start(custom_xy);
        processes.push(handle);
    } else {
        // should show an error message once those exist
    }
}

function change_focused_window(to) {
    if (focused_window && to && focused_window.id == to.id) {
        return;
    }

    if (!focused_window && !to) {
        return;
    }

    // don't defocus from an always on top window
    if (focused_window && focused_window.kernel.prefs.always_on_top) {
        return;
    }

    // don't focus onto a window with "background" on
    if (to && to.data.background) {
        return;
    }

    focused_window = to;

    processes_iter.forEach(p => {
        if (p.kernel.prefs.always_on_top) {
            return;
        }

        let w = p.wnd.container;

        if (w) {
            if (!focused_window || w.style.zIndex <= focused_window.wnd.container.style.zIndex) {
                w.classList.remove("focused");
                return;
            }

            w.style.zIndex = Math.max(0, w.style.zIndex-1);
            w.classList.remove("focused");
        } else {
            // pass
        }
    })

    if (to && !to.kernel.prefs.always_on_top) {
        to.wnd.container.style.zIndex = processes_iter.length;
        focused_window.wnd.container.classList.add("focused");
    }
}

function open_file(userctx, path, origin) {
    console.log(userctx, path, origin);

    // MAKE SURE YOU SET THE ORIGIN TO THE RIGHT THING :)
    let usr_ctx = userctx;
    if (userctx.name && !userctx.user) {
        // we've been given a user profile, not a user context.
        // when i am less lazy i will start making this throw an exception
        // for now just fix it lol
        throw new Error("you passed in a user profile, not a user context. use files_ctx.userctx, not files_ctx.user");
        console.log("changing user profile to user context");
        usr_ctx = {user: {name: userctx.name}};
    }

    let file_context = fs.make_context(usr_ctx);
    let file = null;
    try {
        file = fs.get_object(file_context, path);
    } catch {
        // show error msg here
        console.log("couldn't find file")
    }

    if (!file) {
        return;
    }

    // if it's not a file, throw it at filebrowse. it's our best shot at dealing with it
    if (!(file instanceof EternaFSFile)) {
        start_process("filebrowse", {location:path}, usr_ctx.user);
        return;
    }

    // so we do different things for different files:
    /*
    O xct: open as shell interactive:false cmd:"[content of file]"
         shell uses semicolons ; as command delimiters so convert newlines to that if there are any
         the first line of an xct is the path of its icon. dont run that
    
    X img: open as imgview file:"[filepath]"
    X snd: open as sndview file:"[filepath]"
    X vid: open as vidview file:"[filepath]"
    X tex: open as texpad file:"[filepath]"
    X lin: open file linked, run open_file on that
    
    O other: open as texpad file:"[filepath]"
           texpad warns if the file is not binary data (but everything is base64 so it should be fine anyway
    */
    let filecontent = file.get_content();
    let ext = file.get_ext();
    switch(ext) {
        case "tex":
            start_process("texpad", {file: file.get_abs_path()}, usr_ctx.user);
            break;

        case "lin": {
            let lines = filecontent.split("\n");
            lines.slice(1).forEach(line => {
                open_file(usr_ctx, line, origin);
            })
            break;
        }

        case "xct": {
            let lines = filecontent.split("\n");
            let exec_lines = lines.slice(1).join(";");
            start_process("shell", {interactive:"false", cmd:exec_lines, workdir:origin}, usr_ctx.user);
            break;
        }
    }
}

let processes = [];
let processes_iter = [];
let focused_window = null;
