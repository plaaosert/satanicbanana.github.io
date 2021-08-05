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
board_length = 0
board_state = []
bejs = []
selected_bej = null;


function get_icon(id) {
	return cols[typeof(id) == "String" ? parseInt(id) : id] + sprites[sel_sprite] + ".png";
}


function update_icons() {
	for (var i=0; i<bejs.length; i++) {
		bejs[i].src = get_icon(board_state[i]);
	}
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
	
	var start_rect = start.getBoundingClientRect();
	var end_rect = end.getBoundingClientRect();
	
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
	
	anim_obj.fn = setInterval(function() {
		anim_obj.start_img.style.left = parseFloat(anim_obj.start_img.style.left.replace("px", "")) + anim_obj.steps_left + "px";
		anim_obj.end_img.style.left = parseFloat(anim_obj.end_img.style.left.replace("px", "")) - anim_obj.steps_left + "px";
		
		anim_obj.start_img.style.top = parseFloat(anim_obj.start_img.style.top.replace("px", "")) + anim_obj.steps_top + "px";;
		anim_obj.end_img.style.top = parseFloat(anim_obj.end_img.style.top.replace("px", "")) - anim_obj.steps_top + "px";;
		
		anim_obj.steps += 1;
		
		if (anim_obj.steps >= 10) {
			clearInterval(anim_obj.fn);
			
			anim_obj.start.style.visibility = "visible";
			anim_obj.end.style.visibility = "visible";
			
			swap_board_ids(anim_obj.id1, anim_obj.id2);
			
			anim_obj.start_img.remove();
			anim_obj.end_img.remove();
		}
	}, 20 / mul);
	
	setTimeout(function() {
		animation_stack.pop();
		
		if (!do_not_backtrack || just_check_matches) {
			var matches = check_for_matches(anim_obj.id1, anim_obj.id2);
			
			if (matches.length < 3) {
				if (!just_check_matches) {
					show_swap_anim(anim_obj.end, anim_obj.start, anim_obj.id2, anim_obj.id1, true)
				}
			} else {
				// clear all matches and id1, id2
				for (var i=0; i<matches.length; i++) {
					change_board_id(matches[i], 0);
				}
				
				fall_timer = 250;
			}
		}
	}, 250 / mul);
	
	document.body.appendChild(start_img);
	document.body.appendChild(end_img);
	start.style.visibility = "hidden";
	end.style.visibility = "hidden";
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
	return diff == board_length || diff == 1;
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
	while (get_board(count) == type_check) {
		connected.push(count);
		if (count % board_length == board_length - 1 && ((count + offset) % board_length == 0)) {
			break;
		}
		
		count += offset;
	}
	
	var count = center - offset;
	while (get_board(count) == type_check) {
		connected.push(count);
		if (count % board_length == 0 && ((count - offset) % board_length == board_length - 1)) {
			break;
		}
		
		count -= offset;
	}
	
	if (connected.length < 2) {
		connected = [];
	} else {
		connected.push(center);
	}
	
	return connected;
}


function check_for_matches(center1, center2) {
	var total_matches = []
	
	if (get_board(center1 + board_length) != -1) {
		total_matches = total_matches.concat(check_match_line(center1, 1));
		total_matches = total_matches.concat(check_match_line(center1, board_length));
	}
	
	if (center2 && get_board(center2 + board_length) != -1) {
		total_matches = total_matches.concat(check_match_line(center2, 1));
		total_matches = total_matches.concat(check_match_line(center2, board_length));
	}
	
	return total_matches
}


function select_bej(bej) {
	if (get_board(bej.id) != 0 && animation_stack.length == 0) {
		if (selected_bej != null) {
			if (selected_bej.id != bej.id && is_adjacent(selected_bej.id, bej.id)) {
				show_swap_anim(selected_bej, bej, parseInt(selected_bej.id), parseInt(bej.id));
			}
				
			selected_bej.className = "bej-object";
			selected_bej = null;
		} else {
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
	var spawned_here = false;
	for (var i=0; i<board_length; i++) {
		// For each column, activate a swap if necessary (empty below non-empty)
		for (var loc=bejs_vertical - 1; loc>0; loc--) {
			var loc_resolved = i + (board_length * loc);
			
			if (get_board(loc_resolved) == 0 && get_board(loc_resolved - board_length) > 0) {
				show_swap_anim(bejs[loc_resolved - board_length], bejs[loc_resolved], loc_resolved - board_length, loc_resolved, false, 4, true);
			}
		}
		
		if (get_board(i) == 0 && spawned_last < 0) {
			change_board_id(i, Math.floor(Math.random() * 7) + 1);
			spawned_here = true;
		}
	}
	
	if (spawned_here) {
		spawned_last = 3;
	} else {
		spawned_last--;
	}
	
	setTimeout(function() {
		cause_falling_bejs(locations);
	}, 70);
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
			
			bej_grid.appendChild(img);
			
			bejs.push(img);
			// board_state.push((y + (x % 2)) % 7 + 1);
			board_state.push(gemId);
			
			img.onclick = function() {
				select_bej(this);
			};
		}
	}
	
	// Need to make sure that every single img icon has an onclick corresponding to their ID (to select it)
	
	// start = document.getElementsByClassName("bej-object")[35];
	// end = document.getElementsByClassName("bej-object")[51];
	
	// show_anim(start, end, 35, 51);
	cause_falling_bejs();
}, false);