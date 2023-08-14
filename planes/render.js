const layer_names = [
    "front",
    "ui1",
    "ui2",
    "fg1",
    "fg2",
    "fg3",
    "bg1",
    "bg2",
    "bg3"
]

let layers = {}

let zoom_scale = 0.02;  // km per pixel

let canvas_width = 256;
let canvas_height = 256;

let canvas_x = 0;
let canvas_y = 0;

let mouse_position = new Vector2(0, 0);
let mouse_select_pos = new Vector2(0, 0);

function get_canvases() {
    layer_names.forEach(layer => {
        let c = document.getElementById("game-canvas-" + layer);

        layers[layer] = {
            canvas: c,
            ctx: c.getContext("2d")
        }
    })
}

function handle_resize(event) {
    canvas_height = Math.round(vh(90));
    canvas_width = Math.round((canvas_height * 16) / 9);

    Object.keys(layers).forEach(k => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        canvas.style.width = canvas_width + "px";
        canvas.style.height = canvas_height + "px";
    
        ctx.canvas.width = canvas_width;
        ctx.canvas.height = canvas_height;
    
        if (vw(100) % 1 == 0) {
            canvas.style.marginLeft = "0px";
        } else {
            canvas.style.marginLeft = "0.5px";
        }

        canvas.style.left = Math.round((vw(100) - canvas_width) / 2) + "px";
        canvas.style.top = (64 + Math.round((vh(100) - canvas_height) / 2)) + "px";
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        var rect = canvas.getBoundingClientRect();
        canvas_x = rect.x;
        canvas_y = rect.y;
    })

    layers.bg3.ctx.fillStyle = "#010"
    layers.bg3.ctx.fillRect(0, 0, canvas_width, canvas_height)

    // layers.bg2.ctx.drawImage(
    //     document.getElementById("map-clean"), 0, 0, canvas_width, canvas_height
    // )
}

function render_units(combat) {
    layers.fg3.ctx.clearRect(0, 0, canvas_width, canvas_height)
    layers.fg2.ctx.clearRect(0, 0, canvas_width, canvas_height)

    const plane_icon = new Image(480, 480);
    plane_icon.src = "img/plane.png";

    write_rotated_image(
        layers.fg3.canvas,
        layers.fg3.ctx,
        combat.aircraft[0].position.x,
        combat.aircraft[0].position.y,
        plane_icon,
        24, 24,
        combat.aircraft[0].heading.angle()
    )

    let brush = layers.fg2.ctx.createImageData(8, 8);
    write_rect_to_imagedata(brush, new Vector2(0, 0), new Vector2(8, 8), new Colour(255, 255, 255, 255))
    layers.fg2.ctx.putImageData(brush, mouse_select_pos.x-5, mouse_select_pos.y-5);
}

document.addEventListener("DOMContentLoaded", function() {
    get_canvases();

    /*
    let brushes = [];

    layer_names.forEach((k,i) => {
        let canvas = layers[k].canvas;
        let ctx = layers[k].ctx;

        ctx.imageSmoothingEnabled = false;

        let wh = 24 - ((i*2)+1);

        let brush = layers.bg3.ctx.createImageData(wh, wh);
        write_rect_to_imagedata(brush, new Vector2(0, 0), new Vector2(wh, wh), new Colour(i*25, 255, 255, 25))
        brushes.push(brush);
    })
    */

    layers.front.canvas.addEventListener("mousemove", function(event) {
        mouse_position = new Vector2(event.clientX-canvas_x, event.clientY-canvas_y);

        if (mouse_select_pos.x == 0 && mouse_select_pos.y == 0) {
            mouse_select_pos = mouse_position.copy();
        }
    });

    layers.front.canvas.addEventListener("click", function(event) {
        mouse_select_pos = mouse_position.copy();
    });

    handle_resize();
})

window.addEventListener("resize", handle_resize)


let test_plane = new Aircraft(0, aircraft_lookup["Test Plane"]);
test_plane.position = new Vector2(480, 480);
test_plane.heading = new Vector2(1, 0);

let combat = new Combat();
combat.aircraft.push(test_plane);

setInterval(function() {
    render_units(combat);
    let mouse_heading = mouse_select_pos.sub(test_plane.position).normalize();

    test_plane.heading = test_plane.heading.rotate_towards(mouse_heading, (Math.PI * 1.5) / (360 * zoom_scale * 60));
    test_plane.position = test_plane.position.add(test_plane.heading.mul(test_plane.speed / (zoom_scale * 60)))
}, 1000/60)

// TODO - figure out how to draw the individual countries, then figure out a method to show a zoomed view of the map at any zoom level and zoom center
