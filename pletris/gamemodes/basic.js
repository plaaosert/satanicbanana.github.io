/*
Everything you need to make pletris work; 7bag, SRS, DAS/ARR exposed as an option, levelups per 10 lines cleared, score, etc.
*/
function make_tetromino(game, block_id, blockskin) {
    // Z L O S I J T
    let template = game.get_variable("piece_selection")[block_id]

    return {
        structure: template.structure.map(t => t.blockskin = blockskin),
        pos: new Vector2(0, 0),
        rotation: 0,
        rotation_origin_offset: template.rotation_origin_offset
    }
}

function make_random_bag(game) {
    let new_arr = shuffle(game.get_variable("piece_selection"));

    return new_arr;
}

mod = {
    variables: {
        "piece_selection": [
            {
                structure: [
                    {offset: new Vector2(-1, 1), blockskin: null, col: 0},
                    {offset: new Vector2(0, 1), blockskin: null, col: 0},
                    {offset: new Vector2(0, 0), blockskin: null, col: 0},
                    {offset: new Vector2(1, 0), blockskin: null, col: 0}
                ],
                rotation_origin_offset: new Vector2(0, 0)
            },

            {
                structure: [
                    {offset: new Vector2(1, 1), blockskin: null, col: 1},
                    {offset: new Vector2(-1, 0), blockskin: null, col: 1},
                    {offset: new Vector2(0, 0), blockskin: null, col: 1},
                    {offset: new Vector2(1, 0), blockskin: null, col: 1}
                ],
                rotation_origin_offset: new Vector2(0, 0)
            },

            {
                structure: [
                    {offset: new Vector2(-1, 1), blockskin: null, col: 2},
                    {offset: new Vector2(0, 1), blockskin: null, col: 2},
                    {offset: new Vector2(-1, 0), blockskin: null, col: 2},
                    {offset: new Vector2(0, 0), blockskin: null, col: 2}
                ],
                rotation_origin_offset: new Vector2(-0.5, -0.5)
            },

            {
                structure: [
                    {offset: new Vector2(0, 1), blockskin: null, col: 3},
                    {offset: new Vector2(1, 1), blockskin: null, col: 3},
                    {offset: new Vector2(-1, 0), blockskin: null, col: 3},
                    {offset: new Vector2(0, 0), blockskin: null, col: 3}
                ],
                rotation_origin_offset: new Vector2(0, 0)
            },

            {
                structure: [
                    {offset: new Vector2(-2, 0), blockskin: null, col: 4},
                    {offset: new Vector2(-1, 0), blockskin: null, col: 4},
                    {offset: new Vector2(0, 0), blockskin: null, col: 4},
                    {offset: new Vector2(1, 0), blockskin: null, col: 4}
                ],
                rotation_origin_offset: new Vector2(0.5, 0.5)
            },

            {
                structure: [
                    {offset: new Vector2(1, 1), blockskin: null, col: 5},
                    {offset: new Vector2(-1, 0), blockskin: null, col: 5},
                    {offset: new Vector2(0, 0), blockskin: null, col: 5},
                    {offset: new Vector2(1, 0), blockskin: null, col: 5}
                ],
                rotation_origin_offset: new Vector2(0, 0)
            },

            {
                structure: [
                    {offset: new Vector2(0, 1), blockskin: null, col: 6},
                    {offset: new Vector2(-1, 0), blockskin: null, col: 6},
                    {offset: new Vector2(0, 0), blockskin: null, col: 6},
                    {offset: new Vector2(1, 0), blockskin: null, col: 6}
                ],
                rotation_origin_offset: new Vector2(0, 0)
            }
        ],
        "bag": null,
        "hold_piece": null,
        "num_next_pieces": 5,
        "score": 0,
        "level": 0,
        "lines": 0,
        "das": DEFAULT_DAS,
        "arr": DEFAULT_ARR,
        "blockskin": "paperclip",
        "font": "crayon",
        "board_x": 10,
        "board_y": 40,
        "spawn_x": 4,
        "spawn_y": 20,
        "are": 25,
        "clear_delay": 200,
        "delay_end_time": 0
    },

    exposed_variables: [
        {name: "level", min: 0, max: 20},
        {name: "das", min: 0, max: 500},
        {name: "arr", min: 0, max: 100},
        {name: "num_next_pieces", min: 0, max: 10},
    ],

    functions: [
        {
            name: "on_game_start", action: ModAction.SUFFIX, fn: function(game) {
                // Do something on game start!
                // Set up first bags (two total)
                let bag = [];

                bag.push(...make_random_bag(game));
                bag.push(...make_random_bag(game));
                
                game.set_variable("bag", bag)
            }
        },

        {
            name: "on_piece_ready_to_spawn", action: ModAction.SUFFIX, fn: function(game) {
                let delay_end_time = game.get_variable("delay_end_time");

                if (game.now >= delay_end_time) {
                    // delay over, ready to spawn piece
                    game.trigger_function("do_spawn_piece", {});
                }
            }
        },

        {
            name: "do_spawn_piece", action: ModAction.SUFFIX, fn: function(game) {
                let bag = game.get_variable("bag");
                let piece = bag.shift();

                game.set_active_piece(piece, new Vector2(
                    game.get_variable("spawn_x"),
                    game.get_variable("spawn_y")
                ));
            }
        }
    ]
}