game_id = "pletris";

// pletris is very moddable. the only things that are fixed are:
/*
- canvas size. it's always a 640x480 grid of 16x16 tiles (40x30), scaled up by 2x in most cases (scale factor can be 1, 2 or 4 though)
- keybinds. the pletris core uses a set of (rebindable) keybinds which map to virtual ingame buttons.
- basic control flow. if there is not a piece, the core will call spawn_piece(). if button A is pressed, the core will call key_down(A). 
  mods can keep their own state, though, since the object is reloaded every restart.
*/

// generally, a mod is loaded on top of another gamemode "template" - usually "basic". Otherwise, it needs to implement everything "basic" does to be a functional mod.
// load order dictates overriding, which can be either:
// - replace (replace the old function)
// - prefix (do new function BEFORE previously constructed function)
// - suffix (do new function AFTER previously constructed function)

// Information from all mods is stored after loading. Mods can call other mods' functions by asking the core to do it.
// The core will handle lookup of the mod, including letting the function know if that mod isn't loaded.

class PletrisCore {
    constructor() {
        this.reset_mods();

        this.renderer = new PletrisRenderer(new Vector2(40, 30), 16);
    }

    reset_mods() {
        this.mods = [];
        this.keybinds = {
            [PletrisKeybind.UP]: "ArrowUp",
            [PletrisKeybind.DOWN]: "ArrowDown",
            [PletrisKeybind.LEFT]: "ArrowLeft",
            [PletrisKeybind.RIGHT]: "ArrowRight",

            [PletrisKeybind.A]: "KeyZ",
            [PletrisKeybind.B]: "KeyX",
            [PletrisKeybind.C]: "KeyC",
            [PletrisKeybind.D]: "KeyA",
            [PletrisKeybind.E]: "KeyS",
            [PletrisKeybind.F]: "KeyD"
        }

        this.board = []
        this.exposed_variables = ["das", "arr"];
        this.variables = {
            "das": DEFAULT_DAS,
            "arr": DEFAULT_ARR,
            "board_x": 0,
            "board_y": 0
        }

        this.active_piece = {
            structure: null,  // list of {offset, blockskin}. the offset is based around an origin of 0
            pos: new Vector2(0, 0)
        }

        this.mod_functions = {
            "on_game_start": null,              // (this, {}) Called once when the game starts (after the user selects variables)
            "on_piece_ready_to_spawn": null,    // (this, {}) Called every frame where there is no currently active piece in the matrix.
            "on_piece_spawned": null,           // (this, {piece) Called after a piece is spawned.
            "on_piece_lock": null,              // (this, {piece) Called once when a piece locks, before it enters the board.
            "on_piece_move": null,              // (this, {piece, pos_delta}) Called once when a piece moves in any direction.
            "on_piece_rotate": null,            // (this, {piece, rotation_degrees}) Called once when a piece rotates in either direction.
            "on_frame": null,                   // (this, {}) Called once per frame.
            "do_spawn_piece": null,             // (this, {}) Called to spawn a new piece.
            "do_move_piece": null,              // (this, {}) Called to move a piece.
            "do_lock_piece": null,              // (this, {}) Called to lock a piece.
            "do_rotate_piece": null,            // (this, {rotation_degrees}) Called to rotate a piece.
            "on_board_change": null,            // (this, {})
            "": null,
            "": null,
            "": null,
            "": null
        }
    }

    load_mod(mod) {

    }

    setup_board(size_x, size_y) {
        this.board = [];
        for (let x=0; x<size_x; x++) {
            let a = [];
            this.board.push(a);
            for (let y=0; y<size_y; y++) {
                a.push(null);
            }
        }

        this.variables.board_x = size_x;
        this.variables.board_y = size_y;
    }

    position_valid(pos) {
        return pos.x >= 0 &&
               pos.x < this.variables.board_x &&
               pos.y >= 0 &&
               pos.y < this.variables.board_y
    }

    get_pos(pos) {
        return this.board[pos.x][pos.y];
    }

    set_pos(pos, to) {
        this.board[pos.x][pos.y] = to;
    }

    lock_active_piece_to_board(do_not_remove_active_piece=false) {
        this.active_piece.structure.forEach(block => {
            let pos = this.active_piece.pos.add(block.offset).round();
            this.set_pos(pos, {blockskin: block.blockskin});
        })

        if (!do_not_remove_active_piece) {
            this.active_piece = null;
        }
    }
}

function handle_resize(event, game_container, renderer, core) {
    // scale font size such that dimensions.x/y characters fit
    let vn_factor = 100;
    let font_upper_scale = 1;

    // remember x size coverage is half because the font is 8x16
    // we also want to make sure it isnt way too big...
    let fontsize_x = font_upper_scale * vw(vn_factor) / renderer.dimensions.x;

    // if screen is very long, the font might be too big.
    // need to check for the smallest allowed font in both directions and pick the minimum
    let fontsize_y = font_upper_scale * vh(vn_factor) / renderer.dimensions.y;

    fontsize = Math.min(fontsize_x, fontsize_y);

    // intervals of 16
    let fontsize_round = Math.floor(fontsize / 16) * 16;

    renderer.reset(game_container);
    renderer.setup(core, game_container, Math.floor(fontsize_round / 16));

    let font_cvr_x = renderer.dimensions.x * fontsize_round;
    let font_cvr_y = renderer.dimensions.y * fontsize_round;

    game_container.style.left = ((vw(100) - font_cvr_x)/2) + "px";
    game_container.style.top = (94 + (vh(100) - font_cvr_y)/2) + "px";
}

document.addEventListener("DOMContentLoaded", function() {
    let game_core = new PletrisCore();
    let game_container = document.getElementById("game-container");
    game_core.renderer.setup(game_core, game_container);

    window.addEventListener("resize", function(e) {
        handle_resize(e, game_container, game_core.renderer, game_core)
    })

    handle_resize(null, game_container, game_core.renderer, game_core)

    game_core.renderer.draw_string("crayon", new Vector2(0, 0), "Hello chat!");

    game_core.renderer.draw_block("paperclip", 3, new Vector2(14, 14));

    game_core.renderer.draw_blocks("paperclip", [
        {col: 4, pos: new Vector2(20, 20)},
        {col: 4, pos: new Vector2(21, 20)},
        {col: 4, pos: new Vector2(19, 20)},
        {col: 4, pos: new Vector2(20, 19)},
        {col: 0, pos: new Vector2(20, 21)}
    ])
})