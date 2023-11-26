let pocket_display_markup = new EternaDisplayMarkupContainer(
    "Pocket", [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "game_area",
                0, 0, "100%", "100%", {
                    backgroundColor: "#71413b"
                }, false
            ), []
        )
    ]
)

let default_pocket_kernel = new EternaProcessKernel(
    pocket_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        data.setup_needed = true;
        data.game_state = "game";  // eventually this will be menu

        return {endnow: false}
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return true;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        if (data.setup_needed) {
            data.set_content_size(new Vector2(704, 448+256));
        }

        return data;
    },

    // paint
    function(data) {
        let paint_data = {};

        if (data.setup_needed) {
            data.setup_needed = false;

            // erase everything and rebuild it based on the state
            paint_data.removals = ["game_area"];

            // we're going to create everything we need for the specific state;
            // so even if we don't use all the balls in a level we're going to spawn them all right now.
            // if they're not used, we just place them offscreen
            switch (data.game_state) {
                case "menu":
                    break;
                
                case "game":
                    // flat "00"oh
                    // corner "1X" [0-3]
                    // side pocket "2X"
                    // corner connector 3
                    // side 4
                    // if "h", flip horizontally, if "v", flip vertically, if "d", flip both, if "n", flip none

                    // 11x7 tiles
                    let tiles = [
                        ["10n", "31v", "41n", "41n", "41n", "21n", "41n", "41n", "41n", "31n", "11n"],
                        ["30n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "32v"],
                        ["40n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "42n"],
                        ["40n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "42n"],
                        ["40n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "42n"],
                        ["30v", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "00n", "32n"],
                        ["13n", "33n", "43n", "43n", "43n", "23n", "43n", "43n", "43n", "33v", "12n"],
                    ]

                    // TODO should be eterna paths, find a way to batch create a lot of base64 because there's a lot of sprites
                    let tile_sources = [
                        "sprites/game/pocket/tiles/center_tile.png",
                        "sprites/game/pocket/tiles/corner_pocket_tile.png",
                        "sprites/game/pocket/tiles/side_pocket_tile.png",
                        "sprites/game/pocket/tiles/corner_connector_tile.png",
                        "sprites/game/pocket/tiles/side_tile.png"
                    ]

                    let tile_objs = [];
                    for (let x=0; x<tiles[0].length; x++) {
                        for (let y=0; y<tiles.length; y++) {
                            let ct = tiles[y][x];
                            tile_objs.push(EternaDisplayObject.image(
                                `tile_${x}_${y}`, tile_sources[ct[0]],
                                x*64, y*64, 64, 64, {
                                    transform: `rotate(${Number.parseInt(ct[1]) * 90}deg) scaleX(${ct[2] == "h" || ct[2] == "d" ? -1 : 1}) scaleY(${ct[2] == "v" || ct[2] == "d" ? -1 : 1})`
                                }, false
                            ))
                        }
                    }

                    let ball_positions = [
                        [144+80, 212],    // 1

                        [144+60, 212-12], // 2
                        [144+60, 212+12], // 3

                        [144+40, 212-24], // 4
                        [144+40, 212],    // 5
                        [144+40, 212+24], // 6

                        [144+20, 212-36], // 7
                        [144+20, 212-12], // 8
                        [144+20, 212+12], // 9
                        [144+20, 212+36], // 10

                        [144, 212-48], // 11
                        [144, 212-24], // 12
                        [144, 212],    // 13
                        [144, 212+24], // 14
                        [144, 212+48]  // 15
                    ]

                    paint_data.additions = new EternaDisplayMarkupElement(
                        EternaDisplayObject.div(
                            "game_area",
                            0, 0, 704, 448+256, {
                                backgroundColor: "#71413b" 
                            }, true
                        ), [
                            ...tile_objs,

                            // should be randomised when we get to the actual game but place them in order here
                            ...ball_positions.flatMap((m,i) => {
                                return [
                                    EternaDisplayObject.image(
                                        `ball_${i}`, `sprites/game/pocket/balls/ball_${i % 8}.png`,
                                        ...m, 24, 24, {}, false
                                    ),

                                    EternaDisplayObject.image(
                                        `ball_${i}_overlay`, `sprites/game/pocket/balls/overlay/solid_ball_rotation_overlay_0.png`,
                                        ...m, 24, 24, {}, false
                                    ),

                                    EternaDisplayObject.image(
                                        `ball_${i}_overlay_alt`, `sprites/game/pocket/balls/overlay/striped_ball_rotation_overlay_0.png`,
                                        ...m, 24, 24, {
                                            visibility: i < 8 ? "hidden" : "visible"
                                        }, false
                                    ),
                                ]
                            }),

                            EternaDisplayObject.image(
                                `ball_cue`, `sprites/game/pocket/balls/ball_8.png`,
                                496, 212, 24, 24, {}, false
                            )
                        ]
                    ).to_initial_paint();
                    break;
            }
        }

        return paint_data;
    },

    {
        // prefs (disallow_resize, disallow_move, always_on_top, ...)
        disallow_resize: true
    }
)