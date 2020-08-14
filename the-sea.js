let ocean_txt = document.getElementById('ocean-content');

// The ocean is stored as a list of strings which is combined into one string (replacing \n with <br>) when rendered.
// It is rendered internally in 210x8 resolution, which is enough to cover a 4K monitor.
// Like all canvas renderers, it simply replaces the text.

ocean_time = Math.floor(Math.random() * 2000);

function init_populate_ocean() {
	// Create 12 lists of 210 chars each and get an ocean slice for every ocean time value needed.
	ocean_base = get_ocean_slices(ocean_time, ocean_time + 210);
	
	ocean_time += 210;
	return ocean_base;
}


function get_ocean_slice(xr) {
	x = xr / 5;
	c = Math.cos(0.2 * x) + Math.sin(0.3 * x) * Math.sin(0.23 * x);
	y = -Math.floor(2 * c * Math.sin(x)) + 3;
	
	// Returns a list of chars which can then be populated into the ocean.
	cont_list = []
	for (i=0; i<10; i++) {
		if (Math.random() <= 0.002) {
			cont_list.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
		else {
			if (i == y)
				cont_list.push("#");
			else if (i > y)
				cont_list.push(".");
			else
				cont_list.push(" ");
		}
	}
	
	return cont_list;
}


function mutate_text(txt) {
	for (i=0; i<txt.length; i++) {
		ch = txt[i];
		if (("#. ").includes(ch) && Math.random() <= (0.0002 + ((ocean_time % 1200) / 1200000))) {
			txt = txt.replace_at(i, alphabet[Math.floor(Math.random() * alphabet.length)]);
		}
	}
	
	return txt;
}


function get_ocean_slices(x1, x2) {
	cont_list = [
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
	
	for (xr=x1; xr<x2; xr++) {
		x = xr / 5;
		c = Math.cos(0.2 * x) + Math.sin(0.3 * x) * Math.sin(0.23 * x);
		y = -Math.floor(2 * c * Math.sin(x)) + 3;
		
		// Returns a list of chars which can then be populated into the ocean.
		for (i=0; i<10; i++) {
			if (Math.random() <= 0.002) {
				cont_list[i] += alphabet[Math.floor(Math.random() * alphabet.length)];
			}
			else {
				if (i == y)
					cont_list[i] += "#";
				else if (i > y)
					cont_list[i] += ".";
				else
					cont_list[i] += " ";
			}
		}
	}
	
	return cont_list;
}


function update_ocean_slices() {
	// edits in place
	// get the new slice
	slice = get_ocean_slice(ocean_time);
	ocean_time++;
	
	// for every line in content, remove the first char and add the slice char
	for (i=0; i<10; i++) {
		ocean_content[i] = ocean_content[i].slice(1) + slice[i];
	}
	
	raw_txt = unpack_content_to_text(ocean_content);
	
	ocean_txt.textContent = mutate_text(raw_txt);
}


function unpack_content_to_text(content) {
	// Join every line with \n
	return content.join("\n");
}


function begin_ocean() {
	ocean_content = init_populate_ocean();
	ocean_txt.textContent = unpack_content_to_text(ocean_content);
	main_intervals["ocean"] = setInterval(update_ocean_slices, 1000/15);
}


begin_ocean();
start_funcs["ocean"] = begin_ocean;