function load_eterna() {
    // Animate the background image
    setTimeout(function() {
        document.body.style.backgroundColor = "#00202F";
    }, 1800);

    setTimeout(function() {
        document.body.style.backgroundColor = "#00404F";
    }, 2400);

    setTimeout(function() {
        document.body.style.backgroundColor = "#00807F";
    }, 3200);

    setTimeout(function() {
        // Make "loginform" visible
        document.getElementById("loginform").style.visibility = "visible";
    }, 4000);
}

function load_icons() {
    // Disable "loginform-button" button
    document.getElementById("loginform-button").disabled = true;

    // Make "loginform" invisible
    setTimeout(function() {
        document.getElementById("loginform").style.display = "none";
    }, 200);

    // play opening sound (we allowed sound with the click so we can just play it)
    setTimeout(function() {
        var audio = new Audio('eterna/audio/startup.mp3');
        audio.play();
    }, 1400);

    setTimeout(function() {
        // make all the icons visible, loading each one in turn with a random interval between
        var num_icons = document.getElementsByClassName("icon").length;

        var time_waited = 0;
        for (var i = 0; i < num_icons; i++) {
            f = function(t) {
                var icon = document.getElementById("icon-" + i);

                time_waited += Math.random() * 750;

                setTimeout(function() {
                    icon.style.visibility = "visible";
                }, time_waited);
            };

            f(i);
        }
    }, 1700);
}

load_eterna();