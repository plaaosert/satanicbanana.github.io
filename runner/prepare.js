document.addEventListener("DOMContentLoaded", function() {
    var input = document.getElementById("file_load_input");
    input.addEventListener("change", function(e) { process_file_to_level(e, game_container) });
});