function write_pixel_to_imagedata(imagedata, x, y, rgba) {
    let idx = (imagedata.width * y) + (x);
    idx *= 4;

    for (let i=0; i<4; i++) {
        imagedata.data[idx+i] = rgba.data[i];
    }
}

function write_rect_to_imagedata(imagedata, tl, br, rgba) {
    for (let y=tl.y; y<br.y; y++) {
        for (let x=tl.x; x<br.x; x++) {
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

function write_rotated_image(canvas, ctx, x, y, image, w, h, angle_rad) {
    var width = image.width;
    var height = image.height;

    ctx.translate(x, y);
    ctx.rotate(angle_rad);
    ctx.drawImage(image, -w / 2, -h / 2, w, h);
    ctx.rotate(-angle_rad);
    ctx.translate(-x, -y);
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
