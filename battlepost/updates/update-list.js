update_divs = [];
update_names = [];
update_ids = [];
imp_types = [
	"icons/HUGE.png", "icons/tick.png", "icons/neutral.png", "icons/cross.png", "icons/question.png", "icons/cat.png"
];


hide_lists = [];


var_names = [
	{name:"id", subname: "name"},
	{name:"date"},
	{name:"flavour"},
	{name:"categories", nested: [
		{name:"name"},
		{name:"changes", nested: [
			{name:"type", func: (a) => imp_types[a]},
			{name:"text"},
		]},
	]},
];


class_names = [
	{name:"update-title", subname: "update-id"},
	{name:"update-date"},
	{name:"update-flavour"},
	{name:"update-category", elem:"div", nested: [
		{name:"update-cat-name", make_hide_next:true},
		{name:"update-cat-listing", go_hide_next:true, elem:"div", nested: [
			{name:"floating-update-entry", elem:"div", surround_nested:true, nested: [
				{name:"floating-update-img", elem:"img", target:"src"},
				{name:"floating-update-text"},
			]},
		]},
	]},
];


function toggle_hiding(hide_list) {
	for (var i=0; i<hide_list.elems.length; i++) {
		if (hide_list.status) {
			hide_list.elems[i].style.display = "block";
		} else {
			hide_list.elems[i].style.display = "none";
		}
	}
	
	hide_list.status = !hide_list.status;
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	}
	else if (document.selection) {
		document.selection.empty();
	}
	hide_list.root.textContent = hide_list.status ? " [+]" : " [-]";
}


function parse_effect_string_to_container(str, container) {
	var segs = str.split(/(\*\*|`)/);
	var imp = false;
	var last_seg = "";
	for (var seg=0; seg<segs.length; seg++) {
		var cur_seg = segs[seg];
		
		if (cur_seg == "**" || cur_seg == "`") {
			imp = !imp;
		}
		else {
			var subspan = document.createElement("span");
			var append = "-neutral";
			if (cur_seg.charAt(0) == "+") {
				append = "-good";
			} else if (cur_seg.charAt(0) == "-") {
				append = "";
			}
			
			if (last_seg == "`") {
				append = "-codeblock";
			} 
			
			subspan.className = imp ? "important" + append : "";
			
			subspan.textContent = cur_seg;
			
			container.appendChild(subspan);
		}
		last_seg = cur_seg;
	}
}


