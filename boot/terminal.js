speedUp = false;

document.onkeydown = function(e) {
    if (e.key == "q") {
        speedUp = true;
    }
}

document.onkeyup = function(e) {
    if (e.key == "q") {
        speedUp = false;
    }
}

// the index of the current message
message_index = 0;

lines = [];

// set a timeout to print the current message, then increment the message index and wait for the next interval
// message prints are done by appending another span to the p element with id "boot-text"
function printMessage() {
    if (message_index >= messages.length) {
        printFinish();
        return;
    }

    var current_message = messages[message_index];

    current_message_text = current_message[0];
    current_message_colour = current_message[1];
    current_message_linetype = current_message[2];
    current_message_delay = current_message[3];

    var additional_delay = false;

    if (current_message_linetype == 0) {
        // replace the last line with this line
        lines[lines.length - 1].textContent = current_message_text;
        lines[lines.length - 1].style.color = current_message_colour;
    } else if (current_message_linetype == 1) {
        // add a newline to the previous line
        if (lines.length > 0) {
            lines[lines.length - 1].textContent += "\n";
        }

        // put this line on the new line
        var new_line = document.createElement("span");
        new_line.textContent = current_message_text;
        new_line.style.color = current_message_colour;
        document.getElementById("boot-text").appendChild(new_line);
        lines.push(new_line);
    } else if (current_message_linetype == 2) {
        // clear the screen then print this
        document.getElementById("boot-text").innerHTML = "";
        lines = [];
        var new_line = document.createElement("span");
        new_line.textContent = current_message_text;
        new_line.style.color = current_message_colour;
        document.getElementById("boot-text").appendChild(new_line);
        lines.push(new_line);
    } else if (current_message_linetype == 3) {
        // type this line out by setting a timeout to add each character. add this text to the last line
        lines[lines.length - 1].style.color = current_message_colour;

        var i = 0;
        function typeLine() {
            lines[lines.length - 1].textContent += current_message_text[i];
            i++;
            if (i < current_message_text.length) {
                setTimeout(typeLine, (speedUp ? 1 : 25));
            } else {
                // typing is finished. print next message after current_message_delay
                setTimeout(printMessage, additional_delay + current_message_delay * (speedUp ? 0.5 : 4));
            }
        }

        // make sure we wait for typing to finish
        additional_delay = true;

        typeLine();
    } else if (current_message_linetype == 4) {
        // type this line out by setting a timeout to add each character. add this text to a new line
        if (lines.length > 0) {
            lines[lines.length - 1].textContent += "\n";
        }

        var new_line = document.createElement("span");
        new_line.style.color = current_message_colour;
        document.getElementById("boot-text").appendChild(new_line);
        lines.push(new_line);

        var i = 0;
        function typeLine() {
            lines[lines.length - 1].textContent += current_message_text[i];
            i++;
            if (i < current_message_text.length) {
                setTimeout(typeLine, (speedUp ? 1 : 25));
            } else {
                // typing is finished. print next message after current_message_delay
                setTimeout(printMessage, additional_delay + current_message_delay * (speedUp ? 0.5 : 4));
            }
        }

        // make sure we wait for typing to finish
        additional_delay = true;

        typeLine();
    }

    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);

    message_index++;

    // things that do additional delay will trigger printMessage themselves
    if (!additional_delay) {
        setTimeout(printMessage, current_message_delay * (speedUp ? 0.5 : 4));
    }
}