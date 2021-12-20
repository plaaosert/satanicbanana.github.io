playing_audio = null;
player = document.getElementById("music-player");
subsecs_chars = " -=%"

function play_music() {
	if (playing_audio != null) {
		playing_audio.pause();
		playing_audio.currentTime = 0;
		playing_audio = null;
	} else {
		player = document.getElementById("music-player");
		playing_audio = new Audio('ocean.mp3');
		playing_audio.play();
		playing_audio.loop = true;
		playing_audio.volume = 0.27;
		setInterval(update_timer, 0.25);
		update_timer();
	}
}

function pad_two_zeroes(text) {
	return ('00' + text).slice(-2);
}

function convert_to_human(time) {
	var rounded_time = Math.round(time);
	var mins = Math.floor(rounded_time / 60);
	var secs = rounded_time % 60;
	
	return pad_two_zeroes(mins.toString()) + ":" + pad_two_zeroes(secs.toString());
}

function write_playing_bar(current, max, bar_fill, empty_fill, subsec) {
	player.textContent = convert_to_human(current);
	player.textContent += " [";
	player.textContent += "#".repeat(bar_fill);
	player.textContent += subsecs_chars[subsec];
	player.textContent += " ".repeat(empty_fill);
	player.textContent += "] ";
	player.textContent += convert_to_human(max);
}

// should ping 4 times a second
function update_timer() {
	if (playing_audio != null) {
		// bar length is 30.
		// get proportion of bar that should be filled, multiply by 30, floor
		// get subproportion of bar (multiply by 120, round, mod 4)
		// fill rest with nbsps
		var proportion = playing_audio.currentTime / playing_audio.duration;
		console.log(proportion);
		var bar_fill = Math.floor(proportion * 30);
		console.log(bar_fill);
		var subproportion = Math.floor(proportion * 120) % 4;
		console.log(subproportion);
		
		write_playing_bar(playing_audio.currentTime, playing_audio.duration, bar_fill, 29 - bar_fill, subproportion);
	}
}