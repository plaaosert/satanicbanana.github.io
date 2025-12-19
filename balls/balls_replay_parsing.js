let selectable_balls = [
    ...main_selectable_balls,
    ...additional_selectable_balls
]

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

    if (!(replay.framespeed && replay.seed && replay.balls)) {
        throw Error("Replay doesn't have all necessary fields!");
    }

    if (typeof GAME_VERSION !== "undefined") {
        if (replay.game_version != GAME_VERSION) {
            alert(`This replay doesn't match the current game version (expected ${GAME_VERSION}, got ${replay.game_version})\n\nIt might still be fine, but it might also desync and be completely wrong. Who can tell?!\n\n(Maybe one day I'll have a better solution here...)`)
        }
    }

    return replay;
}