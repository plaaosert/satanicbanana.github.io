// All items have a set of "bonuses".
// These items are stored in a list, with more important bonuses at the top.
// For example, weapons will have +ATK as their first bonus,
// then secondary and tertiary bonuses of whatever.
// Bonuses can either apply an addition or multiplier to a value and are shown in the form ("name", "+/*", value)
// Bonuses that turn on some special effect just add 1 to the effect, making it "true".
// Bonuses can also be negative. lol
bonus_var_to_words = {
	"":"Empty", // uhhhhhhhhhhhhhhhhhhh im lazy. Empty +0
	
	"stats.atk":"ATK",
	"stats.hp":"HP",
	"stats.mp":"MP",
	"stats.def":"DEF",
	"stats.agi":"AGI",
	"stats.luc":"LUC",
	"bonuses.loot_chance":"loot chance",
	"bonuses.gold_bonus":"gold bonus",
	"bonuses.xp_bonus":"XP bonus",
	"bonuses.apl":"ATK per level",
	"bonuses.dpl":"DEF per level",
	"bonuses.hpl":"HP per level",
	"bonuses.mpl":"MP per level",
	"bonuses.agl":"AGI per level",
	"bonuses.lpl":"LUC per level",
}

base_stats_per_level = {
	// atk def hp mp agi luc
	atk:5,
	def:5,
	hp:10,
	mp:10,
	agi:2,
	luc:2,
}

class MetaPlayer {
	constructor(name) {
		this.name = name;
		
		this.items = {
			weapon:null,
			armour:null,
			acc1:null,
			acc2:null,
			acc3:null,
			innate:{
				bonus1: ["stats.atk", "+", 5],
				bonus2: null,
				bonus3: ["stats.hp", "+", 5],
			}
		};
	
		this.original_inventory = []; // List of all items currently held. Never sorted.
		this.sorted_inventory = []; // List of all items currently held. Affected by sorts.
		this.inventory = []; // List of all items currently held. Affected by sorts and filters.
		this.sort_mode = "raw_level";
		this.filter_mode = "";
		this.reverse = true;
	}
	
	sort_all_items() {
		this.sorted_inventory = this.original_inventory.slice();
	
		sortArrayOfObjects(this.sorted_inventory, this.sort_mode);
		
		this.inventory = this.sorted_inventory.slice();
		
		if (this.filter_mode != "")
			this.inventory = this.inventory.filter(a => a.name.toLowerCase().includes(this.filter_mode.toLowerCase()));
		
			//filterArrayOfObjects(this.inventory, this.filter_mode, "name");
	}
		
	check_filter(item) {
		if (this.filter_mode == "")
			return true;
		
		return item.name.toLowerCase().includes(this.filter_mode.toLowerCase());
	}
		
	add_item(item) {
		item.time_changed = Date.now();
		this.original_inventory.push(item);
		
		var add_location = arbBinaryFit(this.sorted_inventory, this.sort_mode, item);
		
		this.sorted_inventory.splice(add_location, 0, item);
		if (this.check_filter(item)) {
			var add_filt_location = arbBinaryFit(this.inventory, this.sort_mode, item);
		
			this.inventory.splice(add_filt_location, 0, item);
		} else {
			// Do not add
		}
	}
	
	remove_item(item) {
		var index_remove = this.original_inventory.indexOf(item);
		this.original_inventory.splice(index_remove, 1);
		
		var index_remove_sorted = this.inventory.indexOf(item);
		this.inventory.splice(index_remove_sorted, 1);
	}
	
	filter_sort(to) {
		this.filter_mode = to;
		
		this.sort_all_items();
	}
	
	swap_sort(to) {
		this.sort_mode = to;
		
		this.sort_all_items();
	}
	
	equip_item(item, aslot) {
		// Replaces the item in the chosen equip slot with the new item. Returns the old item to the inventory if it exists.
		// Swap desort IDs in order to preserve (unsorted) order.
		// "aslot" is used to differentiate between accessory slots.
		var slot = item.typ;
		if (aslot != undefined) {
			slot += aslot;
		}
		
		if (this.items[slot] != null) {
			// Unequip if item is in slot already
			if (this.items[slot] == item) {
				this.add_item(item);
				this.items[slot] = null;
				return "same";
			}
			
			this.add_item(this.items[slot]);
		}
		
		this.items[slot] = item;
		
		this.remove_item(item);
	}
}


class Player {
	constructor(metaplayer) {
		this.mp = metaplayer;
		this.name = metaplayer.name;
		
		// Player gets +5ATK, +5HP just for existing. This is applied using a hidden item (which could be modified or removed wink wink)
		this.stats = {
			atk:0,
			def:0,
			hp:0,
			mp:0,
			agi:0,
			luc:0
		};
		
		this.bonuses = {
			loot_chance:1,
			gold_bonus:1,
			crit_chance:0,
			crit_damage:0,
			
			apl:0,
			dpl:0,
			hpl:0,
			mpl:0,
			agl:0,
			lpl:0
		};
		
		this.current_hp = 0;
		this.current_mp = 0;
		this.level = 1;
		this.xp = 0;
		this.dead = false;
		
		// Skills are all included in a single list. They will contain their info and a boolean in a 2-tuple (skill, owned) <= (Skill, bool)
		// The owned variable will show whether the currently instantiated player owns the skill in question.
		this.skills = [];
		this.fetch_all_skills();
	}
	
