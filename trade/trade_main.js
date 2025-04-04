game_id = "trade";

let settlement = null;
let industry = null;

async function debug_test_all(generate_seed) {
    console.log("doing tile map")
    let world = null;
    if (generate_seed) {
        world = World.generate(new Vector2(1024, 1024), generate_seed)
    } else {
        world = await debug_load_maps_then_tile();
    }

    let game = new Game(world, [
        new Settlement(
            "Scrimbloton", new Vector2(24, 24), [
                new Industry(industry_template_list["Food Company"], null, 25000)
            ], 2500
        ),

        new Settlement(
            "Pisschester", new Vector2(34, 26), [
                new Industry(industry_template_list["Food Company"], null, 25000)
            ], 500
        ),
    ], [
        new Trader("dude", null, new Vector2(16, 36), 100, [], 0.5, )
    ]);

    let viewer = new Viewer(game, layers);

    let t = Date.now();
    console.log("rendering world")
    
    viewer.render_world();
    viewer.render_settlements();
    viewer.render_traders();

    console.log(`done rendering (took ${Date.now() - t}ms)`);
}

/*
function cubic_bezier_ab(a_pos, a_dir, b_pos, b_dir, k1, k2, s_granularity) {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    layers.debug_front.ctx.strokeStyle = "#fff";

    // (ux, uy) = k1(bx1 - bx0, by1 - by0)
    // ux = k1(bx1 - bx0)
    // ux/k1 = bx1 - bx0
    // ux/k1 + bx0 = bx1

    let k_scale = b_pos.distance(a_pos);

    let a_vector = new Vector2(
        (a_dir.x / (k1 / k_scale)) + a_pos.x,
        (a_dir.y / (k1 / k_scale)) + a_pos.y
    );

    let b_vector = new Vector2(
        (b_dir.x / (k2 / k_scale)) + b_pos.x,
        (b_dir.y / (k2 / k_scale)) + b_pos.y
    );

    let b0 = a_pos;
    let b1 = a_vector;
    let b2 = b_vector;
    let b3 = b_pos;

    let n = 1 / s_granularity;

    layers.debug_front.ctx.beginPath();
    layers.debug_front.ctx.moveTo(b0.x, b0.y);

    layers.debug_front.ctx.fillStyle = "#0f0";

    for (let s=0; s<=1; s+=n) {
        let xy = ["x", "y"].map(t => {
            return (b0[t] * Math.pow(1-s, 3)) + (3 * b1[t] * s * Math.pow(1-s, 2)) + (3 * b2[t] * Math.pow(s, 2) * (1-s)) + (b3[t] * Math.pow(s, 3));
        });

        layers.debug_front.ctx.lineTo(...xy);
        layers.debug_front.ctx.fillRect(xy[0]-1, xy[1]-1, 2, 2);
    }

    layers.debug_front.ctx.stroke();
    layers.debug_front.ctx.closePath();

    layers.debug_front.ctx.strokeStyle = "#ff0";
    layers.debug_front.ctx.beginPath();
    layers.debug_front.ctx.moveTo(b0.x, b0.y);
    let b1n = b0.add(a_dir.normalize().mul(50));
    layers.debug_front.ctx.lineTo(b1n.x, b1n.y);
    layers.debug_front.ctx.stroke();
    layers.debug_front.ctx.closePath();

    layers.debug_front.ctx.strokeStyle = "#ff0";
    layers.debug_front.ctx.beginPath();
    layers.debug_front.ctx.moveTo(b3.x, b3.y);
    let b2n = b3.add(b_dir.neg().normalize().mul(50));
    layers.debug_front.ctx.lineTo(b2n.x, b2n.y);
    layers.debug_front.ctx.stroke();
    layers.debug_front.ctx.closePath();

    layers.debug_front.ctx.strokeStyle = "#02f";
    layers.debug_front.ctx.beginPath();
    layers.debug_front.ctx.moveTo(b3.x, b3.y);
    let dn = b3.add(pos2_dir.normalize().mul(30));
    layers.debug_front.ctx.lineTo(dn.x, dn.y);
    layers.debug_front.ctx.stroke();
    layers.debug_front.ctx.closePath();

    layers.debug_front.ctx.fillStyle = "#f00";
    layers.debug_front.ctx.fillRect(b0.x-2, b0.y-2, 4, 4);

    layers.debug_front.ctx.fillStyle = "#33f";
    layers.debug_front.ctx.fillRect(b3.x-2, b3.y-2, 4, 4);
}

function line_ab(a, b) {
    layers.debug_front.ctx.clearRect(0, 0, canvas_width, canvas_height);

    layers.debug_front.ctx.strokeStyle = "#fff";
    layers.debug_front.ctx.beginPath();
    layers.debug_front.ctx.moveTo(a.x, a.y);
    layers.debug_front.ctx.lineTo(b.x, b.y);
    layers.debug_front.ctx.stroke();
    layers.debug_front.ctx.closePath();

    layers.debug_front.ctx.fillStyle = "#f00";
    layers.debug_front.ctx.fillRect(a.x-2, a.y-2, 5, 5);

    layers.debug_front.ctx.fillStyle = "#33f";
    layers.debug_front.ctx.fillRect(b.x-2, b.y-2, 5, 5);
}

pos1 = new Vector2(10, 10);
const movespeed = 100;

mvt_dir = new Vector2(1, 0);
aim_dir = new Vector2(1, 0);

pos2 = new Vector2(300, 300);
pos2_dir = new Vector2(1, 0);
const pos2_movespeed = 40;

let ks = 1.8;
*/

