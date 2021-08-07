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


cols = [
	"empty", "blue", "green", "orange", "purple", "red", "white", "yellow"
]

sprites = [
	"_funny", "_gem"
]

sprite_names = [
	"reft", "rev"
]

sel_sprite = 0
animations = []
animation_stack = []

fall_timer = 250;
spawned_last = 2;
board_length = 0;
board_state = [];
bejs = [];
ready_next = false;
check_next_fall = false;
selected_bej = null;
score = 0;
highscore = parseInt(localStorage.getItem("highscore"));
if (!highscore) {
	highscore = 0;
}

time = parseInt(localStorage.getItem("time"));
localtime = 0;
if (!time) {
	time = 0;
}

combo = 0;


// https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element-relative-to-the-browser-window
function get_element_position(el) {
	var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {top: _y, left: _x};
}


function get_icon(id) {
	return cols[typeof(id) == "String" ? parseInt(id) : id] + sprites[sel_sprite] + ".png";
}


function update_icons() {
	for (var i=0; i<bejs.length; i++) {
		bejs[i].src = get_icon(board_state[i]);
	}
}


function gain_match(cleared) {
	if (cleared > 0) {
		combo++;
		score += cleared * combo * 100;
	} else {
		combo = 1;
	}
	
	if (score > highscore) {
		highscore = score;
		localStorage.setItem("highscore", highscore);
		document.getElementById("highscore-num").textContent = highscore.toLocaleString();
	}
	
	document.getElementById("score-num").textContent = score.toLocaleString();
	document.getElementById("combo-num").textContent = combo + "x";
}


function swap_sprites() {
	sel_sprite = (sel_sprite + 1) % sprites.length;
	document.getElementById("swap-sprites").className = sprite_names[sel_sprite];
	document.getElementById("swap-sprites").textContent = " > use " + sprite_names[sel_sprite] + " sprites < ";
	update_icons();
}


function show_swap_anim(start, end, id1, id2, do_not_backtrack, anim_mul, just_check_matches) {
	// Create two temporary objects then use setinterval to run a function to move them between each others' locations
	var mul = anim_mul == undefined ? 1.0 : anim_mul;
	
	var start_img = document.createElement("img");
	var end_img = document.createElement("img");
	
	start_img.className = "floating-particle";
	end_img.className = "floating-particle";
	
	start_img.src = start.src;
	end_img.src = end.src;
	
	var start_rect = get_element_position(start);
	var end_rect = get_element_position(end);
	
	start_img.style.top = start_rect.top + 8 + "px";
	start_img.style.left = start_rect.left + 8 + "px";
	end_img.style.top = end_rect.top + 8 + "px";
	end_img.style.left = end_rect.left + 8 + "px";
	
	var left_diff = end_rect.left - start_rect.left;
	var up_diff = end_rect.top - start_rect.top;
	var steps_left = left_diff / 10.0;
	var steps_top = up_diff / 10.0;
	
	var left_cur = start_rect.left;
	var left_cur_end = end_rect.left;
	
	var anim_id = animations.length;
	
	var anim_obj = {fn: null, steps: 0, start_img: start_img, end_img: end_img, start: start, end: end, id1: id1, id2: id2, steps_left: steps_left, steps_top: steps_top};
	animations.push(anim_obj);
	animation_stack.push(1);
	
	swap_board_ids(anim_obj.id1, anim_obj.id2);
	
	anim_obj.fn = setInterval(function() {
		anim_obj.start_img.style.left = parseFloat(anim_obj.start_img.style.left.replace("px", "")) + anim_obj.steps_left + "px";
		anim_obj.end_img.style.left = parseFloat(anim_obj.end_img.style.left.replace("px", "")) - anim_obj.steps_left + "px";
		
		anim_obj.start_img.style.top = parseFloat(anim_obj.start_img.style.top.replace("px", "")) + anim_obj.steps_top + "px";;
		anim_obj.end_img.style.top = parseFloat(anim_obj.end_img.style.top.replace("px", "")) - anim_obj.steps_top + "px";;
		
		anim_obj.steps += 1;
		
		if (anim_obj.steps >= 10) {
			clearInterval(anim_obj.fn);
			
			anim_obj.start_img.remove();
			anim_obj.end_img.remove();
			
			anim_obj.start.style.visibility = "visible";
			anim_obj.end.style.visibility = "visible";
			
			setTimeout(function() {
				animation_stack.pop();
				
				if (!do_not_backtrack || just_check_matches) {
					var matches = check_for_matches(anim_obj.id1, anim_obj.id2);
					
					if (matches.length < 3) {
						if (!just_check_matches) {
							fall_timer = 100;
							show_swap_anim(anim_obj.end, anim_obj.start, anim_obj.id2, anim_obj.id1, true)
						}
					} else {
						// clear all matches and id1, id2
						for (var i=0; i<matches.length; i++) {
							show_disappearing_obj(bejs[matches[i]]);
							change_board_id(matches[i], 0);
						}
						
						gain_match(matches.length);
						fall_timer = 250;
					}
				}
			}, 10);
		}
	}, 20 / mul);
	
	document.body.appendChild(start_img);
	document.body.appendChild(end_img);
	start.style.visibility = "hidden";
	end.style.visibility = "hidden";
}


