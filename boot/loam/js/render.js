adjacency_triangle_controls = {
    "adjacency-triangle-1": undefined,
    "adjacency-triangle-2": undefined,
    "adjacency-triangle-3": undefined
}

function click_adjacency_triangle(tid) {
    var a = adjacency_triangle_controls[tid];

    player.position.x = a[0];
    player.position.y = a[1];
    position_triangles(player);
}

function game_to_canvas_pos(x, y) {
    // return x, y, flip
    var xt = 5 + canvas_clearance + (canvas_tri_width * x * 0.5) + (canvas_tri_width * y * 0.5);
    var yt = canvas_y - canvas_clearance - 18 - (canvas_tri_height * y);
    
    var flip = false;
    if (x % 2 == 1) {
        flip = true;
    }

    return {
        "x": Math.floor(xt),
        "y": Math.floor(yt),
        "flip": flip
    };
}

function position_triangles(player) {
    var selection_triangle = document.getElementById("selection-triangle");
    var adjacency_triangles = document.getElementsByClassName("adjacency-triangle");

    var position = player.position;
    var adjacents = get_adjacent(player.position.x, player.position.y);

    var selection_canvas_pos = game_to_canvas_pos(position.x, position.y);
    selection_triangle.style.left = selection_canvas_pos.x + "px";
    selection_triangle.style.top = selection_canvas_pos.y + "px";

    if (selection_canvas_pos.flip) {
        selection_triangle.src = "images/selection_rev.png";
    } else {
        selection_triangle.src = "images/selection.png";
    }

    for (var i=0; i<3; i++) {
        if (i < adjacents.length) {
            var selection_adj_pos = game_to_canvas_pos(adjacents[i][0], adjacents[i][1]);

            adjacency_triangles[i].style.display = "block";
            adjacency_triangles[i].style.left = selection_adj_pos.x + "px";
            adjacency_triangles[i].style.top = selection_adj_pos.y + "px";
        
            if (selection_adj_pos.flip) {
                adjacency_triangles[i].src = "images/selection_near_rev.png";
            } else {
                adjacency_triangles[i].src = "images/selection_near.png";
            }
            
            adjacency_triangle_controls[adjacency_triangles[i].id] = adjacents[i];
        } else {
            adjacency_triangles[i].style.display = "none";
        }
    }
}

// debug code
// this seems to be all working fine. finally, we need to work out setting up a battle from the beginning, then trying a simple fight in full.
// this should include battle logs which the *skills* manage mostly.
skill = new Skill("scrimblo skill", "it kills you", SkillTargeting.OneEnemy, (user, targets, battle) => null);
skill2 = new Skill("scrimblo skill 2", "it kills you more", SkillTargeting.Everyone, (user, targets, battle) => null);

template = new UnitTemplate("person", "i am small", "hello description", {
    hp: 1,
    atk: 1,
    def: 1,
    spd: 1,
    grow_speed: 1
}, {
    hp: 1,
    atk: 1,
    def: 1,
    spd: 1,
    grow_speed: 1
}, [
    skill, skill2
], []);

unit = new Unit(template, 1, "scrimblo individual 1", [skill, skill2]);
unit2 = new Unit(template, 1, "scrimblo individual 2", [skill, skill2]);
unit3 = new Unit(template, 1, "scrimblo individual 3", [skill, skill2]);
unit4 = new Unit(template, 2, "scrimblo individual 4", [skill, skill2]);
unit5 = new Unit(template, 2, "scrimblo individual 5", [skill, skill2]);
unit6 = new Unit(template, 2, "scrimblo individual 6", [skill, skill2]);

battle = {
    all_combatants: () => [
        unit,
        unit2,
        unit3,
        unit4,
        unit5,
        unit6
    ]
}

unit.battle = battle;
unit2.battle = battle;
unit3.battle = battle;
unit4.battle = battle;
unit5.battle = battle;
unit6.battle = battle;
