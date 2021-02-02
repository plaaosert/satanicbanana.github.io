// enemy spawner script.
// enemies are spawned by creating a less complex player object and giving them a level.
// the level is determined by the area average level, with a deviance of +-1 or 10% of the area level, whichever is greater.
// level cannot be lower than 1
// the stat growth tree is generated as such:
//
// - multiply a set of 4 random values from 0.5 to 1.5 by the area's respective atk, def, hp, mp weightings
// - multiply the products by 18 to get their values in the stat growth tree
// - add 4 to all stats in the tree.
//
// since humans get a base of 30 points/level and this sums to an average of 30 points/level when sum(area weightings) = 1,
// the enemy units should be equally powerful as the player when the player has no items.
// with this in mind, later areas' weightings should NOT sum to 1, to provide additional challenge.


function Enemy(name, tree, level) {
	this.name = name;
	this.tree = tree;
	this.stats = {atk:0, def:0, hp:0, mp:0};
	this.current_hp = 0;
	this.current_mp = 0;
	this.level = level
	this.xp_value = Math.round(level ** 10);
	this.bonuses = {};
	this.bonuses.crit_chance = 0;
	this.bonuses.crit_damage = 2;
	this.dead = false;
	
	this.apply_level_stats = function() {
		this.stats.atk = this.tree.atk * this.level;
		this.stats.def = this.tree.def * this.level;
		this.stats.hp = this.tree.hp * this.level;
		this.stats.mp = this.tree.mp * this.level;
	},
	
	this.round_all_stats = function() {
		this.stats.atk = Math.round(this.stats.atk);
		this.stats.def = Math.round(this.stats.def);
		this.stats.hp = Math.round(this.stats.hp);
		this.stats.mp = Math.round(this.stats.mp);
	},
	
	this.calculate_all_stats = function() {
		this.apply_level_stats();
		this.round_all_stats();
	}
}


function generateEnemy(areaData) {
	weightings = [
		randInt(5000, 15000) / 10000,
		randInt(5000, 15000) / 10000,
		randInt(5000, 15000) / 10000,
		randInt(5000, 15000) / 10000
	];
	
	enemyName = "TEST ENEMY"; // obviously fix this later. name lists should be split into multiple different lists and incorporated by-area.
	levelDeviation = Math.max(1, areaData.avg_level * 0.1)
	
	enemyLevel = Math.max(1, areaData.avg_level + Math.round(levelDeviation * randInt(-1000, 1000) / 1000));
	
	enemyTree = {
		atk: 4 + (weightings[0] * areaData.spawn_bias[0] * 18),
		def: 4 + (weightings[1] * areaData.spawn_bias[1] * 18),
		hp: 4 + (weightings[2] * areaData.spawn_bias[2] * 18),
		mp: 4 + (weightings[3] * areaData.spawn_bias[3] * 18)
	};
	
	enemyObj = new Enemy(enemyName, enemyTree, enemyLevel);
	
	enemyObj.calculate_all_stats();
	enemyObj.current_hp = enemyObj.stats.hp;
	enemyObj.current_mp = enemyObj.stats.mp;
	
	return enemyObj;
}