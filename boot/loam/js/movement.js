function in_bounds(x, y) {
    // each row has (x_len - (2 * y)) triangles in it
    var row_len = x_len - (2 * y);

    return y >= 0 && y < y_len && x >= 0 && x < row_len
}

function get_adjacent(x, y) {
    // if even, third y offset is -1. if odd, +1.
    var adjacents = [];

    if (in_bounds(x - 1, y)) {
        adjacents.push([x - 1, y]);
    }

    if (in_bounds(x + 1, y)) {
        adjacents.push([x + 1, y]);
    }

    var y_offset = x % 2 == 0 ? -1 : 1;
    if (in_bounds(x - y_offset, y + y_offset)) {
        adjacents.push([x - y_offset, y + y_offset]);
    }

    return adjacents;
}

// TODO once you finish an actual class for the player, remove this shit
function move(x, y) {
    player.position.x += x;
    player.position.y += y;
}

function goto(x, y) {
    player.position.x = x;
    player.position.y = y;
}

player = {
    "position": {
        "x": 0,
        "y": 0
    }
}
