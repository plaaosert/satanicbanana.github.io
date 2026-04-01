let audio = new Map();
let audio_context = new AudioContext();

// reduce the volume
let gain_node = audio_context.createGain();
gain_node.connect(audio_context.destination);
let gain = 0.1;
gain_node.gain.setValueAtTime(gain, audio_context.currentTime);

let audio_playing = [];
let music_audio = null;

function reset_audio_buffer() {
    audio_context.close();
    audio_context = new AudioContext();

    // reduce the volume
    gain_node = audio_context.createGain();
    gain_node.connect(audio_context.destination);
    gain = 0.1;
    gain_node.gain.setValueAtTime(gain, audio_context.currentTime);

    audio_playing = [];
    music_audio = null;
}

async function load_audio_item(path, lazy=false) {
    return await load_audio_from_url(`https://plaao.net/balls/${path}`, lazy);;
}

async function decode_audio(array_buffer) {
    return await audio_context.decodeAudioData(array_buffer);
}

async function load_audio_from_url(path, lazy=false) {
    let resp = await fetch(`${path}`);
    let array_buffer = await resp.arrayBuffer();

    if (lazy) {
        return array_buffer;
    } else {
        let audio_buffer = await decode_audio(array_buffer);

        return audio_buffer;
    }
}

async function load_audio() {
    audios_list.forEach(async snd => {
        if (snd[1].startsWith("https://")) {
            audio.set(snd[0], [await load_audio_from_url(snd[1], snd[4]), snd[2], snd[3], snd[4]])
        } else {
            audio.set(snd[0], [await load_audio_item(snd[1], snd[4]), snd[2], snd[3], snd[4]])
        }
    })
}

async function prepare_lazy_audio(name) {
    let audio_content = audio.get(name);
    if (!audio_content || !audio_content[3]) {
        // not lazy, just return
        return;
    }

    let buffer = await decode_audio(audio_content[0])

    // update to buffer and set to non-lazy
    audio_content[0] = buffer;
    audio_content[3] = false;
}

function stop_music() {
    if (music_audio && music_audio[0]) {
        music_audio[0].source.stop();
    }

    document.querySelector("#loading_prompt").classList.add("hidden")
}

async function play_music(name, gain=null) {
    stop_music();

    if (muted)
        return;

    let played_music = await play_audio(name, gain);
    if (played_music !== null) {
        music_audio = [audio_playing[played_music], audio.get(name)[1], audio.get(name)[2], name];

        document.querySelector("#loading_prompt").textContent = `♪ - ${music_audio[1]} - ${music_audio[2]}`
        document.querySelector("#loading_prompt").classList.remove("hidden");
    }
}

function play_audio_data(buffer_content, gain=null) {
    let source = audio_context.createBufferSource();

    source.buffer = buffer_content;

    let mod_node = gain_node;

    if (gain) {
        let new_gain_node = audio_context.createGain();
        new_gain_node.connect(audio_context.destination);
        new_gain_node.gain.setValueAtTime(gain, audio_context.currentTime);

        mod_node = new_gain_node;
    }

    source.connect(mod_node);

    let obj = {source: source, ended: false}
    source.addEventListener("ended", () => obj.ended = true);
    audio_playing.push(obj);

    source.start();

    return audio_playing.length - 1;
}

async function play_audio(name, gain=null) {
    // this may end up needing to fetch the audio data if it isn't preloaded
    // in that case, finish loading and set up the promise to play once decoded
    if (muted)
        return;
    
    let audio_content = audio.get(name);
    if (audio_content) {
        // this could either be a full source or base response
        let idx = null;
        if (audio_content[3]) {
            // lazy and not loaded; load it now
            await prepare_lazy_audio(name);
        }

        if (!audio_content[3]) {
            idx = play_audio_data(audio_content[0], gain);
        } else {
            // for some reason it didn't load. log and don't play
            console.log(`Audio ${name} didn't load on demand for some reason`);
        }

        return idx;
    } else {
        // Tried to play a nonexistent sound. Print to console and return null
        console.log(`Tried to play nonexistent sound ${name}!`);
        return null;
    }

    // console.log(`played sound ${name}`);
}