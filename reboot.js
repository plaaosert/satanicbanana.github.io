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
            }, 500 + Math.random() * 2000);
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
    }, 3000);

    // after 4 seconds, delete the banner
    setTimeout(function() {
        banner.style.display = "none";
    }, 4000);

    // after 5 seconds, change the page to boot/bootscr.html
    setTimeout(function() {
        window.location.href = "boot/bootscr.html";
    }, 5000);
}