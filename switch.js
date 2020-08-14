let switch_txt = document.getElementById('switch-content');

// Invoked to run a function that hides a transition then disposes of itself.
cvg = 0;
process = 0;
cnv = "";
intv = null;


function add_mutation(txt, coverage) {
	for (i=0; i<txt.length; i++) {
		ch = txt[i];
		rnd_s = Math.random()
		
		if (ch != "\n") {
			if ((ch == " " && rnd_s <= coverage) || rnd_s <= coverage / 50) {
				txt = txt.replace_at(i, coverage - Math.random() >= Math.random() ? "█" : alphabet[Math.floor(Math.random() * alphabet.length)]);
			}
			else if (coverage - Math.random() >= 1)
				txt = txt.replace_at(i, "█");
		}
	}
	
	return txt;
}


function remove_mutation(txt, coverage) {
	for (i=0; i<txt.length; i++) {
		ch = txt[i];
		if (ch != "\n") {
			if (ch != " " && Math.random() <= coverage) {
				txt = txt.replace_at(i, " ");
			}
			else if (Math.random() <= (1 - coverage) / 250) {
				txt = txt.replace_at(i, alphabet[Math.floor(Math.random() * alphabet.length)]);
			}
		}
	}
	
	return txt;
}


function init_empty_canvas() {
	return (" ".repeat(210) + "\n").repeat(10);
}


function start_switch(id_old, id_new) {
	clearInterval(intv);
	cnv = init_empty_canvas();
	intv = setInterval(function() { switch_main(id_old, id_new); }, 1000/60);
	process = 0;
	cvg = 0;
}


function switch_main(id_old, id_new) {
	// lerp cvg to 100 very quickly, set to 0 again then lerp to 100 for removal slower
	if (process == 0) {
		cvg += (2.2 - cvg) * 0.05;
		
		cnv = add_mutation(cnv, cvg);
		
		if (cvg >= 2.1) {
			if (id_old != null) {
				document.getElementById(id_old).style.display = "none";
				clearInterval(main_intervals[id_old]);
				main_intervals[id_old] = null;
			}
			
			if (id_new != null) {
				// don't start another if it is already running
				if (main_intervals[id_new] == null) {
					document.getElementById(id_new).style.display = "inline";
					start_funcs[id_new]();
				}
			}
			
			cvg = 0;
			process = 1;
		}
	}
	else {
		cvg += (2.2 - cvg) * 0.003;
		
		cnv = remove_mutation(cnv, cvg);
		
		if (cvg >= 1.2) {
			clearInterval(intv);
		}
	}
	
	switch_txt.textContent = cnv;
}
