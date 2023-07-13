function engage() {
	glitch_enabled = false;

    // set the "// plaaosert //" banner to just show "// //"
    var banner = document.getElementById("banner");
    banner.textContent = "// //";

    // select elements with the "destructible" class and randomly destroy them one by one, with a random delay each time
    var destructibles = document.getElementsByClassName("destructible");
    for (var i = 0; i < destructibles.length; i++) {
        // because we're in a for loop, use a closure
        (function(i) {
            setTimeout(function() {
                destructibles[i].style.display = "none";
            }, 500 + Math.random() * 4000);
        }
        )(i);
    }

    // after 3 seconds, delete the ocean
    setTimeout(function() {
        // select all elements with the "canvas" class and delete them all
        var ocean_destructibles = document.getElementsByClassName("canvas");
        for (var j = 0; j < ocean_destructibles.length; j++) {
            ocean_destructibles[j].style.display = "none";
        }
    }, 5000);

    // after 4 seconds, delete the banner
    setTimeout(function() {
        banner.style.display = "none";
    }, 6000);

    // after 5 seconds, change the page to boot/bootscr.html
    setTimeout(function() {
        window.location.href = "boot/bootscr.html";
    }, 7000);

    // set corrupt interval
    setTimeout(corrupt, Math.random() * 50)
}


corrupt_alphabet = "`1234567890-=¬!\"£$%^&*()_+wertyuiop[]QWERTYUIOP{}asdfghjkl;'#ASDFGHJKL:@~\\zxcvbnm,./|ZXCVBNM<>?▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░"
timeout = 100


function corrupt() {
    var destructibles = document.getElementsByClassName("destructible");
    for (var i = 0; i < destructibles.length; i++) {
        if (Math.random() < 0.25) {
            let old_str = destructibles[i].textContent;

            let new_str = Array.from(old_str).map(t => Math.random() < 0.05 ? corrupt_alphabet[Math.floor(Math.random() * corrupt_alphabet.length)] : t).join("")

            destructibles[i].textContent = new_str;
        }
    }

    setTimeout(corrupt, Math.random() * timeout)
    timeout -= 1
    mutation_add += 0.0007
}