	fetch_all_skills() {
		skills_list.forEach((skill) => {
			this.skills.push([skill, false]);
		});
	}
	
	calculate_all_stats() {
		// apply level as additive
		// then items' additive effects
		// then items' multiplicative effects
		// then crit and other precalcs
		// also get your name lol
		this.name = this.mp.name;
		this.reset_bonuses();
		this.reset_stats();
		this.apply_item_stats();
		this.apply_level_stats();
		this.apply_late_item_stats();
		this.round_all_stats();
		this.apply_crit_info();
	}
	
	apply_item_stats() {
		var a = [this.mp.items.weapon, this.mp.items.armour, this.mp.items.acc1, this.mp.items.acc2, this.mp.items.acc3, this.mp.items.innate];
		a.forEach((item) => {
			if (item != null) {
				// Get the stat, get the + and then apply the value.
				var b = [item.bonus1, item.bonus2, item.bonus3];
				
				b.forEach((entry) => {
					if (entry != null) {
						var inc = entry[2];
						if (entry[1] == "+") {
							Object.setByString(this, entry[0], Object.byString(this, entry[0]) + inc);
						} else if (entry[1] == "-") {
							Object.setByString(this, entry[0], Object.byString(this, entry[0]) - inc);
						}
					}
				});
			}
		});
	}
	
	apply_late_item_stats() {
		var a = [this.mp.items.weapon, this.mp.items.armour, this.mp.items.acc1, this.mp.items.acc2, this.mp.items.acc3, this.mp.items.innate];
		a.forEach((item) => {
			if (item != null) {
				// Get the stat, get the * and then apply the value.
				var b = [item.bonus1, item.bonus2, item.bonus3];
				
				b.forEach((entry) => {
					if (entry != null) {
						var inc = entry[2];
						if (entry[1] == "*") {
							Object.setByString(this, entry[0], Object.byString(this, entry[0]) * inc);
						}
					}
				});
			}
		});
	}
	
	apply_crit_info() {
		// crit chance is -(250,000 / (x + (1,500,000 / 3))) + 0.6
		// crit damage is 2 + 0.000001x
		// where x is luck
		var luc = this.stats.luc;
		this.bonuses.crit_chance = -(250000 / (luc + (1500000 / 3))) + 0.6;
		this.bonuses.crit_damage = 2 + (0.000001 * luc);
	}
	
	apply_level_stats() {
		this.stats.atk += (base_stats_per_level.atk + this.bonuses.apl) * this.level;
		this.stats.def += (base_stats_per_level.def + this.bonuses.dpl) * this.level;
		this.stats.hp += (base_stats_per_level.hp + this.bonuses.hpl) * this.level;
		this.stats.mp += (base_stats_per_level.mp + this.bonuses.mpl) * this.level;
		this.stats.agi += (base_stats_per_level.agi + this.bonuses.agl) * this.level;
		this.stats.luc += (base_stats_per_level.luc + this.bonuses.lpl) * this.level;
	}
	
	round_all_stats() {
		this.stats.atk = Math.round(this.stats.atk);
		this.stats.def = Math.round(this.stats.def);
		this.stats.hp = Math.round(this.stats.hp);
		this.stats.mp = Math.round(this.stats.mp);
		this.stats.agi = Math.round(this.stats.agi);
		this.stats.luc = Math.round(this.stats.luc);
	}
	
	reset_bonuses() {
		this.bonuses = {
			loot_chance:1,
			gold_bonus:1,
			crit_chance:0,
			crit_damage:0,
			
			apl:0,
			dpl:0,
			hpl:0,
			mpl:0,
			agl:0,
			lpl:0
		};
	}
	
	reset_stats() {
		this.stats = {
			atk:0,
			def:0,
			hp:0,
			mp:0,
			agi:0,
			luc:0
		};
	}
	
	reset_all() {
		this.level = 1;
		this.xp = 0;
		this.dead = false;
		this.calculate_all_stats();
		this.current_hp = this.stats.hp;
		this.current_mp = this.stats.mp;
	}
}


