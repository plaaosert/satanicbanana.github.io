class Generator {
    static GenType = {
        PATH: "Path",
        ROOM: "Room"
    }

    constructor(fn, generator_type, sockets_start) {
        this.fn = fn;
        this.generator_type = generator_type;
        this.sockets_start = sockets_start;    // what sockets the generator can build from
    }

    execute(board, socket, rules) {
        if (this.generator_type == Generator.GenType.PATH) {
            return this.fn(board, socket, random_int(rules.path_length_min, rules.path_length_max), rules.path_turn_chance)
        } else {
            return this.fn(board, socket, random_int(rules.room_size_min, rules.room_size_max), random_int(rules.room_size_min, rules.room_size_max))
        }
    }
}

class GenerationRules {
    constructor(room_size_min, room_size_max, path_length_min, path_length_max, path_turn_chance, rooms_min, rooms_max, generators) {
        this.room_size_min = room_size_min;
        this.room_size_max = room_size_max;
        this.path_length_min = path_length_min;
        this.path_length_max = path_length_max;
        this.path_turn_chance = path_turn_chance;

        this.rooms_min = rooms_min;
        this.rooms_max = rooms_max;

        this.generators = generators;
    }

    get_valid_generators(socket_typ) {
        return this.generators.filter(g => g.sockets_start.includes(socket_typ));
    }
}

/*
Most generators assume the following tilesets:

0  - void (impassable, blocks los, black, should never be seen by the player)
1  - basic wall
2  - wall variation
3  - wall variation 2
4  - destructible wall (fire)
5  - destructible wall (electricity)
6  - destructible wall (blast)
7  - wall, reserved
8  - wall, reserved
9  - wall, reserved
10 - basic floor
11 - floor variation
12 - floor variation 2
13 - grass, tall
14 - grass, furrowed
15 - burnt remains
16 - water
17 - floor, reserved
18 - floor, reserved
19 - floor, reserved
20 - door
21 - door, alt (not flammable)
22 - door, alt2 (not flammable)
23 - up stairs
24 - down stairs
25 - window 1  (anything which is impassable but doesn't block LOS)
26 - window 2
27 - window 3
*/

function generate(board, origin, rules) {
    // TODO clear the board

    let sockets_active = [
        {pos: origin, typ: 0, dir: new Vector2(0, 0)}
    ]

    let num_rooms = 0;
    let rooms_target = random_int(rules.rooms_min, rules.rooms_max);

    let candidate_exit_positions = [];

    while (sockets_active.length > 0) {
        let new_sockets = [];

        sockets_active.forEach(socket => {
            let valid_generators = rules.get_valid_generators(socket.typ);

            let generator = random_from_array(valid_generators);

            if (generator) {
                let info = generator.execute(board, socket, rules);

                if (generator.generator_type == Generator.GenType.ROOM) {
                    num_rooms++;

                    if (num_rooms <= rooms_target) {
                        new_sockets.push(...info.new_sockets);
                    }
                } else {
                    new_sockets.push(...info.new_sockets);
                }

                candidate_exit_positions.push(...info.exit_positions);
            }
        })

        sockets_active = new_sockets;
    }
}

function basic_starting_room(board, socket, room_size_x, room_size_y) {
    // same as below except will grow from an origin (the stairs into the level) rather than an edge, with at least 1 tile between the origin and a wall
    let origin = socket.pos;

    let siz_x = room_size_x;
    let siz_y = room_size_y;

    let tl = origin.sub(new Vector2(
        random_int(2, siz_x-2),
        random_int(2, siz_y-2)
    ));
    
    for (let xt=0; xt<siz_x; xt++) {
        for (let yt=0; yt<siz_y; yt++) {
            let is_on_side = xt==0 || xt==siz_x-1 || yt==0 || yt==siz_y-1

            board.set_tile(
                tl.add(new Vector2(xt, yt)), is_on_side ? 1 : 10
            )
        }
    }
    
    let num_doors = random_int(2, 4)
    let sockets = [];

    for (let i=0; i<num_doors; i++) {
        // randomly select a point. if it already has a feature (isn't a wall), pick again. max picks 10
        for (let t=0; t<10; t++) {
            let pos = Vector2.zero;
            let shifts = [];
            let dir = Vector2.zero;

            switch (random_int(0, 4)) {
                case 0:
                    pos = new Vector2(tl.x, random_int(tl.y+1, tl.y + siz_y - 1))
                    shifts = [new Vector2(0, -1), new Vector2(0, 1)]
                    dir = new Vector2(-1, 0)
                    break;

                case 1:
                    pos = new Vector2(tl.x + siz_x - 1, random_int(tl.y+1, tl.y + siz_y - 1))
                    shifts = [new Vector2(0, -1), new Vector2(0, 1)]
                    dir = new Vector2(1, 0)
                    break;

                case 2:
                    pos = new Vector2(random_int(tl.x+1, tl.x + siz_x - 1), tl.y)
                    shifts = [new Vector2(-1, 0), new Vector2(1, 0)]
                    dir = new Vector2(0, -1)
                    break;

                case 3:
                    pos = new Vector2(random_int(tl.x+1, tl.x + siz_x - 1), tl.y + siz_y - 1)
                    shifts = [new Vector2(-1, 0), new Vector2(1, 0)]
                    dir = new Vector2(0, 1)
                    break;
            }

            if (board.get_tile(pos).tile_id == 1 && board.get_tile(pos.add(shifts[0])).tile_id == 1 && board.get_tile(pos.add(shifts[1])).tile_id == 1) {
                board.set_tile(pos, 20);
                sockets.push({pos: pos, typ: 1, dir: dir})

                break;
            }
        }
    }

    return {
        new_sockets: sockets,
        exit_positions: []
    }
}

function basic_room(board, socket, room_size_x, room_size_y) {
    // rooms will grow from the origin (which is a door from a path) until they reach full size, avoiding collision if they can
    // (including by swapping size_x and size_y), but overlapping if collision can't be avoided
    // collision avoidance tries to prevent a gap of 1 tile or less between rooms (so, "#  #" is fine but "# #" or "##" is not)
    // rooms may have 1-4 doors, of which up to 2 can be on the same wall with at least 3 tile spacing
}

function basic_path(board, socket, path_length, turn_chance) {
    // paths can never turn back on themselves, only 90 degrees to either side
    // the direction of a path is based on the socket's direction (socket.direction)
    // they will terminate either at the end of path_length (making another socket) or if they run into another room (making no sockets)
    let dir = socket.dir;
    let original_dir = socket.dir;

    let pos = socket.pos;

    let new_sockets = [];

    let needs_new_door = true;
    for (let n=0; n<path_length; n++) {
        // doesnt check for collisions yet. soon...
        pos = pos.add(dir);

        for (let xt=-1; xt<2; xt++) {
            for (let yt=-1; yt<2; yt++) {
                let p = new Vector2(xt, yt);
                let pt = pos.add(p)
                if (board.get_tile(pt).tile_id == 0) {
                    board.set_tile(pt, 1)
                }
            }
        }

        board.set_tile(pos, 11);

        if (Math.random() < turn_chance) {
            if (dir.equals(original_dir)) {
                let r = (random_int(0, 2) * 2) - 1
                dir = new Vector2(dir.y * r, dir.x * r);
            } else {
                dir = original_dir
            }
        }
    }

    // at the end of the path, if it didn't collide already, add a door
    if (needs_new_door) {
        board.set_tile(pos, 20)
        new_sockets.push({
            pos: pos, dir: dir, typ: 2
        })
    }

    return {
        new_sockets: new_sockets,
        exit_positions: []
    }
}