function navigate_div_create(update, div, vnames, cnames, orig_update) {
	// We rely on cnames and vnames being the same size, all the time. 
	// surround_nested allows us to ignore nesting levels of classes when we need to surround things in a class.
	// console.log("func begin", update, div, vnames, cnames);	
	var hide_link = null;
	
	for (var i=0; i<cnames.length; i++) {
		// For each variable in our list, make a p, set its content to whatever necessary
		var vname = vnames[i];
		var cname = cnames[i];
		// console.log("loop begin", i, vname, cname, cname == undefined ? "no cname" : cname.surround_nested);
		
		// If cname has surround_nested, we need to recurse inwards on cnames after creating the div and do nothing else.
		if (cname.surround_nested) {
			if (Array.isArray(update)) {
				for (var j=0; j<update.length; j++) {
					var elem = document.createElement(cname.elem == null ? "p" : cname.elem);
					elem.className = cname.name;
					
					// console.log("placing", elem, "in", div, "(nested", j, ")");
					div.appendChild(elem);
					
					navigate_div_create(update[j], elem, vnames, cname.nested, orig_update);
				}
			}
			else {
				var elem = document.createElement(cname.elem == null ? "p" : cname.elem);
				elem.className = cname.name;
				
				// console.log("placing", elem, "in", div, "(nested)");
				div.appendChild(elem);
				
				navigate_div_create(update, elem, vnames, cname.nested, orig_update);
			}
		}
		else {
			if (vname.nested) {
				// console.log("update start nested", update[vname.name]);
				var ref_update = update[vname.name];
				
				var hide_list = {};
				if (hide_link && cname.go_hide_next) {
					hide_list.related_id = orig_update.id;
					hide_list.root = hide_link;
					hide_list.status = true;
					hide_list.elems = [];
					hide_lists.push(hide_list);
				}
				
				for (var j=0; j<ref_update.length; j++) {
					ref_update_part = ref_update[j];
					
					// console.log("update", update[vname.name][j]);
					var elem = document.createElement(cname.elem == null ? "p" : cname.elem);
					elem.className = cname.name;
					
					// then, if the vname fetched is not a list, set the textContent to the parsed version and add it
					var vname_fetch = ref_update_part;
				
					if (hide_link && cname.go_hide_next) {
						var hide_list_index = hide_lists.length - 1;
						hide_link.onclick = function() {toggle_hiding(hide_lists[hide_list_index])};
						hide_list.elems.push(elem);
						elem.style.display = "none";
					}
				
					div.appendChild(elem);
					// console.log("placing", elem, "in", div, "(arr", j, ")");
					navigate_div_create(ref_update_part, elem, vname.nested, cname.nested, orig_update);
				}
				
				
				hide_link = null;
			
				/*
				if (hide_link && cname.go_hide_next) {
					hide_link.onclick = function() {alert("clicked")};
					hide_link = null;
					
					div.style.display = "none";
				}
				*/
			} else {
				var elem = document.createElement(cname.elem == null ? "p" : cname.elem);
				elem.className = cname.name;
				
				// then, if the vname fetched is not a list, set the textContent to the parsed version and add it
				var vname_fetch = update[vname.name];
				if (vname.func != null) {
					vname_fetch = vname.func(vname_fetch);
				}
				
				
				if (Array.isArray(vname_fetch)) {
					// console.log("placing", elem, "in", div, "(arr)");
					div.appendChild(elem);
					navigate_div_create(update[vname.name], elem, vname.nested, cname.nested, orig_update);
				} else {
					if (cname.target == null) {
						parse_effect_string_to_container(vname_fetch, elem);
						if (cname.make_hide_next) {
							hide_link = document.createElement("a");
							hide_link.textContent = " [+]";
							hide_link.className = "expand-link";
							
							elem.appendChild(hide_link);
						}
						
						if (vname.subname) {
							var elem2 = document.createElement(cname.elem == null ? "span" : cname.elem);
							elem2.className = cname.subname;
							
							parse_effect_string_to_container(" - " + update[vname.subname], elem2);
							elem.appendChild(elem2);
						}
					} else {
						elem[cname.target] = vname_fetch;
					}
					
					// console.log("placing", elem, "in", div, "(text)");
					div.appendChild(elem);
				}
			}
		}
	}
}


