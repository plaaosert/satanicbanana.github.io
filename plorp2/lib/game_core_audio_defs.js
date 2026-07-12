let audios_list = [
    // ["example", 'woof.wav'],

    // bfxr by me
    ["pick_hit1", "pick_hit1.wav"],
    ["pick_hit2", "pick_hit2.wav"],
    ["pick_hit3", "pick_hit3.wav"],
    ["pick_hit4", "pick_hit4.wav"],

    ["pick_crit1", "pick_crit1.mp3"],
    ["pick_crit2", "pick_crit2.mp3"],
    ["pick_crit3", "pick_crit3.mp3"],
    ["pick_crit4", "pick_crit4.mp3"],
    
    ["block_destroy1", "block_destroy1.wav"],
    ["block_destroy2", "block_destroy2.wav"],
    ["block_destroy3", "block_destroy3.wav"],
    ["block_destroy4", "block_destroy4.wav"],

    ["block_destroy_reverse", "block_destroy_reverse.mp3?v=01"],

    ["bomb_beep", "bomb_beep.wav"],

    ["ascension", "ascension.mp3"],

    // https://soundeffects.fandom.com/wiki/Sound_Ideas,_SPLAT,_CARTOON_-_PIE_IN_FACE_SPLAT
    ["splort", "splort.mp3"],

    // i wish i knew
    ["generic_kaching", "generic-ka-ching.mp3"],

    // https://dova-s.jp/se/detail/670
    ["system_decision_sound3", "system_decision_sound3.mp3"],

    // https://pixabay.com/sound-effects/film-special-effects-metallic-cling1-105303/
    ["clink", "clink.mp3"],

    // https://dova-s.jp/se/detail/1486/track/2 (edited)
    ["automove_confirm", "automove_confirm.mp3"],
    
    // https://dova-s.jp/se/detail/1479
    ["automove_cancel", "automove_cancel.mp3"],
]

if (new URLSearchParams(window.location.search).get("noaudio") == "true") {
    audios_list = [];
}