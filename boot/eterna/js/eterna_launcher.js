let debug_filebrowse_handle = null;
let cur_user_ctx = {user: {name: "paul.w"}};

let cursor_obj = null;

let debugging = true;

document.addEventListener("DOMContentLoaded", function() {
    // debug
    /*
    debug_filebrowse_handle = {
        kernel: default_filebrowse_kernel,
        data: {
            size: {x: 503, y: 256},
            position: {x: 260, y: 360},
            clicks: [],
            doubleclicks: [],
            keypresses: [],
            alerts: []
        },
        parameters: {},
        query_obj: {
            get: function(id) {
                return debug_filebrowse_handle.wnd.content.querySelector(`#${id}`)
            }
        },
        wnd: {
            title: document.getElementById("window-filebrowse-debug").querySelector(".wnd-title"),
            content: document.getElementById("window-filebrowse-debug").querySelector(".wnd-content"),
        },
        window_style: WindowStyle.DEFAULT,
        files_ctx: fs.make_context(/
            {user: {name: "paul.w"}}
        )
    }

    do_spawn(debug_filebrowse_handle);
    do_initial_paint(debug_filebrowse_handle);
    */

    document.addEventListener("mousedown", function(evt) {
        mouse_currently_down = true;
    })

    document.addEventListener("touchstart", function(evt) {
        mouse_currently_down = true;
        mouse_pos = new Vector2(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
    })

    document.addEventListener("touchmove", function(evt) {
        mouse_pos = new Vector2(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
    })

    document.addEventListener("mousemove", function(evt) {
        mouse_pos = new Vector2(evt.clientX, evt.clientY);
        mouse_currently_down = evt.buttons != 0;
    })

    document.addEventListener("touchend", function(evt) {
        mouse_currently_down = false;
    })

    document.addEventListener("mouseup", function(evt) {
        mouse_currently_down = false;
    })

    window.addEventListener("resize", handle_resize);

    document.getElementById("eterna-desktop").addEventListener("mousedown", function(evt) {
        change_focused_window(null);
    })

    cursor_obj = document.getElementById("eterna-cursor");

    setup_global_keybindings();
    handle_resize();

    let anim = function() {
        update_desktop();
        check_processes();
        window.requestAnimationFrame(anim);
    }

    window.requestAnimationFrame(anim);

    if (debugging) {
        /*
        start_process("filebrowse", {desktopbrowse: "true", location:"~/Desktop"}, cur_user_ctx.user);

        start_process("filebrowse", {}, cur_user_ctx.user);
        start_process("filebrowse", {location:"/SYSTEM/ICONS/CURSOR/triptych"}, cur_user_ctx.user);
        start_process("filebrowse", {location:"~/Desktop"}, cur_user_ctx.user);
        start_process("filebrowse", {location:"/SYSTEM/PROGRAMS"}, cur_user_ctx.user);

        start_process("shell", {workdir:"~"}, cur_user_ctx.user);

        start_process("clock", {}, cur_user_ctx.user);
        */

        start_process("filebrowse", {desktopbrowse: "true", artificial_loading_delay: 0, location:"~/Desktop"}, cur_user_ctx.user);

        start_process("filebrowse", {}, cur_user_ctx.user);
        start_process("pocket", {}, cur_user_ctx.user);
        load_eterna(true);
    } else {
        load_eterna();
    }
})