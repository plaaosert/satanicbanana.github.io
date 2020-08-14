// hardcoding to get the needed elements - this could be achieved using some sort of json data too
let l1 = document.getElementById('1');
l1.onmouseover = l1.onmouseout = handler;
let l2 = document.getElementById('2');
l2.onmouseover = l2.onmouseout = handler;
let l3 = document.getElementById('3');
l3.onmouseover = l3.onmouseout = handler;

// "alt strings" as a dict for every id
aims = {
	"1":">> shows you a picture of a cool cube i found on the internet for this joke",
	"2":">> it's not that processor intensive, i think",
	"3":">> maybe your computer is lagging"
};

// setup original texts too
origs = {
	"1":l1.text,
	"2":l2.text,
	"3":l3.text
}


// "grow/shrink" intervals currently active on each element so that they can be stopped
// to avoid useless function calls
evts = {
	"1":null,
	"2":null,
	"3":null
}


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

function run_text_grow(el) {
	// Attempt to repair incorrect chars with either another incorrect char or the correct char.
	// Attempt to add chars to the string. If adding, add a block.
	aim_string = aims[el.id]
	
	if (el.text == aim_string) {
		// clear all intervals under this element
		clearInterval(evts[el.id]);
		return;
	}
	
	if (el.text.length < aim_string.length) {
		// for a pseudo-lerp motion, add one char for every 6 chars left to add
		len_diff = aim_string.length - el.text.length
		el.text += "█".repeat(Math.min(aim_string.length - el.text.length, Math.ceil(len_diff / 6)));
	}
	

	// weights it more heavily to select the correct char if surrounding chars are already correct
	// generates runaway correction which (mostly) prevents chars from remaining "glitched" for too long
	correct_combo = 0;
	for (var i = 0; i < el.text.length; i++) {
		// more likely to change to correct closer to the start of the string
		change_weight = ((el.text.length - i) / el.text.length) * 5;
		correct_combo++;
		correct_combo++;
		
		// if char is wrong at point replace with either the correct char or a random one
		if (el.text.charAt(i) != aim_string.charAt(i)) {
			el.text = el.text.replace_at(i, Math.floor(Math.random() * (40 - correct_combo)) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
			correct_combo = 0;
		// if char is right at point (and low-chance roll is successful) replace with either the right char again or a random char
		} else if (Math.floor(Math.random() * 250 + (change_weight * 0.5)) == 0) {
			el.text = el.text.replace_at(i, Math.floor(Math.random() * 50) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
	}
}

function run_text_shrink(el) {
	// Attempt to repair incorrect chars with either another incorrect char or the correct char (if in range)
	// Remove chars from the string until it reaches original length.
	aim_string = origs[el.id]
	
	if (el.text == aim_string) {
		// clear all intervals under this element
		clearInterval(evts[el.id]);
		return;
	}
	
	if (el.text.length > aim_string.length) {
		// pseudo-lerp again - remove one char for every 4 chars left to remove
		len_diff = el.text.length - aim_string.length
		el.text = el.text.substring(0, el.text.length - Math.ceil(len_diff / 4));
	}
	

	correct_combo = 0;
	for (var i = 0; i < el.text.length; i++) {
		change_weight = ((el.text.length - i) / el.text.length) * 5;
		correct_combo++;
		correct_combo++;
		
		if (i >= aim_string.length) {
			// sometimes replace with random
			el.text = el.text.replace_at(i, Math.floor(Math.random() * 50) <= change_weight ? el.text.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
		else if (el.text.charAt(i) != aim_string.charAt(i)) {
			// if in range, set to correct or random
			el.text = el.text.replace_at(i, Math.floor(Math.random() * 40) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
			correct_combo = 0;
		} else if (Math.floor(Math.random() * 250 + (change_weight * 0.5)) == 0) {
			el.text = el.text.replace_at(i, Math.floor(Math.random() * 50) <= change_weight ? aim_string.charAt(i) : alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
	}
}