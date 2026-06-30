let dragged_window = null;
let dragged_window_offset = null;

let window_id_inc = 0;
let windows = {

}

let window_movement_base = new Vector2(16, 16);
let window_movement_per = new Vector2(32, 32);

let cur_mousepos_x = 0;
let cur_mousepos_y = 0;

function get_next_z_index() {
    let highest_z = Object.keys(windows).reduce((p, wk) => {
        return Math.max(p, windows[wk].zpos)
    }, 0);

    return highest_z + 1;
}

function spawn_window(from_template_classname, title=null, colour1=null, colour2=null) {
    let windowcol1 = colour1 ?? "#070";
    let windowcol2 = colour2 ?? "#555";

    let windowtitle = title ?? "Window Title";

    let template = document.querySelector(`.window.${from_template_classname}.template`);

    let clone = template.cloneNode(true);
    clone.classList.remove("template");

    clone.style.setProperty("--col1", windowcol1);
    clone.style.setProperty("--col2", windowcol2);

    let topbar = clone.querySelector(".window-topbar");

    topbar.querySelector(".window-title").textContent = windowtitle;

    let initial_pos = window_movement_base;
    while (Object.keys(windows).some(wk => windows[wk].position.equals(initial_pos))) {
        initial_pos = initial_pos.add(window_movement_per);
    }

    let windowid = window_id_inc;
    window_id_inc++;
    let windowsettings = {
        id: windowid,
        elem: clone,
        last_unminimised_pos: initial_pos,
        last_minimised_pos: null,

        zpos: get_next_z_index(),

        position: initial_pos,
        minimised: false,
    }

    clone.style.zIndex = windowsettings.zpos;
    clone.setAttribute("data-window-id", windowid);
    windows[windowid.toString()] = windowsettings;

    move_window(clone, initial_pos.x, initial_pos.y);

    topbar.addEventListener("mousedown", e => {
        dragged_window_offset = new Vector2(e.clientX, e.clientY).sub(windowsettings.position);
        dragged_window = clone;
        
        let newz = get_next_z_index();
        clone.style.zIndex = newz;
        windowsettings.zpos = newz;
    });

    topbar.querySelector(".controlbuttons").addEventListener("mousedown", e => {
        e.stopPropagation();
        return false;
    })

    topbar.querySelector(".minimise")?.addEventListener("click", e => {
        toggle_minimise_window(clone);

        let newz = get_next_z_index();
        clone.style.zIndex = newz;
        windowsettings.zpos = newz;
    })

    document.querySelector(".windows").append(clone);

    return {
        window: clone,
        content: clone.querySelector(".window-content")
    };
}

function move_window(window_elem, to_x=null, to_y=null, save_lastpos=true) {
    let window_data = windows[window_elem.getAttribute("data-window-id")];
    let window_bbox = window_data.elem.getBoundingClientRect();

    let lastpos_key = window_data.minimised ? "last_minimised_pos" : "last_unminimised_pos";
    let lastpos = window_data[lastpos_key];
    let newpos = new Vector2(to_x ?? window_data.position.x, to_y ?? window_data.position.y)

    if (save_lastpos)
        window_data[lastpos_key] = window_data.position;

    let max_y = window.innerHeight - window_bbox.height;
    let max_x = window.innerWidth - window_bbox.width;

    let final_y = Math.max(0, Math.min(max_y, newpos.y));
    let final_x = Math.max(0, Math.min(max_x, newpos.x));

    window_data.position = new Vector2(final_x, final_y);

    window_elem.style.top  = `${final_y}px`;
    window_elem.style.left = `${final_x}px`;
}

function toggle_minimise_window(window_elem, force_to_state=null) {
    let windowdata = windows[window_elem.getAttribute("data-window-id")];

    if (force_to_state !== null) {
        if (force_to_state) {
            window_elem.classList.add("minimised");
        } else {
            window_elem.classList.remove("minimised");
        }
    } else {
        window_elem.classList.toggle("minimised");
    }
    let minimised = window_elem.classList.contains("minimised");
    
    windowdata.minimised = minimised;
    let newpos = windowdata[
        minimised ? "last_minimised_pos" : "last_unminimised_pos"
    ]

    if (newpos)
        move_window(window_elem, newpos.x, newpos.y, false);
    else
        move_window(window_elem, null, null, false);
}

function handle_window_movement() {
    if (dragged_window) {
        move_window(dragged_window, cur_mousepos_x - dragged_window_offset.x, cur_mousepos_y - dragged_window_offset.y)
    }
}

document.addEventListener("DOMContentLoaded", e => {
    window.addEventListener("mousemove", e => {
        cur_mousepos_x = e.clientX;
        cur_mousepos_y = e.clientY;

        handle_window_movement();
    })
    
    document.addEventListener("mousemove", e => {
        if (e.buttons == 0) {
            dragged_window_offset = null;
            dragged_window = null;
        }
    });
})