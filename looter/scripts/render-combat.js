class StatBar {
	constructor(link_obj, link_val, link_max_obj, link_max, bar_width) {
		this.bar = null;
		this.val = null;
		this.max_parent = "stats";
		
		if (bar_width) {
			this.bar_width = bar_width;
		} else {
			this.bar_width = 160;
		}
		
		this.link_obj = link_obj;
		this.link_val = link_val;
		this.link_max_obj = link_max_obj;
		this.link_max = link_max;
	}
	
	set_max_parent(parent) {
		this.max_parent = parent;
	}
	
	relink(link_obj, link_val, link_max_obj, link_max) {
		this.link_obj = link_obj;
		this.link_val = link_val;
		this.link_max_obj = link_max_obj;
		this.link_max = link_max;
		
		this.update();
	}
	
	bindToObjects(bar, val) {
		this.bar = bar;
		this.val = val;
	}
	
	update() {
		if (this.bar != null && this.link_obj != null) {
			var val_get = this.link_obj[this.link_val];
			var max_val_get;
			if (this.max_parent) {
				max_val_get = this.link_max_obj[this.max_parent][this.link_max];
			} else {
				max_val_get = this.link_max_obj[this.link_max];
			}
			
			this.val.textContent = format_bonus_number(Math.max(0, val_get)) + " / " + format_bonus_number(max_val_get);
			this.bar.style.width = Math.round((Math.max(0, val_get) / max_val_get) * this.bar_width);
		}
	}
}


class StatLabel {
	constructor(link_obj, link_val, parent_val) {
		this.val = null;
		
		this.link_obj = link_obj;
		this.link_val = link_val;
		this.parent_val = parent_val;
	}
	
	relink(link_obj, link_val) {
		this.link_obj = link_obj;
		this.link_val = link_val;
		
		this.update();
	}
	
	bindToObjects(val) {
		this.val = val;
	}
	
	update() {
		if (this.val != null && this.link_obj != null) {
			var val_get;
			if (this.parent_val) {
				val_get = this.link_obj[this.parent_val][this.link_val];
			} else {
				val_get = this.link_obj[this.link_val];
			}
			
			this.val.textContent = format_bonus_number(val_get);
		}
	}
}


class SkillFrame {
	// frames are always initialised with a skill
	constructor(skill) {
		this.skill = skill;
		this.box = null;
	}
	
	setSkill(skill) {
		// We pick either the skill on its own or "o".
		this.box.src = "sprites/skills/skilltree/" + (player.skills[skill.id][1] >= 50 ? "o" : "") + skill.fname + ".png";
	}
	
	makeBaseFrame(xpos, ypos, target) {
		let itembox = document.createElement("img");
		itembox.className = "fg";
		itembox.src = "";
		itembox.style.border = "1px solid #555";
		itembox.style.position = "absolute";
		itembox.style.top = (ypos + 2) + "px";
		itembox.style.left = (xpos + 2) + "px";
		
		target.appendChild(itembox);
		
		this.box = itembox;
		this.setSkill(this.skill);
	}
}


class AreaFrame {
	constructor(area, box) {
		this.area = area;
		this.box = box;
	}
	
	setSkill(skill) {
		// We pick either the skill on its own or "o".
		this.box.src = "sprites/areas/" + area.id + ".png";
	}
}


static_bars = []


