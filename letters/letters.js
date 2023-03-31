// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

String.prototype.toDDHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
	var days    = Math.floor(sec_num / 86400);
    var hours   = Math.floor((sec_num - (days * 86400)) / 3600);
    var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (days * 86400) - (hours * 3600) - (minutes * 60));

	if (days    < 10) {days    = "0"+days;}
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return days+":"+hours+':'+minutes+':'+seconds;
}

highscore = parseInt(localStorage.getItem("highscore"));
if (!highscore) {
	highscore = 0;
}

gametime = parseInt(localStorage.getItem("letters-time"));
if (!gametime) {
	gametime = 0;
}

time = parseInt(localStorage.getItem("time"));
localtime = 0;
if (!time) {
	time = 0;
}

letters = [
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"
];
building_word = "";
current_selected_letter = null;
words_used = [];

function update_time() {
	time += 1;
	gametime += 1;
	localtime += 1;
	
	localStorage.setItem("words-time", gametime);
	localStorage.setItem("time", time);
	
	document.getElementById("session-time").textContent = localtime.toString().toHHMMSS();
	document.getElementById("all-time").textContent = gametime.toString().toDDHHMMSS();
	document.getElementById("global-time").textContent = time.toString().toDDHHMMSS();
}

letter_elems = [];
letter_buttons = [];
word_history_elems = [];

function setup_elements() {
	element_id_nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	element_id_nums.forEach(element => {
		let letter_elem = document.getElementById("letter-" + element);
		let letter_button_elem = document.getElementById("letter-button-" + element);

		let cur_val = element;
		letter_button_elem.addEventListener("click", function() {
			select_letter(cur_val);
		})

		letter_elems.push(letter_elem);
		letter_buttons.push(letter_button_elem);
	});

	for (var i=0; i<9; i++) {
		word_history_elems.push(document.getElementById("word-result-" + i));
		word_history_elems[i].textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
	}
}

function letter_in_used_words(letter) {
	return words_used.some(word => {
		if (word.includes(letter)) {
			return true;
		}
	});

	return false;
}

function letter_to_id(letter) {
	for (var i=0; i<12; i++) {
		if (letter.toUpperCase() == letters[i]) {
			return i;
		}
	}

	return -1;
}

function update_letter_elems() {
	for (var i=0; i<12; i++) {
		let letter = letters[i];
		let letter_used = (i == current_selected_letter) || letter_in_used_words(letter) || building_word.includes(letter);

		// grey out the letter if it's been used anywhere
		// "select" the button if it's been used in the current word
		// "superselect" the button if it's the selected letter
		if (letter_used) {
			letter_elems[i].classList.add("letter-got");
			letter_buttons[i].classList.add("letter-button-darken");
		} else {
			letter_elems[i].classList.remove("letter-got");
			letter_buttons[i].classList.remove("letter-button-darken");
		}

		if (building_word.includes(letter) || i == current_selected_letter) {
			letter_buttons[i].classList.add("letter-button-got");
			letter_buttons[i].classList.remove("letter-button-darken");
		} else {
			letter_buttons[i].classList.remove("letter-button-got");
		}

		if (i == current_selected_letter) {
			letter_buttons[i].classList.add("superwhite");
		} else {
			letter_buttons[i].classList.remove("superwhite");
		}
	}
}

function update_word_history() {
	// pick the most recent 8 words, use the last history id we get to as the current
	var last_eight = words_used.slice(-9);
	for (var i=0; i<9; i++) {
		var st = "";
		if (i < last_eight.length) {
			st = last_eight[i];
		} else if (i == last_eight.length) {
			st = get_current_word();
			if (get_current_word() == null) {
				st = "";
			}
		}

		word_history_elems[i].textContent = st.padEnd(10, "#").replaceAll("#", "\u00A0");
	}
}

function set_letter_selected(letter_id) {
	if (current_selected_letter == null) {
		current_selected_letter = letter_id;
	} else {
		if (current_selected_letter == letter_id) {
			current_selected_letter = null;
		} else {
			building_word += letters[current_selected_letter];
			current_selected_letter = letter_id;
		}
	}

	update_letter_elems();
}

function valid_to_select(from, to) {
	if (from == undefined) {
		return true;
	}

	let from_side = Math.floor(from / 3);
	let to_side = Math.floor(to / 3);

	return from_side != to_side;
}

function get_current_word() {
	if (current_selected_letter == null) {
		return null;
	}

	return building_word + letters[current_selected_letter];
}

function select_letter(letter_id) {
	letter_elem = letter_elems[letter_id];
	letter_button = letter_buttons[letter_id];

	if (valid_to_select(current_selected_letter, letter_id)) {
		set_letter_selected(letter_id);
	}

	update_word_history();
}

function undo() {
	if (building_word.length == 0) {
		// pop the previous word off from the used words
		if (words_used.length == 0) {
			if (current_selected_letter == null) {
				return; // nothing to undo
			} else {
				current_selected_letter = null;
				update_letter_elems();
				update_word_history();
				return;
			}
		}

		building_word = words_used.slice(-1)[0];
		words_used = words_used.slice(0, -1);
	}

	// take off a letter from building_word
	var new_front = building_word.slice(-1);
	building_word = building_word.slice(0, -1);
	current_selected_letter = letter_to_id(new_front);

	update_letter_elems();
	update_word_history();
}

function complete_word(ignore_checks) {
	if (!get_current_word()) {
		return;
	}

	final_word = get_current_word().toLowerCase();

	if (words.includes(final_word) || ignore_checks) {
		words_used.push(final_word.toUpperCase());
		building_word = "";
	
		update_letter_elems();
		update_word_history();
	}
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("session-time").textContent = localtime.toString().toHHMMSS();
	document.getElementById("all-time").textContent = gametime.toString().toDDHHMMSS();
	document.getElementById("global-time").textContent = time.toString().toDDHHMMSS();
	setInterval(update_time, 1000);

	setup_elements();
	update_letter_elems();

	document.addEventListener('keydown', (event) => {
		var name = event.key;
		var code = event.code;

		// is the key present in the list of letters?
		if (letters.includes(name.toUpperCase())) {
			// simulate a click of this
			var ind = letters.indexOf(name.toUpperCase());
			select_letter(ind);
			return;
		}

		// is the key ENTER or BACKSPACE?
		switch (code) {
			case "Enter":
				complete_word();
				break;

			case "Backspace":
				undo();
				break;
		}
	}, false);
});