function show_disappearing_obj(start) {
	var start_img = document.createElement("img");
	
	start_img.className = "disappearing-particle";
	start_img.src = start.src;
	
	var start_rect = get_element_position(start);
	start_img.style.top = start_rect.top + 8 + "px";
	start_img.style.left = start_rect.left + 8 + "px";
	
	document.body.appendChild(start_img);
	setTimeout(function() {
		start_img.remove();
	}, 500);
}


function swap_board_ids(id1, id2) {
	buffer = board_state[id1];
	
	board_state[id1] = board_state[id2];
	board_state[id2] = buffer;
	
	bejs[id1].src = get_icon(board_state[id1]);
	bejs[id2].src = get_icon(board_state[id2]);
}


function change_board_id(id, to) {
	board_state[id] = to;
	bejs[id].src = get_icon(board_state[id]);
}


function is_adjacent(a, b) {
	// a and b are adjacent if their difference is 1 or board_length
	var diff = Math.abs(a - b);
	return diff == board_length || (diff == 1 && Math.floor(a / board_length) == Math.floor(b / board_length));
}


function get_board(index) {
	if (index >= 0 && index < board_state.length) {
		return board_state[index];
	} else {
		return -1;
	}
}


function check_match_line(center, offset) {
	var connected = []
	var type_check = get_board(center)
	
	var count = center + offset;
	var last = center;
	
	while (get_board(count) == type_check && get_board(count) != 0) {
		if (!is_adjacent(last, count) || count < board_length) {
			break;
		}
		
		last = count;
		connected.push(count);
		count += offset;
	}
	
	count = center - offset;
	last = center;
	while (get_board(count) == type_check && get_board(count) != 0) {
		if (!is_adjacent(last, count) || count < board_length) {
			break;
		}
		
		last = count;
		connected.push(count);
		count -= offset;
	}
	
	if (connected.length < 2) {
		connected = [];
	} else {
		connected.push(center);
	}
	
	return connected;
}


// Wraps for some reason. Why
function check_for_matches(center1, center2) {
	var total_matches = []
	
	if (get_board(center1 + board_length) != 0) {
		total_matches = total_matches.concat(check_match_line(center1, 1));
		total_matches = total_matches.concat(check_match_line(center1, board_length));
	}
	
	if (center2 && get_board(center2 + board_length) != 0) {
		total_matches = total_matches.concat(check_match_line(center2, 1));
		total_matches = total_matches.concat(check_match_line(center2, board_length));
	}
	
	return total_matches
}


function select_bej(bej, over) {
	if (get_board(bej.id) != 0 && animation_stack.length == 0 && ready_next) {
		if (selected_bej != null) {
			if (selected_bej.id != bej.id && is_adjacent(selected_bej.id, bej.id)) {
				ready_next = false;
				fall_timer = -1;
				combo = 0;
				show_swap_anim(selected_bej, bej, parseInt(selected_bej.id), parseInt(bej.id));
			}
				
			selected_bej.className = "bej-object";
			selected_bej = null;
		} else if (!over) {
			bej.className = "bej-object-selected";
			selected_bej = bej;
		}
	}
}



