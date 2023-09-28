function write_pixel_to_imagedata(imagedata, x, y, rgba) {
    let idx = (imagedata.width * y) + (x);
    idx *= 4;

    for (let i=0; i<4; i++) {
        imagedata.data[idx+i] = rgba.data[i];
    }
}

function write_rect_to_imagedata(imagedata, tl, br, rgba) {
    for (let y=tl.y; y<br.y; y+=Math.sign(br.y-tl.y)) {
        for (let x=tl.x; x<br.x; x+=Math.sign(br.x-tl.x)) {
            write_pixel_to_imagedata(imagedata, x, y, rgba);
        }
    }
}

function get_pixel_from_imagedata(imagedata, x, y) {
    let idx = (imagedata.width * y) + (x);
    idx *= 4;

    let out = Array(4);

    for (let i=0; i<4; i++) {
        out[i] = imagedata.data[idx+i];
    }

    return Colour.from_array(out);
}

function write_rotated_imagedata(canvas, ctx, x, y, imagedata, angle_rad) {
    if (angle_rad) {
        ctx.translate(x, y);
        ctx.rotate(angle_rad);
        ctx.putImageData(imagedata, Math.round(-imagedata.width / 2), Math.round(-imagedata.height / 2));
        ctx.rotate(-angle_rad);
        ctx.translate(-x, -y);
    } else {
        ctx.putImageData(imagedata, x, y);
    }
}

function write_rotated_image(canvas, ctx, x, y, image, w, h, angle_rad) {
    var width = image.width;
    var height = image.height;

    if (angle_rad) {
        ctx.translate(x, y);
        ctx.rotate(angle_rad);
        ctx.drawImage(image, -w / 2, -h / 2, w, h);
        ctx.rotate(-angle_rad);
        ctx.translate(-x, -y);
    } else {
        ctx.drawImage(image, x, y, w, h);
    }
}

function write_text(ctx, text, x, y, colour, font, fontsize, centered) {
    ctx.font = `${fontsize}px ${font}`;
    ctx.fillStyle = colour;

    let offset_x = 0;
    let offset_y = 0;

    if (centered) {
        let metrics = ctx.measureText(text);
        offset_x -= metrics.width / 2;
    }

    ctx.fillText(text, x + offset_x, y + offset_y)
}

function draw_cone(ctx, x, y, r, colour, start_angle, end_angle) {
    if (Math.abs(start_angle - end_angle) >= Math.PI*2) {
        draw_circle(ctx, x, y, r, colour);
        return;
    }

    ctx.beginPath();
    ctx.strokeStyle = colour;

    let xy_vec = new Vector2(x, y);

    ctx.moveTo(x, y);
    let start_vec = Vector2.from_angle(start_angle).mul(r).add(xy_vec);
    let end_vec = Vector2.from_angle(end_angle).mul(r).add(xy_vec);

    ctx.lineTo(start_vec.x, start_vec.y);

    ctx.moveTo(x, y);
    ctx.lineTo(end_vec.x, end_vec.y);

    ctx.moveTo(x, y);
    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(x, y, r, r, 0, start_angle, end_angle);

    ctx.stroke();
}

function draw_circle(ctx, x, y, r, colour, start_angle=0, end_angle=Math.PI*2) {
    ctx.beginPath();
    ctx.strokeStyle = colour;

    ctx.ellipse(x, y, r, r, 0, start_angle, end_angle);
    ctx.stroke();
}

function vh(percent) {
    // topbar, bottombar 128px + 64px

    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * (h - 128 - 64)) / 100;
}

function vw(percent) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (percent * w) / 100;
}

function vmin(percent) {
    return Math.min(vh(percent), vw(percent));
}

function vmax(percent) {
    return Math.max(vh(percent), vw(percent));
}

function in_rect(tl, br, pos) {
    return (
        pos.x >= tl.x && pos.x <= br.x &&
        pos.y >= tl.y && pos.y <= br.y
    )
}

// http://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#C
function make_line(a, b, bound_rect) {
    // need to later make radius too, which should just be a diamond from every point
    // pretty simple but im lazy rn

    let x0 = a.x;
    let y0 = a.y;

    let x1 = b.x;
    let y1 = b.y;

    let coords = [];
    let dx = Math.abs(x1-x0);
    let sx = x0<x1 ? 1 : -1;
    let dy = Math.abs(y1-y0);
    let sy = y0<y1 ? 1 : -1; 
    let err = (dx>dy ? dx : -dy)/2;
    let e2 = 0;

    while (true) {
        if (x0 != a.x || y0 != a.y) {
            let coord = new Vector2(x0, y0);

            coords.push(coord);
        }

        if ((x0==x1 && y0==y1) || (bound_rect && !in_rect(bound_rect.tl, bound_rect.br, new Vector2(x0, y0)))) {
            //coords.push(b);
            return coords;
        }

        e2 = err;
        if (e2 >-dx) { err -= dy; x0 += sx; }
        if (e2 < dy) { err += dx; y0 += sy; }
    }
}

function random_int(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

function lerp(from, to, amt, round=false) {
    let diff = to - from;

    if (round) {
        return Math.round(from + (diff * amt));
    } else {
        return from + (diff * amt);
    }
}