function do_search_term(e) {
	// For now, filter by name or effect. If "name:()" or "effect:()", only look at that.
	var val = typeof e == "string" ? e : e.target.value;
	
	var query_tokens = val.match(/(\w|\.)+:?|\"(\w| \.)+\"/gm);
	var valid_updates = Array.from(Array(updates.length).keys());
	
	if (query_tokens != null) {
		name_tokens = []
		id_tokens = []
		wildcard_tokens = []
		
		// Get name, effect and wildcard tokens.
		prev_token = ""
		for (i=0; i<query_tokens.length; i++) {
			clean_token = query_tokens[i].replace("\"", "").toLowerCase();
			
			if (clean_token != "name:" && clean_token != "id:") {
				if (prev_token == "name:") {
					name_tokens.push(clean_token);
				} else if (prev_token == "id:") {
					id_tokens.push(clean_token);
				} else {
					wildcard_tokens.push(clean_token);
				}
			}
			
			prev_token = clean_token
		}
		
		for (i=0; i<name_tokens.length; i++) {
			for (uid=valid_updates.length - 1; uid >= 0; uid--) {
				if (!update_names[uid].toLowerCase().includes(name_tokens[i])) {
					valid_updates.splice(uid, 1);
				}
			}
		}
		
		for (i=0; i<id_tokens.length; i++) {
			for (uid=valid_updates.length - 1; uid >= 0; uid--) {
				if (!update_ids[uid].toLowerCase().includes(id_tokens[i])) {
					valid_updates.splice(uid, 1);
				}
			}
		}
		
		for (i=0; i<wildcard_tokens.length; i++) {
			for (uid=valid_updates.length - 1; uid >= 0; uid--) {
				if (!update_names[uid].toLowerCase().includes(wildcard_tokens[i]) && !update_ids[uid].toLowerCase().includes(wildcard_tokens[i])) {
					valid_updates.splice(uid, 1);
				}
			}
		}
	}
	
	for (update_id=0; update_id<updates.length; update_id++) {
		if (valid_updates.includes(update_id)) {
			update_divs[update_id].style.display = "block";
		} else {
			update_divs[update_id].style.display = "none";
		}
	}
	
	if (window.performance) {
		window.history.replaceState({}, "", "?search=" + val);
	}
};


document.addEventListener('DOMContentLoaded', function() {
	/*
	<div class="update-content">
		<p class="update-title">Test update</p>
		<p class="update-id">0.0.1</p>
		<p class="update-flavour">Witty comment. Wow. Frogman go in bin.</p>
	
		<div class="update-category">
			<p class="update-cat-name">General <a class="expand-link" onclick="toggle_cat(0, 0);">[-]</a></p>
			<div class="update-cat-listing">
				<div class="floating-update-entry">
					<img class="floating-update-img" src="icons/tick.png">
					<p class="floating-update-text">All classes' PATK increased from <span class="important-neutral">0</span> to <span class="important-neutral">1</span>.</p>
				</div>
				<div class="floating-update-entry">
					<img class="floating-update-img" src="icons/cross.png">
					<p class="floating-update-text">All classes' PATK reduced from <span class="important-neutral">1</span> to <span class="important-neutral">0</span>.</p>
				</div>
				<div class="floating-update-entry">
					<img class="floating-update-img" src="icons/neutral.png">
					<p class="floating-update-text">All classes' PATK changed from <span class="important-neutral">0</span> to <span class="important-neutral">0</span>.</p>
				</div>
			</div>
		</div>
		
		<div class="update-category">
			<p class="update-cat-name">Skills <a class="expand-link" onclick="toggle_cat(0, 1);">[-]</a></p>
			<div class="update-cat-listing">
				<div class="floating-update-entry">
					<img class="floating-update-img" src="icons/HUGE.png">
					<p class="floating-update-text">Gigaslash no longer sucks.</p>
					<div class="floating-update-after"/>
				</div>
			</div>
		</div>
		
		<div class="update-category">
			<p class="update-cat-name">Effects <a class="expand-link" onclick="toggle_cat(0, 2);">[+]</a></p>
			<div style="visibility: hidden; display: none;" class="update-cat-listing">
				<div class="floating-update-entry">
					<img class="floating-update-img" src="icons/tick.png">
					<p class="floating-update-text">They'll never see this one.</p>
					<div class="floating-update-after"/>
				</div>
			</div>
		</div>
	</div>
	*/
	
	for (var i=updates.length - 1; i>=0; i--) {
		var div_base = document.createElement("div");
		div_base.className = "update-content";
		
		navigate_div_create(updates[i], div_base, var_names, class_names, updates[i]);
		
		document.getElementById("update-list").appendChild(div_base);
		
		update_divs.push(div_base);
		update_names.push(updates[i].name);
		update_ids.push(updates[i].id);
	}
	
	document.getElementById("search-box").oninput = do_search_term;
	
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
	
	// make the highest update unroll automatically
	/*
	for (update_id=updates.length - 1; update_id>=0; update_id--) {
		if (update_divs[update_id].style.display == "block") {
			var found = false;
			for (hlist=hide_lists.length - 1; hlist>=0; hlist--) {
				if (hlist.related_id == updates[update_id].id) {
					found = true;
					toggle_hiding(hide_lists[hlist])
				} else {
					if (!found) {
						break;
					}
				}
			}
		}
	}
	*/
}, false);