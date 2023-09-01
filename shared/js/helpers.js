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

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(arr) {
    return arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

const NumberFormat = {
    SCIENTIFIC: 0
}

function format_number(val, typ, max_val=1e9) {
    let method = typ ? typ : NumberFormat.SCIENTIFIC;

    switch (method) {
        case NumberFormat.SCIENTIFIC:
            if (val >= max_val && val > 0) {
                let magnitude = Math.log10(val);
                let digits = Math.floor(magnitude);
                
                let frac = Math.floor((val / Math.pow(10, digits)) * 100) / 100;
                
                return `${frac}e${digits}`;
            } else {
                return val.toLocaleString();
            }
            break;
    }
}
