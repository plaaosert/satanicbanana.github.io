relic_divs = []
imp_types = ("", "-good", "-neutral")


function do_search_term(e) {
	var val = typeof e == "string" ? e : e.target.value;
	// For now, filter by name or effect. If "name:()" or "effect:()", only look at that.
	var query_tokens = val.match(/(\w)+:?|\"(\w| )+\"/gm);
	var valid_relics = Array.from(Array(40).keys());
	
	if (query_tokens != null) {
		name_tokens = []
		effect_tokens = []
		wildcard_tokens = []
		
		// Get name, effect and wildcard tokens.
		prev_token = ""
		for (i=0; i<query_tokens.length; i++) {
			clean_token = query_tokens[i].replace("\"", "").toLowerCase();
			
			if (clean_token != "name:" && clean_token != "effect:") {
				if (prev_token == "name:") {
					name_tokens.push(clean_token);
				} else if (prev_token == "effect:") {
					effect_tokens.push(clean_token);
				} else {
					wildcard_tokens.push(clean_token);
				}
			}
			
			prev_token = clean_token
		}
		
		for (i=0; i<name_tokens.length; i++) {
			for (rid=valid_relics.length - 1; rid >= 0; rid--) {
				if (!relics[valid_relics[rid]].name.toLowerCase().includes(name_tokens[i])) {
					valid_relics.splice(rid, 1);
				}
			}
		}
		
		for (i=0; i<effect_tokens.length; i++) {
			for (rid=valid_relics.length - 1; rid >= 0; rid--) {
				if (!relics[valid_relics[rid]].effect_text.toLowerCase().includes(effect_tokens[i])) {
					valid_relics.splice(rid, 1);
				}
			}
		}
		
		for (i=0; i<wildcard_tokens.length; i++) {
			for (rid=valid_relics.length - 1; rid >= 0; rid--) {
				if (!relics[valid_relics[rid]].name.toLowerCase().includes(wildcard_tokens[i]) && !relics[valid_relics[rid]].effect_text.toLowerCase().includes(wildcard_tokens[i])) {
					valid_relics.splice(rid, 1);
				}
			}
		}
	}
	
	for (relic_id=0; relic_id<relics.length; relic_id++) {
		if (valid_relics.includes(relic_id)) {
			relic_divs[relic_id].style.display = "block";
		} else {
			relic_divs[relic_id].style.display = "none";
		}
	}
	
	if (window.performance) {
		window.history.replaceState({}, "", "?search=" + val);
	}
};


document.addEventListener('DOMContentLoaded', function() {
	// <div class="relic-entry">
	// 	<h2>Charge Battery >> <span class="info">Obtain from <span class="important">Achievement</span>: <span class="name">Cock</span></span></h2>
	// 	<p class="relic-info">Every turn you remain alive, gain **+2** all primary stats. When you die, lose **-7** all primary stats.</p>
	// 	<p class="relic-flavour">It works great until you leave it unattended, at which point it inexplicably explodes just out of sight.</p>
	// </div>
	
	for (var i=0; i<relics.length; i++) {
		var div = document.createElement("div");
		div.className = "relic-entry";
		div.id = relics[i].name;
	 
		var header = document.createElement("h2");
		header.textContent = relics[i].name;
		
		div.appendChild(header);
		
		var header2 = document.createElement("h3");
		
		var info_span = document.createElement("span");
		info_span.className = "";
		info_span.textContent = "Obtain from ";
		
		var imp_span = document.createElement("span");
		imp_span.className = "info";
		imp_span.textContent = relics[i].relic_get_type;
	
		var colon = document.createElement("span");
		colon.textContent = ": ";
		
		var name_span = document.createElement("span");
		name_span.className = "name";
		name_span.textContent = relics[i].relic_get_sub;
	 
	 	header2.appendChild(info_span);
		header2.appendChild(imp_span);
		header2.appendChild(colon);
		header2.appendChild(name_span);
	 
		div.appendChild(header2);
		
		var info_p = document.createElement("p");
		info_p.className = "relic-info";
		relic_segs = relics[i].effect_text.split("**");
		imp = false;
		for (var seg=0; seg<relic_segs.length; seg++) {
			subspan = document.createElement("span");
			append = "-neutral";
			if (relic_segs[seg].charAt(0) == "+") {
				append = "-good";
			} else if (relic_segs[seg].charAt(0) == "-") {
				append = "";
			}
			
			subspan.className = imp ? "important" + append : "";
			
			subspan.textContent = relic_segs[seg];
			
			info_p.appendChild(subspan);
			imp = !imp;
		}
		
		var flavour_p = document.createElement("p");
		flavour_p.className = "relic-flavour";
		flavour_p.textContent = relics[i].flavour_text;
	 
		div.appendChild(info_p);
		div.appendChild(flavour_p);
	 
		relic_divs.push(div);
		document.getElementById("relic-list").appendChild(div);
	}
	
	var url = new URL(window.location.href);
	var search = url.searchParams.get("search");
	
	if (window.performance) {
		if (window.performance.navigation.type == performance.navigation.TYPE_RELOAD) {
			window.history.replaceState(null, null, window.location.pathname);
			search = null;
		}
	}
	
	if (search) {
		do_search_term(search);
		document.getElementById("search-box").value = search;
	}
	
	document.getElementById("search-box").oninput = do_search_term;
}, false);