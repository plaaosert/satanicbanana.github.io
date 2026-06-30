let audios_list = [
    // ["example", 'woof.wav'],

    // bfxr by me
    ["pick_hit1", "pick_hit1.wav"],
    ["pick_hit2", "pick_hit2.wav"],
    ["pick_hit3", "pick_hit3.wav"],
    ["pick_hit4", "pick_hit4.wav"],
    
    ["block_destroy1", "block_destroy1.wav"],
    ["block_destroy2", "block_destroy2.wav"],
    ["block_destroy3", "block_destroy3.wav"],
    ["block_destroy4", "block_destroy4.wav"],

    // i wish i knew
    ["generic_kaching", "generic-ka-ching.mp3"],

    // https://dova-s.jp/se/detail/670
    ["system_decision_sound3", "system_decision_sound3.mp3"],
]

if (new URLSearchParams(window.location.search).get("noaudio") == "true") {
    audios_list = [];
}