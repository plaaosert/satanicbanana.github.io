let audios_list = [
    ["example", 'woof.wav']
]

if (new URLSearchParams(window.location.search).get("noaudio") == "true") {
    audios_list = [];
}