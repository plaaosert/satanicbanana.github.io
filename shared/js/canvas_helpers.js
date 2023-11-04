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