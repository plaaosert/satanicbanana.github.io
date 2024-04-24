class PletrisRenderer {
    constructor(dimensions, tile_size) {
        this.dimensions = dimensions;

        this.tile_size_base = tile_size;
        this.tile_size = tile_size;

        this.background_img = null;

        this.tiles = [];
    }

    reset(parent_element) {
        parent_element.innerHTML = ""
    }

    setup(core, parent_element, scale_factor) {
        this.tile_size = this.tile_size_base * scale_factor;

        let background_img = document.createElement("img");
        background_img.classList.add("game-background");
        background_img.src = "img/blank.png";

        background_img.style.width = `${this.tile_size * this.dimensions.x}px`;
        background_img.style.height = `${this.tile_size * this.dimensions.y}px`;

        this.background_img = background_img;

        parent_element.appendChild(background_img);

        this.tiles = [];
        for (let x=0; x<this.dimensions.x; x++) {
            this.tiles.push([])
            for (let y=0; y<this.dimensions.y; y++) {
                let c = document.createElement("img");

                c.src = "img/blank.png";
                c.classList.add("gamepixel");

                c.style.height = this.tile_size + "px";
                c.style.width = this.tile_size + "px";

                c.style.top = `${y*this.tile_size}px`;
                c.style.left = `${x*this.tile_size}px`;

                let flattened_id = (y * this.dimensions.x) + x;
                c.addEventListener("mouseover", (event) => {
                    core.trigger_event("on_mouse_over", {event: event, flattened_id: flattened_id});
                })

                c.addEventListener("mousedown", (event) => {
                    core.trigger_event("on_mouse_down", {event: event, flattened_id: flattened_id});
                })

                c.addEventListener("mouseup", (event) => {
                    core.trigger_event("on_mouse_up", {event: event, flattened_id: flattened_id});
                })

                c.addEventListener("click", (event) => {
                    core.trigger_event("on_mouse_click", {event: event, flattened_id: flattened_id});
                })

                parent_element.appendChild(c);

                this.tiles[x].push(c)
            }
        }
    }

    position_valid(x, y) {
        return x >= 0 &&
               x < this.dimensions.x &&
               y >= 0 &&
               y < this.dimensions.y
    }

    get_tile(x, y) {
        if (this.position_valid(x, y)) {
            return this.tiles[x][y]
        }

        return null;
    }

    set_tile_img(x, y, to) {
        let tile = this.get_tile(x, y);
        if (tile) {
            tile.src = to;
        }
    }

    draw_string(font, start_pos, str) {
        let cpos = start_pos.copy();
        for (let i=0; i<str.length; i++) {
            let path = get_indexed_filename(`img/font/${font}/`, str.charCodeAt(i)-1);
            this.set_tile_img(cpos.x, cpos.y, path);
            cpos = cpos.add(new Vector2(1, 0));
        }
    }

    draw_block(blockskin, col, pos) {
        let path = get_indexed_filename(`img/spr/blockskins/${blockskin}/`, col);
        this.set_tile_img(pos.x, pos.y, path);
    }

    draw_blocks(blockskin, data) {
        data.forEach(d => {
            this.draw_block(blockskin, d.col, d.pos);
        })
    }
}