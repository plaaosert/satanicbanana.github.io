let debug_filebrowse_handle = null;
let cur_user_ctx = {user: {name: "paul.w"}};

let windowsiz = new Vector2(1920, 1080);

document.addEventListener("DOMContentLoaded", function() {
    load_eterna();

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

    windowsiz = new Vector2(vw(100), vh(100, true));

    document.addEventListener("mousemove", function(evt) {
        mouse_pos = new Vector2(evt.clientX, evt.clientY);
    })

    document.getElementById("eterna-desktop").addEventListener("mousedown", function(evt) {
        change_focused_window(null);
    })

    setup_global_keybindings();

    setInterval(check_processes, 1000/60);

    start_process("filebrowse", {}, cur_user_ctx.user);
    start_process("filebrowse", {}, cur_user_ctx.user);
    start_process("filebrowse", {location:"/users/paul.w/Desktop"}, cur_user_ctx.user);
    start_process("filebrowse", {location:"/SYSTEM/PROGRAMS"}, cur_user_ctx.user);

    start_process("shell", {workdir:"/users/paul.w"}, cur_user_ctx.user);

    start_process("clock", {}, cur_user_ctx.user);

    // start_process("login", {lock_user: "paul.w", lock_pass: "you shouldn't be looking here :-)"}, ctx);
})