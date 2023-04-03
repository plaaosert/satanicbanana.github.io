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

tutorial_complete = localStorage.getItem("letters-tutorial-complete");

letters = [
	"S", "F", "C", "E", "A", "T", "B", "I", "W", "L", "M", "N"
];
building_word = "";
current_selected_letter = null;
words_used = [];
filtered_words = [];
generating = false;

var url_string = window.location.href; 
var url = new URL(url_string);
var demo_val = url.searchParams.get("demo");

demo = false;
if (demo_val) {
	demo = true;
}

function update_time() {
	time += 1;
	gametime += 1;
	localtime += 1;
	
	localStorage.setItem("letters-time", gametime);
	localStorage.setItem("time", time);
	
	document.getElementById("session-time").textContent = localtime.toString().toHHMMSS();
	document.getElementById("all-time").textContent = gametime.toString().toDDHHMMSS();
	document.getElementById("global-time").textContent = time.toString().toDDHHMMSS();
}

letter_elems = [];
letter_buttons = [];
word_history_elems = [];

score = 0;
solved = 0;

function update_scores() {
	document.getElementById("score-num").textContent = score.toString();
	document.getElementById("solved-num").textContent = solved.toString();
}

function setup_elements() {
	letter_elems = [];
	letter_buttons = [];
	word_history_elems = [];

	element_id_nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	element_id_nums.forEach(element => {
		let letter_elem = document.getElementById("letter-" + element);
		let letter_button_elem = document.getElementById("letter-button-" + element);

		let cur_val = element;
		letter_elem.textContent = letters[cur_val];
		letter_button_elem.addEventListener("click", function() {
			select_letter(cur_val);
		})

		letter_elems.push(letter_elem);
		letter_buttons.push(letter_button_elem);
	});

	for (var i=0; i<9; i++) {
		word_history_elems.push(document.getElementById("word-result-" + i));
		word_history_elems[i].textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
	}

	filtered_words = [];
	words.forEach(word => {
		if (word.split("").every(c => letters.includes(c.toUpperCase())) && word.length > 1) {
			filtered_words.push(word);
		}
	});

	var new_filtered_words = []
	filtered_words.forEach(word => {
		var last_pos = null;
		var success = true;
		for (var i=0; i<word.length; i++) {
			var new_pos = letter_to_id(word.charAt(i));

			if (!valid_to_select(last_pos, new_pos)) {
				success = false;
				break;
			}

			last_pos = new_pos;
		}

		if (success) {
			new_filtered_words.push(word.toUpperCase());
		}
	});

	filtered_words = new_filtered_words;
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

function update_letter_lines() {
	var old_lines = [];
	var new_lines = [];

	for (var i=0; i<words_used.length; i++) {
		// populate old lines
		var word = words_used[i];
		for (var j=0; j<word.length-1; j++) {
			old_lines.push(
				[letter_to_id(word.charAt(j)), letter_to_id(word.charAt(j+1))]
			);
		}
	}

	for (var j=0; j<building_word.length-1; j++) {
		new_lines.push(
			[letter_to_id(building_word.charAt(j)), letter_to_id(building_word.charAt(j+1))]
		);
	}

	if (current_selected_letter != null && building_word.length > 0) {
		new_lines.push(
			[letter_to_id(building_word.charAt(building_word.length - 1)), current_selected_letter]
		);
	}

	var new_lines_split = draw_lines(new_lines, "#+-.\u00A0").split("\n");
	for (var i=0; i<7; i++) {
		let line = document.getElementById("gamecenter-" + i);

		var text_line = new_lines_split[i];
		if (i % 2 != 0) {
			text_line = text_line.slice(1, -1);

			// need to add white spans to the letter button so we can edit it correctly. should be possible
		}

		line.textContent = text_line;
	}
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

	update_letter_lines();
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

		word_history_elems[i].textContent = st.padEnd(14, "#").replaceAll("#", "\u00A0");
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

function clear_uibuttons() {
	document.getElementById("submit-button").classList.remove("superwhite");
	document.getElementById("undo-button").classList.remove("superwhite");
}

function select_letter(letter_id, ignore_generating) {
	if (generating && !ignore_generating) {
		return;
	}

	letter_elem = letter_elems[letter_id];
	letter_button = letter_buttons[letter_id];

	if (valid_to_select(current_selected_letter, letter_id)) {
		set_letter_selected(letter_id);
	}

	update_word_history();
	clear_uibuttons();
}

function undo(ignore_checks) {
	if (generating && !ignore_checks) {
		return;
	}

	if (building_word.length == 0) {
		// pop the previous word off from the used words
		if (words_used.length == 0) {
			if (current_selected_letter == null) {
				return; // nothing to undo
			} else {
				current_selected_letter = null;
				update_letter_elems();
				update_word_history();
				document.getElementById("submit-button").classList.remove("superwhite");
				document.getElementById("undo-button").classList.add("superwhite");
				setTimeout(clear_uibuttons, 200);
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
	document.getElementById("submit-button").classList.remove("superwhite");
	document.getElementById("undo-button").classList.add("superwhite");
	setTimeout(clear_uibuttons, 200);
}

function complete_word(ignore_checks, ignore_generating) {
	if (generating && !ignore_generating) {
		return;
	}

	if (!get_current_word()) {
		return;
	}

	final_word = get_current_word();

	if (filtered_words.includes(final_word) || ignore_checks) {
		words_used.push(final_word.toUpperCase());
		building_word = "";

		if (letters.every(c => {return words_used.some(word => word.includes(c))})) {
			current_selected_letter = null;
			update_letter_elems();
			update_word_history();
			win();
			return;
		}
	
		update_letter_elems();
		update_word_history();
		document.getElementById("submit-button").classList.add("superwhite");
		document.getElementById("undo-button").classList.remove("superwhite");
		setTimeout(clear_uibuttons, 400);
	}
}

function clear_current_word() {
	building_word = "";
	current_selected_letter = null;
	if (words_used.length > 0) {
		current_selected_letter = letter_to_id(words_used[words_used.length - 1].slice(-1));
	}

	update_letter_elems();
	update_word_history();
}

function regenerate_random_puzzle(locked_letters) {
	current_selected_letter = null;
	building_word = ""
	words_used = [];
	letters = [];

	var choices = "ABCDEFGHIJKLMNPQRSTUVWXYZ";

	if (locked_letters) {
		locked_letters.forEach(c => {
			if (c) {
				choices = choices.replace(c, "");
			}
		});
	}

	for (var i=0; i<12; i++) {
		if (locked_letters && locked_letters[i]) {
			letters.push(locked_letters[i]);
		} else {
			letters.push(choices.charAt(Math.floor(Math.random() * choices.length)));
		}

		choices = choices.replace(letters[i], "");
	}

	setup_elements();
	update_letter_elems();
	update_word_history();
}

function solve_current_puzzle(max_depth, timeout) {
	solve_attempt_time = Date.now();
	return solve_current_puzzle_2(null, [], 0, max_depth, timeout);
}

function solve_current_puzzle_2(selected, picked_words, depth, max_depth, timeout) {
	// this is not a comprehensive solver. it will take the lowest hanging fruit and get sent to hell if it can't find anything,
	// until it gets stopped by the timeout.
	// this is made with the purpose of encouraging the random generator to make puzzles which are both possible and also not horribly difficult.

	if (depth > max_depth || Date.now() - timeout > solve_attempt_time) {
		return null;
	}

	if (letters.every(c => {return picked_words.some(word => word.includes(c))})) {
		return picked_words;
	};

	// find all words which may follow from the current
	var candidates = [];
	if (selected == null) {
		candidates = filtered_words.slice();
	} else {
		candidates = filtered_words.filter(word => word.startsWith(selected) && !picked_words.includes(word));
	}

	var letters_remaining = [];
	letters.forEach(c => {
		if (!picked_words.some(word => word.includes(c))) {
			letters_remaining.push(c);
		}
	});

	var candidate_scores = {};
	candidates.forEach(candidate => {
		// rank each candidate by how many new letters it covers
		let score = 0;
		let new_chars = [];
		candidate.split("").forEach(c => {
			if (letters_remaining.includes(c) && !new_chars.includes(c)) {
				new_chars.push(c);
				score += 1;  // this is to make sure it mostly outranks the most common word. by reducing this, we make puzzles easier.
				// by increasing it, puzzles become harder.
				// lowering this also increases generation time
			}
		})

		// reward more common words - should make auto-solutions make more sense
		score += freqs[candidate] / 183212978.0;

		// if the word is super uncommon, just reject [do last and hope the timeout kicks us out first]
		if (freqs[candidate] / 183212978.0 < 0.00001) {
			score += 0;
		}

		candidate_scores[candidate] = -score;
	});

	candidates.sort(function(a, b){  
		return candidate_scores[a] - candidate_scores[b];
	});

	// run function on all of them
	for (var i=0; i<candidates.length; i++) {
		let candidate = candidates[i];

		let new_picked_words = picked_words.slice();
		new_picked_words.push(candidate);
		
		let result = solve_current_puzzle_2(candidate.charAt(candidate.length - 1), new_picked_words, depth + 1, max_depth, timeout);
		if (result != null) {
			return result;
		}
	}
}

win_speed = 200;
function automatically_win(solution, dont_clear) {
	if (!dont_clear) {
		current_selected_letter = null;
		building_word = ""
		words_used = [];
	}

	let solution_found = solution
	if (!solution) {
		solution_found = solve_current_puzzle(5, 2000);
	}

	let timer = win_speed;

	solution_found.forEach(word => {
		word.split("").forEach(c => {
			setTimeout(function() {select_letter(letter_to_id(c), true)}, timer);
			timer += win_speed;
		})

		setTimeout(function() {complete_word(false, true)}, timer);
		timer += win_speed * 2;
	})
}

function win() {
	function flash_up() {
		letter_elems.forEach(elem => {
			elem.classList.add("important");
		})
	}

	function flash_down() {
		letter_elems.forEach(elem => {
			elem.classList.remove("important");
		})
	}

	for (var i=0; i<2000; i+=400) {
		setTimeout(flash_up, i);
	}

	for (var i=200; i<2000; i+=400) {
		setTimeout(flash_down, i);
	}

	if (!demo && tutorial_complete) {
		score += Math.max(1, 8 - words_used.length);
		solved++;
		update_scores();
	}

	setTimeout(function () {
		if (!tutorial_complete) {
			end_tutorial();
			return;
		}

		if (!demo) {
			document.getElementById("loading-overlay").style.display = "block";
		}

		setTimeout(function() {
			generate_until_solvable(function() {
				document.getElementById("loading-overlay").style.display = "none";

				if (demo) {
					setTimeout(function() {
						automatically_win();
					}, 100);
				}
			}, 250);
		}, 100);
	}, 2600);
}

solve_attempt_time = 0;
gens = 0;
function generate_until_solvable(callback, timeout, locked_letters) {
	generating = true;
	gens = 0;
	while (true) {
		regenerate_random_puzzle(locked_letters);

		let solution = solve_current_puzzle(4, timeout);
		gens++;

		if (solution != null) {
			if (!demo) {
				generating = false;
			}

			callback();
			return;
		}
	}
}

function typewrite_onto_element(element, string, initial_delay, letter_delay, delete_previous) {
	if (delete_previous) {
		setTimeout(function() {
			element.textContent = "";
		})
	}

	for (let i=1; i<string.length+1; i++) {
		setTimeout(function() {
			element.textContent = string.slice(0, i);
		}, initial_delay + (letter_delay * (i - 1)))
	}
}

function end_tutorial() {
	localStorage.setItem("letters-tutorial-complete", "true");
	location.reload();
}

function redo_tutorial() {
	localStorage.removeItem("letters-tutorial-complete");
	location.reload();
}

document.addEventListener("DOMContentLoaded", function() {
	generating = true;
	document.getElementById("session-time").textContent = localtime.toString().toHHMMSS();
	document.getElementById("all-time").textContent = gametime.toString().toDDHHMMSS();
	document.getElementById("global-time").textContent = time.toString().toDDHHMMSS();
	setInterval(update_time, 1000);

	setup_elements();

	if (!tutorial_complete) {
		var tutorial_big = document.getElementById("tutorial-big");
		var tutorial_small = document.getElementById("tutorial-small");

		document.getElementById("normal-bottombar").style.display = "none";
		document.getElementById("tutorial-overlay").style.display = "block";
		var letter_template = [
			"H", "E", "Y", "A", "M", "B", "P", "U", "S", "R", "T", "L"
		];
		var solution = [
			"ELMS",
			"STYLER",
			"RUB"
		];

		update_letter_elems();
		generate_until_solvable(function() {
			generating = true;
			document.getElementById("loading-overlay").style.display = "none";
			anim_speed = 4;
			var title_strings = [
				["you don't seem to have played before.", 50],
				["in this game, you make words by drawing lines between letters, across this box.", 1000],
				["your goal is to use all of the letters.", 2400],
				["when you submit a word,​​​​​​​​​​​​​​​​​​​​ you start a new one, starting with the letter your last word ended with.", 3000],
				["you can use letters more than once.", 7000],
				["the fewer words you use in your final solution, the more points you get. undo whenever you want.", 9000],
				["good luck!", 12000]
			]

			var subtitle_strings = [
				["let's teach you how to play.", 500],
				["you can also type these letters on your keyboard!", 1600],
				["you can also hit ENTER to submit and BACKSPACE to undo. there is no penalty for undoing and it is unlimited.", 5200],
				["yes, even in the same word!", 8200],
				["undo can fully undo word submission and there is no penalty for doing this.", 10000],
				[" ", 12000]
			]

			var function_timings = [
				[function() {select_letter(letter_to_id("S"), true)}, 800 + 1200],
				[function() {select_letter(letter_to_id("M"), true)}, 800 + 1275],
				[function() {select_letter(letter_to_id("E"), true)}, 800 + 1350],
				[function() {select_letter(letter_to_id("A"), true)}, 800 + 1425],
				[function() {select_letter(letter_to_id("R"), true)}, 800 + 1500],
				[function() {select_letter(letter_to_id("S"), true)}, 800 + 1575],
				[function() {complete_word(true, true)}, 800 + 3200],
				[function() {select_letter(letter_to_id("H"), true)}, 800 + 3575],
				[function() {select_letter(letter_to_id("A"), true)}, 800 + 3650],
				[function() {select_letter(letter_to_id("P"), true)}, 800 + 3725],
				[function() {select_letter(letter_to_id("E"), true)}, 800 + 3800],
				[function() {complete_word(true, true)}, 800 + 3950],
				[function() {select_letter(letter_to_id("U"), true)}, 2200 + 5200],
				[function() {select_letter(letter_to_id("R"), true)}, 2200 + 5250],
				[function() {select_letter(letter_to_id("E"), true)}, 2200 + 5300],
				[function() {select_letter(letter_to_id("U"), true)}, 2200 + 5350],
				[function() {select_letter(letter_to_id("R"), true)}, 2200 + 5400],
				[function() {select_letter(letter_to_id("E"), true)}, 2200 + 5450],
				[function() {select_letter(letter_to_id("U"), true)}, 2200 + 5500],
				[function() {select_letter(letter_to_id("R"), true)}, 2200 + 5550],
				[function() {clear_current_word()}, 2200 + 5600],

				[function() {undo(true)}, 10800],
				[function() {undo(true)}, 10900],
				[function() {undo(true)}, 11000],
				[function() {select_letter(letter_to_id("P"), true)}, 11400],
				[function() {select_letter(letter_to_id("E"), true)}, 11475],
				[function() {complete_word(true, true)}, 11550],


				[function() {automatically_win(solution, true)}, 13000]
			]

			title_strings.forEach(st => {
				typewrite_onto_element(tutorial_big, st[0], st[1] * anim_speed, 7 * anim_speed, true);
			});

			subtitle_strings.forEach(st => {
				typewrite_onto_element(tutorial_small, st[0], st[1] * anim_speed, 7 * anim_speed, true);
			});

			function_timings.forEach(st => {
				setTimeout(st[0], st[1] * anim_speed);
			});
		}, 250, letter_template);
	} else {
		update_letter_elems();

		if (demo) {
			generate_until_solvable(function() {
				document.getElementById("loading-overlay").style.display = "none";
				console.log("here's an answer for this puzzle, you cheater...", solve_current_puzzle(5, 1000));
				automatically_win();
			}, 250);
		} else {
			generate_until_solvable(function() {
				document.getElementById("loading-overlay").style.display = "none";
				console.log("here's an answer for this puzzle, you cheater...", solve_current_puzzle(5, 1000));
			}, 250);
		}
	
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
	}
});
