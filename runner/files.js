// heavily uses code from https://github.com/rfrench/gify/blob/master/example.html
function process_file_to_level(e, game_container) {
    let file = e.target.files[0];
    let reader = new FileReader();

    // NEED TO MAKE THIS SUPPORT GIF TOO, CURRENTLY ONLY APNG
    reader.onload = function(event) {
        let blob = new Blob([event.target.result]);

        // this line might not be needed?
        window.URL = window.URL || window.webkitURL;

        let blob_url = window.URL.createObjectURL(blob);

        let image_obj = new Image();
        image_obj.src = blob_url;

        let level_data = [];
        let wall_col = null;

        image_obj.onload = function() {
            let result = UPNG.decode(reader.result);
            let info = UPNG.toRGBA8(result);

            let w = result.width;
            let h = result.height;
            
            let cx = 0;

            frames_raw = info.map(t => Array.from(new Uint8Array(t)))
            for (let i=0; i<frames_raw.length; i++) {
                let frame = [];
                let level_row = [];
                for (let fc=0; fc<frames_raw[i].length; fc+=4) {
                    let rgba = [frames_raw[i][fc], frames_raw[i][fc+1], frames_raw[i][fc+2], frames_raw[i][fc+3]]
                    if ((rgba[0] == 0 && rgba[1] == 0 && rgba[2] == 0) || rgba[3] == 0) {
                        level_row.push(0);
                    } else {
                        if (!wall_col) {
                            wall_col = new Colour(rgba[0], rgba[1], rgba[2]);
                        }

                        level_row.push(1);
                    }

                    cx++;

                    if (cx >= w) {
                        frame.push(level_row);
                        level_row = [];
                        cx = 0;
                    }
                }

                level_data.push(frame);
            }

            game_container.game = new Game();
            game_container.game.player = new Player();
            game_container.game.level = new Level(level_data, wall_col);
        }
    }

    reader.readAsArrayBuffer(file);
}