function cause_falling_bejs(locations) {
	// Find the columns necessary to check.
	/*
	var cols = []
	for (var i=0; i<locations.length; i++) {
		col = locations[i] % board_length;
		if (!cols.includes(col)) {
			cols.push(col);
		}
	}
	*/
	if (fall_timer <= 0 && fall_timer != -1) {
		var tried_drops = false;
		var spawned = 0;
		for (var i=0; i<board_length; i++) {
			// For each column, activate a swap if necessary (empty below non-empty)
			for (var loc=bejs_vertical - 1; loc>0; loc--) {
				var loc_resolved = i + (board_length * loc);
				
				if (get_board(loc_resolved) == 0 && get_board(loc_resolved - board_length) > 0) {
					tried_drops = true;
					show_swap_anim(bejs[loc_resolved - board_length], bejs[loc_resolved], loc_resolved - board_length, loc_resolved, true, 2);
				}
				
				if (get_board(loc_resolved + board_length) > 0 && get_board(loc_resolved - board_length) != 0) {
					// fall_checks.push(loc_resolved);
				}
			}
			
			if (get_board(i) == 0) {
				tried_drops = true;
				
				if (spawned_last < 0) {
					change_board_id(i, Math.floor(Math.random() * 7) + 1);
					spawned++;
				}
			}
		}
		
		if (spawned) {
			spawned_last = 0 + Math.floor(spawned / 6);
		} else {
			spawned_last--;
		}
		
		if (check_next_fall) {
			// Check all locations in fall checks
			total_matches = 0;
			for (var loc_id=0; loc_id<board_state.length; loc_id++) {
				var matches = check_for_matches(loc_id);
							
				if (matches.length >= 3) {
					for (var i=0; i<matches.length; i++) {
						total_matches++;
						show_disappearing_obj(bejs[matches[i]]);
						change_board_id(matches[i], 0);
					}
					
					fall_timer = 250;
				}
			}
			
			gain_match(total_matches);
			ready_next = total_matches == 0;
			tried_drops = true;
			check_next_fall = false;
			// console.log("checked and ready", total_matches);
		}
		
		if (!tried_drops && !ready_next) {
			check_next_fall = true;
			fall_timer = 100;
		}
	} else if (fall_timer != -1) {
		fall_timer -= 100;
	}
	
	setTimeout(function() {
		cause_falling_bejs(locations);
	}, 100);
}


function fill_with_jewels() {
	// Randomly select a jewel for the location. If it would create matches, re-randomise.
	/*
	for (var id=bejs.length - 1; id>=0; id--) {
		var gemId = id % 2 + 1;
		change_board_id(id, gemId);
	}
	*/
	for (var id=bejs.length - 1; id>=0; id--) {
		var gemId = Math.floor(Math.random() * 7) + 1;
		change_board_id(id, gemId);
		
		while (check_for_matches(id).length >= 3) {
			var gemRst = Math.floor(Math.random() * 7) + 1;
			change_board_id(id, gemRst);
		}
	}
}


function update_time() {
	time += 1;
	localtime += 1;
	
	localStorage.setItem("time", time);
	
	document.getElementById("session-time").textContent = localtime.toString().toHHMMSS();
	document.getElementById("all-time").textContent = time.toString().toDDHHMMSS();
}


document.addEventListener('DOMContentLoaded', function() {
	const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	const height = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
	
	bejs_horizontal = Math.floor(width / 64);
	board_length = bejs_horizontal;
	bejs_vertical = Math.floor(height / 64);
	console.log(width, height, bejs_horizontal, bejs_vertical, width / 64, height / 64);
	
	bej_grid = document.getElementById("bej");
	for (var y=0; y<bejs_vertical; y++) {
		for (var x=0; x<bejs_horizontal; x++) {
			var img = document.createElement("img");
			// img.src = get_icon((y + (x % 2)) % 7 + 1);
			// var gemId = Math.floor(Math.random() * 7) + 1;
			gemId = 0;
			
			img.src = get_icon(gemId);
			img.className = "bej-object";
			img.id = bejs.length;
			img.setAttribute('draggable', false);
			
			bej_grid.appendChild(img);
			
			bejs.push(img);
			// board_state.push((y + (x % 2)) % 7 + 1);
			board_state.push(gemId);
			
			img.onmousedown = function() {
				select_bej(this);
			};
			
			img.onmouseup = function() {
				select_bej(this);
			};
			
			img.onmouseover = function() {
				select_bej(this, true);
			};
			
			// mobile compat
			img.onclick = function() {
				select_bej(this);
			}
		}
	}
	
	document.getElementById("highscore-num").textContent = highscore.toLocaleString();
	
	// Need to make sure that every single img icon has an onclick corresponding to their ID (to select it)
	
	// start = document.getElementsByClassName("bej-object")[35];
	// end = document.getElementsByClassName("bej-object")[51];
	
	// show_anim(start, end, 35, 51);
	fill_with_jewels();
	
	cause_falling_bejs();
	document.getElementById("session-time").textContent = localtime.toString().toHHMMSS();
	document.getElementById("all-time").textContent = time.toString().toDDHHMMSS();
	setInterval(update_time, 1000);
}, false);