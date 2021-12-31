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

keyboard = [
	"qwertyuiop",
	"asdfghjkl",
	"zxcvbnm"
]

words_guessed = []
words_objects = []
locked_chars = []
yellowed_chars = []
dropped_chars = []
target_word = "unset"
target_length = target_word.length;

solved_num = 0
score = 0
streak = 0

highscore = parseInt(localStorage.getItem("highscore"));
if (!highscore) {
	highscore = 0;
}

gametime = parseInt(localStorage.getItem("words-time"));
if (!gametime) {
	gametime = 0;
}

time = parseInt(localStorage.getItem("time"));
localtime = 0;
if (!time) {
	time = 0;
}

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


cat_words = []
for (var i=0; i<30; i++) {
	cat_words.push([]);
}

for (var i=0; i<words.length; i++) {
	var word = words[i];
	cat_words[word.length].push(word);
}


function update_input_view(view, word) {
	while (view.firstChild) {
		view.firstChild.remove()
	}
	
	for (var i=0; i<word.length; i++) {
		var span = document.createElement("span");
		span.textContent = word.charAt(i);
		
		var c_t = target_word.charAt(i);
		var c_w = word.charAt(i);
		if (c_t == c_w && locked_chars[i]) {
			span.classList.add("green");
		} else if (!word_chars.includes(c_w) && dropped_chars.includes(c_w)) {
			span.classList.add("grey");
		}
		
		view.appendChild(span);
	}
}


function update_keyboard_view() {
	for (var kb_row=0; kb_row<3; kb_row++) {
		var kb = keyboard[kb_row];
		var kb_obj = document.getElementById("words-available-" + (kb_row + 1));
		
		while (kb_obj.firstChild) {
			kb_obj.firstChild.remove()
		}
		
		for (var c=0; c<kb.length; c++) {
			var ch = kb.charAt(c);
			var span = document.createElement("span");
			
			span.addEventListener("click", function() {
				document.getElementById("input-box").value += this.textContent;
				input_box_updated();
				document.getElementById("input-box").focus();
			});
			
			span.textContent = ch;
			span.classList.add("mouse-active");
			span.classList.add("mini");
			span.classList.add("letter");
			
			if (locked_chars.includes(ch)) {
				span.classList.add("green");
			} else if (yellowed_chars.includes(ch)) {
				span.classList.add("yellow");
			} else if (dropped_chars.includes(ch)) {
				span.classList.add("grey");
			} else {
				span.classList.add("white");
			}
			
			kb_obj.appendChild(span);
		}
		
		var bksp_span = document.createElement("span");
		bksp_span.classList.add("mouse-active");
		bksp_span.classList.add("mini");
		bksp_span.classList.add("letter");
		bksp_span.classList.add("white");
		
		bksp_span.textContent += "<--";
		
		if (kb_row == 0) {
			bksp_span.addEventListener("click", function() {
				document.getElementById("input-box").value = document.getElementById("input-box").value.slice(0, -1);
				input_box_updated();
				document.getElementById("input-box").focus();
			});
		} else if (kb_row == 1) {
			bksp_span.textContent = "ENT";
			bksp_span.classList.remove("white");
			bksp_span.classList.add("green");
			bksp_span.addEventListener("click", function() {
				input_box_enter();
			});
		} else {
			bksp_span.classList.add("hidden");
		}
		
		kb_obj.appendChild(bksp_span);
	}
}


function pick_new_word(length) {
	if (length < 2)
		return;
	
	var wordlist = cat_words[length]
	
	set_new_word(wordlist[Math.floor(Math.random() * wordlist.length)]);
}


function set_new_word(word) {
	target_word = word;
	target_length = target_word.length;
	
	words_guessed = [];
	words_objects = [];
	
	locked_chars = [];
	yellowed_chars = [];
	dropped_chars = [];
	
	for (var i=0; i<target_length; i++) {
		locked_chars.push(null);
	}
	
	var cont = document.getElementById("words");
	while (cont.firstChild) {
		cont.firstChild.remove()
	}

	add_new_guessed_word("?".repeat(target_length));
	
	var input = document.getElementById("input-box");
	input.focus();
}


function solve_word() {
	// Gain score and increase streak
	streak += 1;
	score += Math.round((2 ** target_length) * streak * 12 * (8 / words_guessed.length));
	solved_num += 1;
	
	document.getElementById("solved-num").textContent = solved_num;
	document.getElementById("score-num").textContent = score.toLocaleString();
	document.getElementById("streak-num").textContent = streak + "x";
	document.getElementById("input-box").disabled = false;
	
	pick_new_word(target_length)
}


