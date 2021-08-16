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
	"empty", "blue", "green", "orange", "purple", "red", "white", "yellow", "4-in-a-row", "5-in-a-row"
]

add_classes = [
	"normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "four-row", "five-row"
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
dragging = false;
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


// https://stackoverflow.com/questions/6229197/how-to-know-if-two-arrays-have-the-same-values/55614659#55614659
function arrays_contain_same(a1, a2) {
  const super_set = {};
  for (const i of a1) {
    const e = i + typeof i;
    super_set[e] = 1;
  }

  for (const i of a2) {
    const e = i + typeof i;
    if (!super_set[e]) {
      return false;
    }
    super_set[e] = 2;
  }

  for (let e in super_set) {
    if (super_set[e] === 1) {
      return false;
    }
  }

  return true;
}


function array_contains_same_children(a, child) {
	for (var i=0; i<a.length; i++) {
		if (arrays_contain_same(a[i], child)) {
			return true;
		}
	}
	
	return false;
}


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
	return cols[typeof(id) == "String" ? parseInt(id) : id] + sprites[sel_sprite] + (id >= 8 ? ".gif" : ".png");
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
			fall_timer = 0;
			clearInterval(anim_obj.fn);
			
			anim_obj.start_img.remove();
			anim_obj.end_img.remove();
			
			anim_obj.start.style.visibility = "visible";
			anim_obj.end.style.visibility = "visible";
			
			setTimeout(function() {
				animation_stack.pop();
				
				if (!do_not_backtrack || just_check_matches) {
					var matches = check_for_matches(anim_obj.id1, anim_obj.id2, true);
					
					if (matches.length <= 0) {
						if (!just_check_matches) {
							fall_timer = 125;
							show_swap_anim(anim_obj.end, anim_obj.start, anim_obj.id2, anim_obj.id1, true)
						}
					} else {
						// clear all matches and id1, id2
						var total_tiles = 0;
						var total_matches = []
						var supergem_locs = [];
						
						for (var i=0; i<matches.length; i++) {
							var matches_arr = matches[i].matches;
							if (!array_contains_same_children(total_matches, matches_arr)) {
								total_matches.push(matches_arr);
								total_tiles += matches_arr.length;
								// also add supergem here
								if (matches[i].normal) {
									if (matches_arr.length == 4) {
										supergem_locs.push([matches_arr[matches_arr.length - 1], 8]);
									} else if (matches_arr.length >= 5) {
										supergem_locs.push([matches_arr[matches_arr.length - 1], 9]);
									}
								}
							}
						}
						
						for (var i=0; i<total_matches.length; i++) {
							for (var j=0; j<total_matches[i].length; j++) {
								var bej_id = total_matches[i][j];
								
								if (!supergem_locs.includes(bej_id)) {
									show_disappearing_obj(bejs[bej_id]);
									change_board_id(bej_id, 0);
								}
							}
						}
						
						for (var i=0; i<supergem_locs.length; i++) {
							change_board_id(supergem_locs[i][0], supergem_locs[i][1]);
						}
						
						gain_match(total_tiles);
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
	
	change_board_id(id1, board_state[id2]);
	change_board_id(id2, buffer);
}


function change_board_id(id, to) {
	board_state[id] = to;
	bejs[id].src = get_icon(board_state[id]);
	bejs[id].className = "bej-object";
	bejs[id].classList.add(add_classes[to]);
}


function is_adjacent(a, b) {
	// a and b are adjacent if their difference is 1 or board_length
	var diff = Math.abs(a - b);
	if (a < board_length || b < board_length) {
		return false;
	}
	
	return diff == board_length || (diff == 1 && Math.floor(a / board_length) == Math.floor(b / board_length));
}


function is_indirectly_adjacent(a, b) {
	var diff = Math.abs(a - b);
	var row_diff = Math.abs(Math.floor(a / board_length) - Math.floor(b / board_length));
	
	if (a < board_length || b < board_length) {
		return false;
	}
	
	if (diff == 1 && row_diff == 0) {
		return true;
	} else if (Math.abs(board_length - diff) <= 1 && row_diff == 1) {
		return true;
	}
	
	return false;
}


function get_board(index) {
	if (index >= 0 && index < board_state.length) {
		return board_state[index];
	} else {
		return -1;
	}
}


function is_matchable_gem(typ) {
	return typ > 0 && typ < 8;
}


function check_match_line(center, offset) {
	var connected = {normal: true, matches: []};
	var type_check = get_board(center)
	
	var count = center + offset;
	var last = center;
	
	while (get_board(count) == type_check && is_matchable_gem(get_board(count))) {
		if (!is_adjacent(last, count) || count < board_length) {
			break;
		}
		
		last = count;
		connected.matches.push(count);
		count += offset;
	}
	
	count = center - offset;
	last = center;
	while (get_board(count) == type_check && is_matchable_gem(get_board(count))) {
		if (!is_adjacent(last, count) || count < board_length) {
			break;
		}
		
		last = count;
		connected.matches.push(count);
		count -= offset;
	}
	
	if (connected.matches.length < 2) {
		return null;
	} else {
		connected.matches.push(center);
	}
	
	return connected;
}


function check_special_behaviour(center, other, ignore) {
	var type_check = get_board(center);
	var t = {normal: false, matches: []};
	
	if (type_check == 8) {
		// match all adjacent
		for (var x=-1; x<=1; x++) {
			for (var y=-1; y<=1; y++) {
				var loc = center + x + (y * board_length);
				if (get_board(loc) > 0 && is_indirectly_adjacent(center, loc)) {
					if (get_board(loc) == 8) {
						var ignore_new = ignore;
						if (!ignore) {
							ignore_new = {};
						}

						if (!ignore_new[loc]) {
							ignore_new[loc] = true;
							t.matches = t.matches.concat(check_special_behaviour(loc, undefined, ignore_new).matches);
						}
					}						

					t.matches.push(loc);
				}
			}
		}
		
		t.matches.push(center);
	} else if (type_check == 9) {
		var type_check_other = get_board(other);
		var random_bej = 1;
		console.log(random_bej);
		
		for (var loc_id=0; loc_id<board_state.length; loc_id++) {
			if (type_check_other == 8) {
				if (Math.random() < 0.05) {
					show_disappearing_obj(bejs[loc_id]);
					change_board_id(loc_id, type_check_other);
				}
			}
			else if (type_check_other == 9) {
				if (Math.random() < 0.22) {
					show_disappearing_obj(bejs[loc_id]);
					change_board_id(loc_id, random_bej);
				}
			}
			else {
				if (type_check_other == get_board(loc_id)) {
					t.matches.push(loc_id);
				}
			}
		}
		
		t.matches.push(center);
	} else {
		return null;
	}
	
	return t;
}


// does not wrap anymore :)
function check_for_matches(center1, center2, include_special) {
	var total_matches = []
	
	var arr = [center1, center2];
	for (var i=0; i<2; i++) {
		var a = arr[i];
		var b = arr[1 - i];
		
		if (get_board(a + board_length) != 0) {
			var match = check_match_line(a, 1);
			if (match) {
				total_matches.push(match);
			}
			
			var match = check_match_line(a, board_length);
			if (match) {
				total_matches.push(match);
			}
			
			if (include_special) {
				var match = check_special_behaviour(a, b);
				if (match) {
					total_matches.push(match);
				}
			}
		}
	};
	
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
				
			selected_bej.classList.remove("bej-object-selected");
			selected_bej = null;
		} else if (!over) {
			bej.classList.add("bej-object-selected");
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
			var total_matches = [];
			var total_tiles = 0;
			var supergem_locs = [];
			
			for (var loc_id=0; loc_id<board_state.length; loc_id++) {
				var matches = check_for_matches(loc_id);
							
				if (matches.length > 0) {
					for (var i=0; i<matches.length; i++) {
						var matches_arr = matches[i].matches;
						if (!array_contains_same_children(total_matches, matches_arr)) {
							total_matches.push(matches_arr);
							total_tiles += matches_arr.length;
							
							// also add supergem here
							if (matches[i].normal) {
								if (matches_arr.length == 4) {
									supergem_locs.push([matches_arr[matches_arr.length - 1], 8]);
								} else if (matches_arr.length >= 5) {
									supergem_locs.push([matches_arr[matches_arr.length - 1], 9]);
								}
							}
						}
					}
				}
			}
						
			for (var i=0; i<total_matches.length; i++) {
				for (var j=0; j<total_matches[i].length; j++) {
					var bej_id = total_matches[i][j];
					
					if (!supergem_locs.includes(bej_id)) {
						show_disappearing_obj(bejs[bej_id]);
						change_board_id(bej_id, 0);
					}
				}
			}
			
			for (var i=0; i<supergem_locs.length; i++) {
				change_board_id(supergem_locs[i][0], supergem_locs[i][1]);
			}

			gain_match(total_tiles);
			ready_next = total_tiles == 0;
			tried_drops = true;
			check_next_fall = false;
			// console.log("checked and ready", total_matches);
		}
		
		if (!tried_drops && !ready_next) {
			check_next_fall = true;
			fall_timer = 125;
		}
	} else if (fall_timer != -1) {
		fall_timer -= 125;
	}
	
	setTimeout(function() {
		cause_falling_bejs(locations);
	}, 125);
}


function fill_with_jewels() {
	// Randomly select a jewel for the location. If it would create matches, re-randomise.
	/*
	for (var id=bejs.length - 1; id>=0; id--) {
		var gemId = id % 3 + 1;
		change_board_id(id, gemId);
	}
	
	return;
	*/
	
	for (var id=bejs.length - 1; id>=0; id--) {
		var gemId = Math.floor(Math.random() * 7) + 1;
		change_board_id(id, gemId);
		
		while (check_for_matches(id).length > 0) {
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
	bej_grid.draggable = false;
	
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
				dragging = true;
			};
			
			img.onmouseup = function() {
				setTimeout(function() { dragging = false; }, 10);
			};
			
			img.onmouseover = function() {
				if (dragging) {
					select_bej(this, true);
					setTimeout(function() { dragging = false; }, 10);
				}
			};
			
			// mobile compat
			img.onclick = function() {
				if (!dragging) {
					select_bej(this);
				}
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
	
	document.onkeydown = function(e) {
		switch(e.which) {
			case 219: // [
				// set to 4-row
				change_board_id(selected_bej.id, 8);
				selected_bej = null;
				break;
				
			case 221: // ]
				// set to 5-row
				change_board_id(selected_bej.id, 9);
				selected_bej = null;
				break;

			default: return; // exit handler
		}
	};
}, false);