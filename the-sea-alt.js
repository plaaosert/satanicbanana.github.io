a_ocean_txt = document.getElementById('ocean-content-alt');

// The a_ocean is stored as a list of strings which is combined into one string (replacing \n with <br>) when rendered.
// It is rendered internally in 210x10 resolution, which is enough to cover a 4K monitor.
// Like all canvas renderers, it simply replaces the text.

a_ocean_waves = []

function init_populate_a_ocean() {
	// Create 12 lists of 210 chars each and get an a_ocean slice for every a_ocean time value needed.
	a_ocean_waves = []
	
	for (var i=0; i<210; i++) {
		propagate_a_ocean_waves();
	}
	
	var a_ocean_base = get_a_ocean_slices();
	
	return a_ocean_base;
}


function propagate_a_ocean_waves() {
	// Each wave moves at a speed determined by the wave.
	for (var i=a_ocean_waves.length - 1; i>-1; i--) {
		var wave = a_ocean_waves[i];
		
		a_ocean_waves[i].location += wave.speed;
		a_ocean_waves[i].amplitude *= 0.998;
		if ((wave.location > 260 && wave.speed > 0) || (wave.location < -60 && wave.speed < 0)) {
			a_ocean_waves.splice(i, 1);
		}
	}
	
	// We may add a new wave.
	if (Math.random() < 0.03) {
		var first_wave = {
			location: 0,
			speed: Math.random() * 1 + 0.5,
			width: Math.random() * 5 + 8,
			amplitude: Math.random() * -1 - 1
		};
		
		for (var i=1; i<2; i++) {
			a_ocean_waves.push({
				location: -first_wave.width * i,
				speed: first_wave.speed,
				width: first_wave.width,
				amplitude: (first_wave.amplitude * ((6 - i) / 6)) * ((-1) ** i)
			});
		}
		
		a_ocean_waves.push(first_wave);
	}
	
	// The other direction?
	if (Math.random() < 0.03) {
		var first_wave = {
			location: 210,
			speed: Math.random() * -1 - 0.5,
			width: Math.random() * 5 + 8,
			amplitude: Math.random() * -1 - 1
		};
		
		for (var i=1; i<2; i++) {
			a_ocean_waves.push({
				location: 210 + (first_wave.width * i),
				speed: first_wave.speed,
				width: first_wave.width,
				amplitude: (first_wave.amplitude * ((6 - i) / 6)) * ((-1) ** i)
			});
		}
		
		a_ocean_waves.push(first_wave);
	}
}


function sum_all_waves_at_pos(x) {
	// If within width, return normalised sin value multiplied by amplitude
	var total = 0;
	for (var i=0; i<a_ocean_waves.length; i++) {
		var wave = a_ocean_waves[i];
		
		position_rel = Math.abs(x - wave.location);
		if (position_rel <= wave.width) {
			// Multiply x by pi then divide by (2 * wave.width). Apply cos(). Multiply result by wave.amplitude.
			total += Math.cos((position_rel * Math.PI) / (2 * wave.width)) * wave.amplitude;
		}
	}
	
	return total;
}


function get_a_ocean_slices() {
	var cont_list = [
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		""
	];
	
	for (var xr=209; xr>=0; xr--) {
		var y = sum_all_waves_at_pos(xr) + 5;
		// console.log(y);
		
		// Returns a list of chars which can then be populated into the a_ocean.
		for (var i=0; i<10; i++) {
			if (i == Math.ceil(y))
				cont_list[i] += "#";
			else if (i > y)
				cont_list[i] += "\xa0";
			else
				cont_list[i] += "\xa0";
		}
	}
	
	return cont_list;
}


function update_a_ocean_slices() {
	propagate_a_ocean_waves();
	
	var raw_txt = unpack_content_to_text(get_a_ocean_slices());
	
	a_ocean_txt.textContent = mutate_text(raw_txt);
}


function unpack_content_to_text(content) {
	// Join every line with \n
	return content.join("\n");
}


function begin_a_ocean() {
	a_ocean_content = init_populate_a_ocean();
	a_ocean_txt.textContent = unpack_content_to_text(a_ocean_content);
	main_intervals["ocean-alt"] = setInterval(update_a_ocean_slices, 1000/15);
}


start_funcs["ocean-alt"] = begin_a_ocean;