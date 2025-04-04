const LOADSPEED = 2;
const LOADASPEED_ICONS = 0.3;

function load_eterna(ignore_login) {
    // Animate the background image
    if (ignore_login) {
        document.body.style.backgroundColor = "#00807F";
    } else {
        setTimeout(function() {
            document.body.style.backgroundColor = "#00202F";
        }, 1800 / LOADSPEED);
    
        setTimeout(function() {
            document.body.style.backgroundColor = "#00404F";
        }, 2400 / LOADSPEED);
    
        setTimeout(function() {
            document.body.style.backgroundColor = "#00807F";
        }, 3200 / LOADSPEED);   
    }

    setTimeout(function() {
        if (!ignore_login) {
            start_process("login", {lock_user: "paul.w", lock_pass: "you shouldn't be looking here :-)"}, ctx.user);
        }
    }, 4000 / LOADSPEED);
}

function load_icons() {
    // Disable "loginform-button" button
    document.getElementById("loginform-button").disabled = true;

    // Make "loginform" invisible
    setTimeout(function() {
        document.getElementById("loginform").style.display = "none";
    }, 200 / LOADSPEED);

    // play opening sound (we allowed sound with the click so we can just play it)
    setTimeout(function() {
        var audio = new Audio('audio/startup.mp3');
        audio.play();
    }, 1400 / LOADSPEED);

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
                }, time_waited / (LOADSPEED * LOADASPEED_ICONS));
            };

            f(i);
        }
    }, 1700 / LOADSPEED);
}
