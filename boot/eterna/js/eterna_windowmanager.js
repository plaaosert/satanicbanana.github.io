// "processes" are actually just spawned from a .xct file with the js file in programs/{}.js.
// Clock.xct is just "RUN clock", which finds the code added by clock.js.
// when a process is started, it is given a data dict {}. the spawn() function is run on it with this dict, as well as any launch parameters, a file view context and the window handle's query object.
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

const WindowStyle = {
    DEFAULT: "eterna-window-default",
    DEFAULT_NOCONTROLBUTTONS: "eterna-window-default@",
    NOBORDER: "eterna-window-noborder", 
}

const WindowStyleInitialPaints = new Map();
WindowStyleInitialPaints.set(WindowStyle.DEFAULT, new EternaDisplayMarkupElement(new EternaDisplayObject(
    "window_controls", "div", {
        top: "-22px",
        right: "2px",
        width: "64px",
        height: "20px"
    }
), [
    new EternaDisplayMarkupElement(new EternaDisplayObject(
        "window_controls_minimize", "div", {
            right: "40px",
            top: "0px",
            height: "16px",
            width: "16px",
            backgroundColor: "#0cf",
            border: "1px solid black",
            backgroundImage: "SYSTEM/ICONS/debug_16x16.img"
        }, "", false, true, false
    )),

    new EternaDisplayMarkupElement(new EternaDisplayObject(
        "window_controls_fullscreen", "div", {
            right: "20px",
            top: "0px",
            height: "16px",
            width: "16px",
            backgroundColor: "#6ff",
            border: "1px solid black",
            backgroundImage: "SYSTEM/ICONS/debug_16x16.img"
        }, "", false, true, false
    )),

    new EternaDisplayMarkupElement(new EternaDisplayObject(
        "window_controls_close", "div", {
            right: "0px",
            top: "0px",
            height: "16px",
            width: "16px",
            backgroundColor: "#f00",
            border: "1px solid black",
            backgroundImage: "SYSTEM/ICONS/debug_16x16.img"
        }, "", false, true, false
    ))
]).to_initial_paint())

function get_window_style_initial_paint(style) {
    let style_conv = style.replaceAll("@", "")
    switch (style) {
        case WindowStyle.DEFAULT:
            return WindowStyleInitialPaints.get(style_conv);

        default:
            return [];
    }
}

// process manager keeps track of each process's currently open windows.
function do_initial_paint(handle) {
    let result = handle.kernel.initial_paint();

    process_paint_result(handle, {additions: get_window_style_initial_paint(handle.data.window_style)});

    process_paint_result(handle, result);

    return result;
}

function do_paint(handle) {
    let result = handle.kernel.paint(handle.data);

    process_paint_result(handle, result);

    return result;
}

function do_spawn(handle) {
    return handle.kernel.spawn(handle.data, handle.parameters, handle.files_ctx)
}

function do_process(handle) {
    // intercept process to do some stuff based on some clicks
    handle.data.clicks.forEach(click => {
        if (click.from == "window_controls_close" && click.evt.button == 0) {
            handle.data.alerts.push(ProcessAlert.CLOSE);
        }
    })

    handle.data = handle.kernel.process(handle.data, handle.parameters, handle.files_ctx, handle.query_obj)
}

function do_heartbeat(handle) {
    return handle.kernel.heartbeat(handle.data, handle.parameters, handle.files_ctx, handle.query_obj);
}

function parse_styles(handle, target, styles) {
    if (styles) {
        Object.keys(styles).forEach(k => {
            if (k == "cursortype") {
                cursor_change_bindings.get(handle.id).set(target.id, styles[k]);
                target.dataset.cursortype = styles[k];
            } else if ((k == "background" || k == "backgroundImage") && styles[k].endsWith(".img")) {
                // need to browse the filesystem. take the ctx from handle
                let img_content = handle.files_ctx.get_file(styles[k]).get_content();
                target.style[k] = `url("${img_content}")`;
            } else if (k.startsWith("ott-tag-")) {
                let ct = styles[k];
                if (k == "ott-tag-src") {
                    ct = handle.files_ctx.get_file(ct).get_content();
                }

                target[k.split("ott-tag-")[1]] = ct;
            } else {
                target.style[k] = styles[k];
            }
        });
    }
}

function process_paint_result(handle, result) {
    if (result.removals) {
        // removals
        result.removals.forEach(removal => {
            let target = handle.wnd.content.querySelector(`#${removal}`);
            if (target) {
                target.remove();
            }
        })
    }

    if (result.edits) {
        // edits
        result.edits.forEach(edit => {
            let target = handle.wnd.content.querySelector(`#${edit.edit_id}`)

            if (target) {
                if (edit.changes.content) {
                    if (target.tagName.toLowerCase() == "input") {
                        target.value = edit.changes.content;
                    } else {
                        target.textContent = edit.changes.content;
                    }
                }

                parse_styles(handle, target, edit.changes.styles);

                target.disabled = edit.changes.disabled ? true : false;
            }
        })
    }

    if (result.additions) {
        // additions
        result.additions.forEach(add => {
            let target = add.add_to ? handle.wnd.content.querySelector(`#${add.add_to}`) : handle.wnd.content;

            let obj = add.object;

            let new_element = document.createElement(obj.typ);
            new_element.id = obj.id;

            new_element.addEventListener("mouseover", function(e) {
                handle_element_mouse_event("mouseover", handle.id, new_element.id);
                e.stopPropagation();
            })

            new_element.addEventListener("mouseleave", function(e) {
                handle_element_mouse_event("mouseleave", handle.id, new_element.id);
                e.stopPropagation();
            })

            if (target.dataset && target.dataset.cursortype && (!obj.styles["cursortype"] || target.dataset.cursortype != MouseDisplayTypes.NORMAL) ) {
                obj.styles["cursortype"] = target.dataset.cursortype
            }

            parse_styles(handle, new_element, obj.styles);

            if (obj.typ == "input") {
                new_element.value = obj.content;
            } else {
                new_element.textContent = obj.content;
            }

            new_element.disabled = obj.disabled;

            if (obj.onclick_enabled) {
                new_element.addEventListener("mousedown", function(event) {
                    if (event.detail > 1) {
                        handle.data.doubleclicks.push({from: obj.id, evt: event})
                    }
                    
                    handle.data.clicks.push({from: obj.id, evt: event})
                    event.stopPropagation();
                })

                /*
                new_element.addEventListener("dblclick", function(event) {
                    handle.data.doubleclicks.push({from: obj.id, evt: event})
                    event.stopPropagation();
                })
                */
            }

            if (obj.keypress_enabled) {
                new_element.addEventListener("keydown", function(event) {
                    handle.data.keypresses.push({from: obj.id, typ: "down", evt: event})
                    event.stopPropagation();
                })

                new_element.addEventListener("keyup", function(event) {
                    handle.data.keypresses.push({from: obj.id, typ: "up", evt: event})
                    event.stopPropagation();
                })
            }

            target.appendChild(new_element);
        })
    }

    if (result.title) {
        // title
        handle.wnd.title.textContent = result.title;
    }

    if (result.size) {
        // size
    }

    if (result.position) {
        // position
    }
}