document.addEventListener("DOMContentLoaded", function(e) {
    settlement = new Settlement(
        "Scrimbloton", new Vector2(500, 500), [
            new Industry(industry_template_list["Food Company"], null, 25000)
        ]
    );

    industry = settlement.industries[0];

    get_canvases();

    layers.front.canvas.addEventListener("contextmenu", evt => {
        console.log("rightclicked")

        evt.preventDefault();
        return false;
    }, false);

    layers.front.canvas.addEventListener("click", evt => {
        console.log("clicked")
    })

    /*
    bezier test code

    let last_frame = Date.now();
    let lc = Date.now();
    let fn = () => {
        let delta_time = (Date.now() - last_frame) / 1000;
        last_frame = Date.now();

        let tick_on = false;
        if (last_frame - lc > 200) {
            tick_on = true;

            lc = last_frame;
        }

        const gamepads = navigator.getGamepads();

        let gp = null;
        gamepads.forEach(p => {
            if (true && p && p.axes.length >= 4) {
                gp = p;
            }
        })

        if (gp) {
            let axis1 = new Vector2(gp.axes[0], gp.axes[1]);
            let axis2 = new Vector2(gp.axes[2], gp.axes[3]);

            if (axis1.sqr_magnitude() > 0.3) {
                pos1 = pos1.add(axis1.mul(movespeed).mul(delta_time));
                mvt_dir = axis1.normalize();
            }

            if (axis2.sqr_magnitude() > 0.3) {
                aim_dir = axis2.neg().normalize();
            }

            if (tick_on) {
                if (gp.buttons[12].pressed) {
                    ks += 0.1;
                    console.log(ks);
                }

                if (gp.buttons[13].pressed) {
                    ks -= 0.1;
                    console.log(ks);
                }
            }
        }

        if (tick_on) {
            if (Math.random() < 0.05) {
                pos2_dir = pos2_dir.add(random_on_circle(1)).normalize();
            }
        }

        pos2 = pos2.add(pos2_dir.mul(pos2_movespeed).mul(delta_time));

        cubic_bezier_ab(pos1, mvt_dir, pos2, aim_dir, ks, ks, 128)

        window.requestAnimationFrame(fn);
    }

    window.requestAnimationFrame(fn);
    */

    handle_resize();
    // window.addEventListener("resize", handle_resize);
});