// why does javascript have like 4 distinct methods of declaring classes and wHY DID I USE ALL FOUR
/*
var player = {
	mp: metaplayer,
	name: "",
	
	// Player gets +5ATK, +5HP just for existing. This is applied using a hidden item (which could be modified or removed wink wink)
	stats: {
		atk:0,
		def:0,
		hp:0,
		mp:0,
		agi:0,
		luc:0
	},
	
	bonuses: {
		loot_chance:1,
		gold_bonus:1,
		crit_chance:0,
		crit_damage:0,
		
		apl:0,
		dpl:0,
		hpl:0,
		mpl:0,
		agl:0,
		lpl:0
	},
	
	current_hp:0,
	current_mp:0,
	level:1,
	xp:0,
	dead:false,
	
	calculate_all_stats: function() {
		// apply level as additive
		// then items' additive effects
		// then items' multiplicative effects
		// then crit and other precalcs
		// also get your name lol
		player.name = player.mp.name;
		player.reset_bonuses();
		player.reset_stats();
		player.apply_item_stats();
		player.apply_level_stats();
		player.apply_late_item_stats();
		player.round_all_stats();
		player.apply_crit_info();
	},
	
	apply_item_stats: function() {
		var a = [player.mp.items.weapon, player.mp.items.armour, player.mp.items.acc1, player.mp.items.acc2, player.mp.items.acc3, player.mp.items.innate];
		a.forEach(function(item) {
			if (item != null) {
				// Get the stat, get the + and then apply the value.
				var b = [item.bonus1, item.bonus2, item.bonus3];
				
				b.forEach(function(entry) {
					if (entry != null) {
						inc = entry[2];
						if (entry[1] == "+") {
							Object.setByString(player, entry[0], Object.byString(player, entry[0]) + inc);
						} else if (entry[1] == "-") {
							Object.setByString(player, entry[0], Object.byString(player, entry[0]) - inc);
						}
					}
				});
			}
		});
	},
	
	apply_late_item_stats: function() {
		var a = [player.mp.items.weapon, player.mp.items.armour, player.mp.items.acc1, player.mp.items.acc2, player.mp.items.acc3, player.mp.items.innate];
		a.forEach(function(item) {
			if (item != null) {
				// Get the stat, get the * and then apply the value.
				var b = [item.bonus1, item.bonus2, item.bonus3];
				
				b.forEach(function(entry) {
					if (entry != null) {
						inc = entry[2];
						if (entry[1] == "*") {
							Object.setByString(player, entry[0], Object.byString(player, entry[0]) * inc);
						}
					}
				});
			}
		});
	},
	
	apply_crit_info: function() {
		// crit chance is -(250,000 / (x + (1,500,000 / 3))) + 0.6
		// crit damage is 2 + 0.000001x
		// where x is luck
		luc = player.stats.luc
		player.bonuses.crit_chance = -(250000 / (luc + (1500000 / 3))) + 0.6;
		player.bonuses.crit_damage = 2 + (0.000001 * luc);
	},
	
	apply_level_stats: function() {
		player.stats.atk += (base_stats_per_level.atk + player.bonuses.apl) * player.level;
		player.stats.def += (base_stats_per_level.def + player.bonuses.dpl) * player.level;
		player.stats.hp += (base_stats_per_level.hp + player.bonuses.hpl) * player.level;
		player.stats.mp += (base_stats_per_level.mp + player.bonuses.mpl) * player.level;
		player.stats.agi += (base_stats_per_level.agi + player.bonuses.agl) * player.level;
		player.stats.luc += (base_stats_per_level.luc + player.bonuses.lpl) * player.level;
	},
	
	round_all_stats: function() {
		player.stats.atk = Math.round(player.stats.atk);
		player.stats.def = Math.round(player.stats.def);
		player.stats.hp = Math.round(player.stats.hp);
		player.stats.mp = Math.round(player.stats.mp);
		player.stats.agi = Math.round(player.stats.agi);
		player.stats.luc = Math.round(player.stats.luc);
	},
	
	reset_bonuses: function() {
		player.bonuses = {
			loot_chance:1,
			gold_bonus:1,
			crit_chance:0,
			crit_damage:0,
			
			apl:0,
			dpl:0,
			hpl:0,
			mpl:0,
			agl:0,
			lpl:0
		};
	},
	
	reset_stats: function() {
		player.stats = {
			atk:0,
			def:0,
			hp:0,
			mp:0,
			agi:0,
			luc:0
		};
	},
	
	reset_all: function() {
		player.level = 1;
		player.xp = 0;
		player.dead = false;
		player.calculate_all_stats();
		player.current_hp = player.stats.hp;
		player.current_mp = player.stats.mp;
	}
}
*/

metaplayer = new MetaPlayer("plaaosert");
player = new Player(metaplayer);


function test(loc) {
	// reset player, spawn enemy, enter nth area in list, see what happens
	console.log("resetting player");
	player.reset_all();
	console.log(player.stats);
	console.log("starting area loop");
	initBattles(area_defs[loc]);
	console.log("good luck!");
}

function testwp(loc) {
	// give player a weapon then test again
	console.log("giving player weapon");
	weapon = generateWeapon(0);
	metaplayer.items.weapon = weapon;
	console.log(weapon);
	test(loc);
}

function testrnd() {
	for (var i=0; i<=99; i+=1) {
		metaplayer.add_item(generateAccessory(i));
		metaplayer.add_item(generateAccessory(i));
		metaplayer.add_item(generateAccessory(i));
		metaplayer.add_item(generateAccessory(i));
		metaplayer.add_item(generateWeapon(i));
		metaplayer.add_item(generateWeapon(i));
		metaplayer.add_item(generateArmour(i));
		metaplayer.add_item(generateArmour(i));
	}

	metaplayer.sort_all_items();

	player.skills[2][1] = true;

	initial_inventory_render();
	initial_skills_render();
	render_inventory_page(0);
	update_stats_preview();
}