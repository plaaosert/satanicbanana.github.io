// event handler for both events needed
function handler(event) {
	// clear all intervals under this element
	if (evts[event.target.id] != null)
		clearInterval(evts[event.target.id]);

	if (event.type == 'mouseover') {
		evts[event.target.id] = setInterval(function() { run_text_grow(event.target); }, 1000/60);
	}
	if (event.type == 'mouseout') {
		evts[event.target.id] = setInterval(function() { run_text_shrink(event.target); }, 1000/60);
	}
}

/*
let l1 = document.getElementById('1');
l1.onmouseover = l1.onmouseout = handler;
let l2 = document.getElementById('2');
l2.onmouseover = l2.onmouseout = handler;
let l3 = document.getElementById('3');
l3.onmouseover = l3.onmouseout = handler;
let l4 = document.getElementById('4');
l4.onmouseover = l4.onmouseout = handler;
let l5 = document.getElementById('5');
l5.onmouseover = l5.onmouseout = handler;
*/

glitch_enabled = true;

// "alt strings" as a dict for every id
aims = {
	"1":">> time to learn about twitchpost!",
	"2":">> down for maintenance",
	"3":">> infinite match-3 game",
	"4":">> a \"unique\" word-guessing game",
	"5":">> select another style for the ocean",
	"6":">> drwxr-xr-x 8 plaao plaao 4096 Nov 06 03:40 ..",
	"7":"@plaaosert",
	"8":">> a game about matching words in a box",
	"9":">> not complete just yet!",
	"10":">> it's time to spin...",
	"banner":"// \u00A0hello!\u00A0\u00A0 //"
};

num_glitch_elements = Object.keys(aims).length;

// select elements using format "#" where # is i
// then set their onmouseover and onmouseout to handler (defined below)
for (var i = 1; i <= num_glitch_elements; i++) {
	var l = document.getElementById(i == num_glitch_elements ? "banner" : i);
	l.onmouseover = l.onmouseout = handler;
}

// "grow/shrink" intervals currently active on each element so that they can be stopped
// to avoid useless function calls
/*
evts = {
	"1":null,
	"2":null,
	"3":null,
	"4":null,
	"5":null
}
*/
evts = {};

// setup original texts too
origs = {}
for (var i = 1; i <= num_glitch_elements; i++) {
	var l = document.getElementById(i == num_glitch_elements ? "banner" : i);
	origs[(i == num_glitch_elements ? "banner" : i).toString()] = l.textContent;
	evts[(i == num_glitch_elements ? "banner" : i).toString()] = null;
}

/*
origs = {
	"1":l1.text,
	"2":l2.text,
	"3":l3.text,
	"4":l4.text,
	"5":l5.text
}
*/

function run_text_grow(el) {
	if (!glitch_enabled) {
		return;
	}

	// Attempt to repair incorrect chars with either another incorrect char or the correct char.
	// Attempt to add chars to the string. If adding, add a block.
	aim_string = aims[el.id]
	
	if (el.textContent == aim_string) {
		// clear all intervals under this element
		clearInterval(evts[el.id]);
		return;
	}
	
	if (el.textContent.length < aim_string.length) {
		// for a pseudo-lerp motion, add one char for every 6 chars left to add
		len_diff = aim_string.length - el.textContent.length
		el.textContent += "█".repeat(Math.min(aim_string.length - el.textContent.length, Math.ceil(len_diff / 6)));
	}
	

	// weights it more heavily to select the correct char if surrounding chars are already correct
	// generates runaway correction which (mostly) prevents chars from remaining "glitched" for too long
	correct_combo = 0;
	for (var i = 0; i < el.textContent.length; i++) {
		// more likely to change to correct closer to the start of the string
		change_weight = ((el.textContent.length - i) / el.textContent.length) * 5;
		correct_combo++;
		correct_combo++;
		
		// if char is wrong at point replace with either the correct char or a random one
		if (el.textContent.charAt(i) != aim_string.charAt(i)) {
			el.textContent = el.textContent.replace_at(i, Math.floor(Math.random() * (40 - correct_combo)) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
			correct_combo = 0;
		// if char is right at point (and low-chance roll is successful) replace with either the right char again or a random char
		} else if (Math.floor(Math.random() * 250 + (change_weight * 0.5)) == 0) {
			el.textContent = el.textContent.replace_at(i, Math.floor(Math.random() * 50) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
	}
}

function run_text_shrink(el) {
	if (!glitch_enabled) {
		return;
	}

	// Attempt to repair incorrect chars with either another incorrect char or the correct char (if in range)
	// Remove chars from the string until it reaches original length.
	aim_string = origs[el.id]
	
	if (el.textContent == aim_string) {
		// clear all intervals under this element
		clearInterval(evts[el.id]);
		return;
	}
	
	if (el.textContent.length > aim_string.length) {
		// pseudo-lerp again - remove one char for every 4 chars left to remove
		len_diff = el.textContent.length - aim_string.length
		el.textContent = el.textContent.substring(0, el.textContent.length - Math.ceil(len_diff / 4));
	}
	

	correct_combo = 0;
	for (var i = 0; i < el.textContent.length; i++) {
		change_weight = ((el.textContent.length - i) / el.textContent.length) * 5;
		correct_combo++;
		correct_combo++;
		
		if (i >= aim_string.length) {
			// sometimes replace with random
			el.textContent = el.textContent.replace_at(i, Math.floor(Math.random() * 50) <= change_weight ? el.textContent.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
		else if (el.textContent.charAt(i) != aim_string.charAt(i)) {
			// if in range, set to correct or random
			el.textContent = el.textContent.replace_at(i, Math.floor(Math.random() * 40) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
			correct_combo = 0;
		} else if (Math.floor(Math.random() * 250 + (change_weight * 0.5)) == 0) {
			el.textContent = el.textContent.replace_at(i, Math.floor(Math.random() * 50) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
	}
}