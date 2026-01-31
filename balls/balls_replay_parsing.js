let selectable_balls = [
    ...main_selectable_balls,
    ...additional_selectable_balls,
    ...powered_selectable_balls
]

let category_to_balls_list = {
    [CATEGORIES.STANDARD]: main_selectable_balls,
    [CATEGORIES.SILLY]: additional_selectable_balls,
    [CATEGORIES.POWERED]: powered_selectable_balls,
}

function parse_replay(replay_as_text) {
    let replay_url = null;
    try {
        replay_url = new URL(replay_as_text);
    } catch {};

    let replay_text = replay_as_text;
    if (replay_url) {
        replay_text = new URLSearchParams(replay_url.search).get("r");
        if (!replay_text) {
            throw Error("Replay looks like a URL but doesn't have the necessary 'r' parameter");
        }
    }
    let replay = JSON.parse(atob(replay_text));

    // then decompress if necessary
    // only compressed replays will have the "b" variable
    if (replay.b) {
        replay = decompress_replay(replay);
    }

    // balls might be collapsed
    replay.balls = replay.balls.map(b => {
        if (!b)
            return;

        if (!b.endsWith("Ball") && b != "SmartLongsword" && b != "RailgunIfItLockedIn" /* don't ever make that mistake again */) {
            let idx = b.slice(1);

            let list = REPLAY_BALLS_LISTS[b.charCodeAt(0)-65];
            return list[idx].name;
        } else {
            return b;
        }
    })

    if (!(replay.framespeed && replay.seed && replay.balls)) {
        throw Error("Replay doesn't have all necessary fields!");
    }

    if (typeof GAME_VERSION !== "undefined") {
        if (replay.game_version != GAME_VERSION) {
            if (replay.game_version == undefined) {
                alert(
                    `This replay doesn't match the current game version (expected ${GAME_VERSION}, got ${replay.game_version})\n\nLooks like this is either a VERY old replay or it's broken... unfortunately, there's nothing I can do for you here :(`
                )
                throw Error("Replay version is bad");
            } else {
                let ver = replay.game_version.match(/(\d{2}\/\d{2}\/\d{4})/gm);

                if (ver) {
                    let result = confirm(
                        `This replay doesn't match the current game version (expected ${GAME_VERSION}, got ${replay.game_version})\n\nAttempt to redirect to an archive version matching this version? ("Cancel" will cancel loading replay.)`
                    )

                    if (result) {
                        let base = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
                        window.location.href = `${base}/old_versions/${ver[0].replaceAll("/", "_")}/index.html?r=${replay_as_text}`;
                    } else {
                        throw Error("User rejected archive redirect");
                    }
                } else {
                    alert(
                        `This replay doesn't match the current game version (expected ${GAME_VERSION}, got ${replay.game_version})\n\nLooks like this is a broken replay... unfortunately, there's nothing I can do for you here :(`
                    )
                    throw Error("Replay version is bad");
                }
            }
        }
    }

    return replay;
}