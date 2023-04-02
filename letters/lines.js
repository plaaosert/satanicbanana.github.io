/*
       11   10   9     
   +---O----O----O----+                        
   |012345678901234567|                        
0  O1                 O  8                     
   |2                 |                        
1  O3                 O  7                     
   |4                 |                        
2  O5                 O  6                     
   |6                 |                        
   +---O----O----O----+                        
       3    4    5    
*/

matrix_width = 18
matrix_height = 7
block_positions = [
    [-1, 1],
    [-1, 3],
    [-1, 5],
    [3, 7],
    [8, 7],
    [13, 7],
    [18, 5],
    [18, 3],
    [18, 1],
    [13, -1],
    [8, -1],
    [3, -1]
]

function draw_line(from, to) {
    // move from position from to position to. use that one line drawing algorithm to do that
    var coords = make_line_points(block_positions[from][0], block_positions[from][1], block_positions[to][0], block_positions[to][1]);
    return coords;
}

function combine_lines(coord_sets, mark_char="+") {
    var final_string = "";
    for (var y=0; y<matrix_height; y++) {
        for (var x=0; x<matrix_width; x++) {
            var check = [x, y];
            var marking = 0;
            var mark_level = 0;
            for (var i=coord_sets.length - 1; i>-1; i--) {
                let coord_set = coord_sets[i];
                mark_level++;

                if (coord_set.some(coord => coord[0] == check[0] && coord[1] == check[1])) {
                    marking = mark_level;
                    break;
                }
            }

            if (marking > 0) {
                final_string += mark_char.charAt(Math.min(mark_char.length - 1, marking - 1));
            } else {
                final_string += "\u00A0";
            }
        }

        final_string += "\n";
    }

    return final_string;
}

function draw_lines(line_points, mark_char="+") {
    var lines = [];
    for (var i=0; i<line_points.length; i++) {
        lines.push(draw_line(line_points[i][0], line_points[i][1]));
    }

    return combine_lines(lines, mark_char);
}

// http://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#C
function make_line_points(x0, y0, x1, y1) {
    var coords = [];
    var dx = Math.abs(x1-x0);
    var sx = x0<x1 ? 1 : -1;
    var dy = Math.abs(y1-y0);
    var sy = y0<y1 ? 1 : -1; 
    var err = (dx>dy ? dx : -dy)/2;
    var e2 = 0;

    while (true) {
        var coord = [x0, y0];
        coords.push(coord);

        if (x0==x1 && y0==y1) {
            return coords;
        }

        e2 = err;
        if (e2 >-dx) { err -= dy; x0 += sx; }
        if (e2 < dy) { err += dx; y0 += sy; }
    }
}