function setup_static_bars() {
	player_hpbar = new StatBar(player, "current_hp", player, "hp");
	player_mpbar = new StatBar(player, "current_mp", player, "mp");
	player_xpbar = new StatBar(player, "xp", player, "xp_required", 144);
	player_xpbar.set_max_parent(null);
	
	player_atk_label = new StatLabel(player, "atk", "stats");
	player_def_label = new StatLabel(player, "def", "stats");
	player_agi_label = new StatLabel(player, "agi", "stats");
	player_luc_label = new StatLabel(player, "luc", "stats");
	player_lvl_label = new StatLabel(player, "level");
	
	enemy_hpbar = new StatBar();
	
	player_hpbar.bindToObjects(document.getElementById("combat-hpbar-1"), document.getElementById("combat-hpbar-2"));
	player_mpbar.bindToObjects(document.getElementById("combat-mpbar-1"), document.getElementById("combat-mpbar-2"));
	
	player_atk_label.bindToObjects(document.getElementById("combat-stat-atk"));
	player_def_label.bindToObjects(document.getElementById("combat-stat-def"));
	player_agi_label.bindToObjects(document.getElementById("combat-stat-agi"));
	player_luc_label.bindToObjects(document.getElementById("combat-stat-luc"));
	player_lvl_label.bindToObjects(document.getElementById("combat-stat-level"));
	
	enemy_hpbar.bindToObjects(document.getElementById("combat-enemyhp-1"), document.getElementById("combat-enemyhp-2"));
	
	player_xpbar.bindToObjects(document.getElementById("combat-xpbar-1"), document.getElementById("combat-xpbar-2"));
	
	static_bars.push(player_hpbar);
	static_bars.push(player_mpbar);
	
	static_bars.push(enemy_hpbar);
		
	static_bars.push(player_atk_label);
	static_bars.push(player_def_label);
	static_bars.push(player_agi_label);
	static_bars.push(player_luc_label);
	static_bars.push(player_lvl_label);
	
	static_bars.push(player_xpbar);
	
	area_location_1 = new AreaFrame(area_defs[0], menu_screens.area_box1);
	area_location_2 = new AreaFrame(area_defs[0], menu_screens.area_box2);
	area_location_3 = new AreaFrame(area_defs[0], menu_screens.area_box3);
}


function initial_skills_render() {
	skills_div = document.getElementById("skills-items");
	skills_div.style.position = "absolute";
	skills_div.style.left = "8px";
    skills_div.style.top = "4px";
	skills_div.style.width = "128px";
    skills_div.style.height = "256px";
	
	for (i=0; i<6; i++) {
		inventory_objs.push([]);
		
		for (j=0; j<4; j++) {
			var xpos = j * 40;
			var ypos = i * 36;
			var skillid = (i * 4) + j;
			skillid = Math.min(skillid, skills_list.length - 1);
			
			skillElem = new SkillFrame(skills_list[skillid]);
			skillElem.makeBaseFrame(xpos, ypos, skills_div);
			
			console.log(skillid);
			skillElem.box.addEventListener("mouseenter", (function (skillid) { 
														return function() {
															make_skill_dialog(skillid);
														} 
													})(skillid));
													
			skillElem.box.addEventListener("mouseleave", kill_skill_dialog);
			skillElem.box.addEventListener("click", equip_button_pressed);

			inventory_objs[i].push(skillElem);
		}
	}
}


function make_skill_dialog(skill_id) {
	// We don't actually make the skill dialog. We just update it with the skill info and move it to the cursor position +1
	if (skillDialogInterval == null) {
		// Get the skill in question. We need both the player's skill level and the skill info itself
		skill_obj = skills_list[skill_id];
		player_skill_level = player.skills[skill_obj.id][1];
		
		variableObjects.skilldialog.sprite.src = "sprites/skills/skilltree/" + (player_skill_level >= 50 ? "o" : "") + skill_obj.fname + ".png";
		variableObjects.skilldialog.name.textContent = skill_obj.name;
		variableObjects.skilldialog.desc.textContent = skill_obj.bonus;
		variableObjects.skilldialog.level.textContent = "LV " + player_skill_level + "/50";
		variableObjects.skilldialog.cost.textContent = skill_obj.cost;
		
		skillDialogInterval = setInterval(move_skill_dialog, 1/144);
	}
}


function move_skill_dialog() {
	// Set position of skill dialog to the cursor position
	skillDialog.style.left = Math.ceil((mousex / 2) + 1);
	skillDialog.style.top = Math.ceil((mousey / 2) + 1);
}


function kill_skill_dialog() {
	// We don't actually kill the skill dialog. We just set its position to -1000,-1000
	if (skillDialogInterval != null) {
		selectedSkill = null;

		skillDialog.style.left = -1000;
		skillDialog.style.top = -1000;
		clearInterval(skillDialogInterval);
		skillDialogInterval = null;
	}
}


function update_static_bars() {
	static_bars.forEach(item => {
		item.update();
	});
}


function refresh_enemy_spawn_time(time) {
	document.getElementById("combat-battle-wait-amount").textContent = Math.round(time / 20).toString().toHHMMSS();
}


function show_enemy_screen() {
	document.getElementById("combat-waiting-info").style.visibility = "hidden";
	document.getElementById("combat-enemy-info").style.visibility = "visible";
}


function show_wait_screen() {
	document.getElementById("combat-waiting-info").style.visibility = "visible";
	document.getElementById("combat-enemy-info").style.visibility = "hidden";
}