function add_new_guessed_word(word) {
	/*
	<span class="green-letter letter">a</span>
	<span class="green-letter letter">a</span>
	<span class="grey-letter letter">a</span>
	<span class="yellow-letter letter">a</span>
	<span class="green-letter letter">a</span>
	*/
	var div_container = document.createElement("div");
	var cont = document.getElementById("guessed-so-far");
	while (cont.firstChild) {
		cont.firstChild.remove()
	}
	
	div_container.style.bottom = "0px";
	div_container.className = "words-row";
	
	word_chars = []
	for (var i=0; i<target_length; i++) {
		if (word.charAt(i) == target_word.charAt(i)) {
			word_chars.push("_");
		} else {
			word_chars.push(target_word.charAt(i));
		}
	}
	
	for (var i=0; i<target_length; i++) {
		var span = document.createElement("span");
		var second_span = document.createElement("span");
		
		span.classList.add("letter");
		
		var c_t = target_word.charAt(i);
		var c_w = word.charAt(i);
		if (c_t == c_w) {
			span.classList.add("green-letter");
			locked_chars[i] = c_t;
		} else if (word_chars.includes(c_w)) {
			if (!yellowed_chars.includes(c_w)) {
				yellowed_chars.push(c_w);
			}
			span.classList.add("yellow-letter");
		} else {
			if (!dropped_chars.includes(c_w)) {
				dropped_chars.push(c_w);
			}
			span.classList.add("grey-letter");
		}
		
		if (locked_chars[i]) {
			second_span.textContent = locked_chars[i];
			second_span.classList.add("green");
		} else {
			second_span.textContent = "?";
			second_span.classList.add("grey");
		}
		
		span.textContent = c_w;
		div_container.appendChild(span);
		cont.appendChild(second_span);
	}
	
	for (var i=0; i<words_objects.length; i++) {
		words_objects[words_objects.length - i - 1].style.bottom = ((i + 1) * 92) + "px";
	}
	
	if (word == target_word) {
		document.getElementById("input-box").disabled = true;
		
		for (var i=0; i<4; i++) {
			setTimeout(function() {
				div_container.classList.add("invert");
			}, 300 * i);
			
			setTimeout(function() {
				div_container.classList.remove("invert");
			}, (300 * i) + 150);
		}
		
		setTimeout(solve_word, 1500);
	}
	
	words_guessed.push(word);
	words_objects.push(div_container);
	
	update_keyboard_view();
	
	document.getElementById("words").appendChild(div_container);
}

function input_box_updated() {
	// Number 13 is the "Enter" key on the keyboard
	var input = document.getElementById("input-box");
	var input_view = document.getElementById("input-view");
	if (input.value.length > target_length && !input.value.startsWith("l:")) {
		input.value = input.value.substring(0, target_length);
	}

	update_input_view(input_view, input.value);
}

function input_box_enter() {
	// Cancel the default action, if needed
	var input = document.getElementById("input-box");
	var input_view = document.getElementById("input-view");
	
	if (input.value.startsWith("l:")) {
		pick_new_word(parseInt(input.value.charAt(2)));
		input.value = "";
		streak = 0
		document.getElementById("streak-num").textContent = "0x";
		
	} else if (input.value.length == target_length) {
		if (cat_words[target_length].includes(input.value)) {
			add_new_guessed_word(input.value);
			input.value = "";
		} else {
			input_view.classList.add("red");
			
			setTimeout(function(){
				input_view.classList.remove("red");
			}, 500);
		}
	} else {
		input_view.classList.add("red");
		setTimeout(function(){
			input_view.classList.remove("red");
		}, 500);
	}
	
	update_input_view(input_view, input.value);
}


function position_elements() {
	var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	// Clearance is (83.41 * word_length) + 64 + 809 (width of keyboard)
	var clearance = (83.41 * target_length) + 873;
	
	if (vw < clearance || ('ontouchstart' in document.documentElement)) {
		// Move the keyboard
		var keyboard = document.getElementById("words-available");
		keyboard.style.removeProperty("right");
		keyboard.style.left = "0px";
		keyboard.style.right = "0px";
		keyboard.style.bottom = "-360px";
		
		// If width less than clearance with half keyboard, dim the hints too
		if (vw < (clearance - (809 / 2))) {
			document.getElementById("hints").classList.add("dimmed");
		} else {
			document.getElementById("hints").classList.remove("dimmed");
		}
	} else {
		var keyboard = document.getElementById("words-available");
		keyboard.style.right = "64px";
		keyboard.style.removeProperty("left");
		keyboard.style.bottom = "312px";
		document.getElementById("hints").classList.remove("dimmed");
	}
}


document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("session-time").textContent = localtime.toString().toHHMMSS();
	document.getElementById("all-time").textContent = gametime.toString().toDDHHMMSS();
	document.getElementById("global-time").textContent = time.toString().toDDHHMMSS();
	setInterval(update_time, 1000);
	setInterval(position_elements, 250);
	
	// Get the input field
	var input = document.getElementById("input-box");
	var input_view = document.getElementById("input-view");

	// Execute a function when the user releases a key on the keyboard
	input.addEventListener("input", function() {
		input_box_updated();
	});
	
	input.addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode === 13) {
			input_box_enter();
		}
		update_input_view(input_view, input.value);
	});

	pick_new_word(6);
	update_keyboard_view();
	
	position_elements();
});
