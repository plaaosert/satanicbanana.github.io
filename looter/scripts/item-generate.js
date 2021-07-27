// Generates items.
// Config files are preloaded at game start as js scripts.
empty_bonus = ["", ["", "+", linear, 0]];


rarityColours = [
	"686868",
	"00BC00",
	"0083EF",
	"55E0C6",
	"7B5EFF",
	"FF7442",
	"D80000",
	"F200C1",
	"F2F200",
	"FFFFFF"
];


rarityNames = [
	"Common",
	"Uncommon",
	"Rare",
	"Exotic",
	"Mythical",
	"Legendary",
	"Special",
	"Epic",
	"Supreme",
	"Ultimate"
];


transRarityNames = [
	"Astral",
	"Cosmic",
	"Glorious",
	"Ascended",
	"Transcended",
	"Angelic",
	"Demonic",
	"Unparalleled",
	"God",
]


// "weight" here refers to the CONSTANT value provided in the definition.
// "exc" is the variable (weapon rarity) value.
function linear(exc, weight) {
	return exc * weight;
}

function powOfN(exc, weight) {
	return weight ** exc;
}

function nToPow(exc, weight) {
	return exc ** weight;
}

function nOverAmt(exc, weight) {
	return weight / exc;
}

function sqrt(exc, weight) {
	return weight * Math.sqrt(exc);
}

function constant(exc, weight) {
	return weight;
}

function threeToPow(exc, weight) {
	return (3 ** exc) 
}

function standardItemScaling(exc, weight) {
	return Math.round((3.7 ** exc) + (30 * (exc - 1))) * weight;
}

special_scalings = {
	"bonuses.crit_chance": [sqrt, 0.09, "*"],
	"bonuses.crit_bonus": [sqrt, 0.10, "*"],
	"bonuses.gold_bonus": [sqrt, 0.15, "*"],
	"bonuses.xp_bonus": [sqrt, 0.12, "*"],
	"bonuses.loot_chance": [sqrt, 0.235, "*"],
	
	"bonuses.apl": [sqrt, 1.2, "+"],
	"bonuses.dpl": [sqrt, 1.05, "+"],
	"bonuses.hpl": [sqrt, 20.01, "+"],
	"bonuses.mpl": [sqrt, 1.89, "+"],
	"bonuses.agl": [sqrt, 0.52, "+"],
	"bonuses.lpl": [sqrt, 0.46, "+"],
}


function Item(typ, level, sprite, name, bonus1, bonus2, bonus3) {
	this.typ = typ;
	this.rarity = Math.round(level);
	this.raw_level = (2 * level + 1) ** 3 + 1;
	this.level = Math.round(this.raw_level).toLocaleString();
	this.border = (this.rarity % 10).toString().padStart(3, "0");
	
	secondaryRarity = Math.floor(this.rarity / 10);
	this.border2 = secondaryRarity.toString().padStart(3, "0");
	if (this.rarity < 10)
		this.border2 = "999";
	
	this.sprite = sprite;
	this.name = name;
	
	this.time_created = Date.now();
	this.time_changed = Date.now();
	
	this.bonus1 = bonus1;
	this.bonus2 = bonus2;
	this.bonus3 = bonus3
}


function getItemRarityName(rarity) {
	// first apply trans rarity names by dividing the rarity value by 10 and getting the floored quotient. if r > 100, do this with 100 instead and so on
	full_name = "";
	oom = 10;
	while (rarity >= oom) {
		quot = (Math.floor(rarity / oom) - 1) % 9; // therefore if the rarity is > 10x the oom it still resolves correctly
		full_name = transRarityNames[quot] + " " + full_name;
		oom *= 10; // bugged after God Ultimate dont care enough to fix it rn lol
	}
	
	// then add the final rarity name on the end by doing rarity % 10
	full_name += rarityNames[rarity % 10];
	
	return full_name;
}


function generateAccessoryName(base, coeff, fin) {
	// Add data from the texts info at the start or end of the item.
	// Empty strings in the accessory texts list to allow for possibly empty name appends.
	prepend = randInt(1,5) < 3 ? randomFromCollection(accessoryTexts[fin][0]) : empty_bonus;
	append = randInt(1,5) < 3 ? randomFromCollection(accessoryTexts[fin][1]) : empty_bonus;
	
	// Also add a "+X" to the accessory base name if it's "prestiged" (loops)
	prestige = "";
	loops = Math.floor(Math.round(coeff) / 10);
	if (loops > 0)
		prestige = " +" + loops.toString();
	
	// Accessory name can contribute to stats somewhat
	return [prepend[0] + base + append[0] + prestige, [prepend[1], append[1]]];
}


function generateAccessory(baseCoeff) {
	// Same as armour
	exactIndex = baseCoeff + (randInt(-4000, 4000) / 10000);
	finalIndex = Math.round(exactIndex) % 10;
	adjustedIndex = exactIndex + 1.5;
	
	selectedAccessory = randomFromCollection(accessoryInfo[finalIndex]);
	// We now have a sprite and a base name. From here, generate the name then the stats.
	accessoryName = generateAccessoryName(selectedAccessory[1], exactIndex, finalIndex);
	
	// we have a name! so generate the item
	// Generation stat is different based off the accessory name.
	bonus2Target = accessoryName[1][0];
	bonus3Target = accessoryName[1][1];
	
	// Apply variance to both bonus2 and bonus3 (+-15%)
	bonus2Variance = randInt(85, 115) / 100.0;
	bonus3Variance = randInt(85, 115) / 100.0;
	
	bonus2Number = Math.round(bonus2Target[2](adjustedIndex, bonus2Target[3]) * 80 * bonus2Variance) / 100;
	if (bonus2Target[1] == "*")
		bonus2Number += 1; // make sure it generates as an actual multiplier
	else
		bonus2Number = Math.round(bonus2Number); // otherwise round to an int
	
	bonus3Number = Math.round(bonus3Target[2](adjustedIndex, bonus3Target[3]) * 80 * bonus3Variance) / 100;
	if (bonus3Target[1] == "*")
		bonus3Number += 1; // make sure it generates as an actual multiplier
	else
		bonus3Number = Math.round(bonus3Number); // otherwise round to an int
	
	// Since bonus1 can be abitrary and should follow some equation not necessarily based on the standard ATK/DEF scaling,
	// check if the bonus is part of stats. If so, simply multiply by base_stats_per_level. Otherwise, use a custom formula defined above.
	bonus1Type = "+";
	if (selectedAccessory[2].startsWith("stats.")) {
		bonus1Number = standardItemScaling(adjustedIndex, 1);
		bonus1Number *= base_stats_per_level[selectedAccessory[2].split(".")[1]] / 5;
		bonus1Number = Math.round(bonus1Number);
	} else {
		scaling = special_scalings[selectedAccessory[2]];
		bonus1Number = scaling[0](adjustedIndex, scaling[1]);
		if (scaling[2] == "*") {
			bonus1Number += 1
		} else {
			bonus1Number = Math.round(bonus1Number);
		}
		
		bonus1Type = scaling[2];
	}
	
	bonus1 = [selectedAccessory[2], bonus1Type, bonus1Number],
	bonus2 = bonus2Target[0] == "" ? null : [bonus2Target[0], bonus2Target[1], bonus2Number],
	bonus3 = bonus3Target[0] == "" ? null : [bonus3Target[0], bonus3Target[1], bonus3Number]
	
	accessory = new Item("acc", exactIndex, selectedAccessory[0], accessoryName[0], bonus1, bonus2, bonus3);
	
	return accessory;
}


function generateArmourName(base, coeff, fin) {
	// Add data from the texts info at the start or end of the item.
	// Empty strings in the armour texts list to allow for possibly empty name appends.
	prepend = randInt(1,5) < 3 ? randomFromCollection(armourTexts[fin][0]) : empty_bonus;
	append = randInt(1,5) < 3 ? randomFromCollection(armourTexts[fin][1]) : empty_bonus;
	
	// Also add a "+X" to the armour base name if it's "prestiged" (loops)
	prestige = "";
	loops = Math.floor(Math.round(coeff) / 10);
	if (loops > 0)
		prestige = " +" + loops.toString();
	
	// Armour name can contribute to stats somewhat
	return [prepend[0] + base + append[0] + prestige, [prepend[1], append[1]]];
}


function generateArmour(baseCoeff) {
	// Same as weapon
	exactIndex = baseCoeff + (randInt(-4000, 4000) / 10000);
	finalIndex = Math.round(exactIndex) % 10;
	adjustedIndex = exactIndex + 1.5;
	
	selectedArmour = randomFromCollection(armourInfo[finalIndex]);
	// We now have a sprite and a base name. From here, generate the name then the stats.
	armourName = generateArmourName(selectedArmour[1], exactIndex, finalIndex);
	
	// we have a name! so generate the item
	// DEF is always the first thing to generate.
	// For now, generate with an DEF based on 3^adjustedIndex. (This essentially means that armour rarities will follow orders of 3^n for their level equivalent.)
	// Armour should generate with a flat DEF bonus as their first bonus and then two secondary bonuses based on their tags.
	// Then, apply the function in armourName[1][2] with the value in armourName[1][3] to get the final value for the bonus.
	bonus2Target = armourName[1][0];
	bonus3Target = armourName[1][1];
	
	// Apply variance to both bonus2 and bonus3 (+-15%)
	bonus2Variance = randInt(85, 115) / 100.0;
	bonus3Variance = randInt(85, 115) / 100.0;
	
	bonus2Number = Math.round(bonus2Target[2](adjustedIndex, bonus2Target[3]) * 100 * bonus2Variance) / 100;
	if (bonus2Target[1] == "*")
		bonus2Number += 1; // make sure it generates as an actual multiplier
	else
		bonus2Number = Math.round(bonus2Number); // otherwise round to an int
	
	bonus3Number = Math.round(bonus3Target[2](adjustedIndex, bonus3Target[3]) * 100 * bonus3Variance) / 100;
	if (bonus3Target[1] == "*")
		bonus3Number += 1; // make sure it generates as an actual multiplier
	else
		bonus3Number = Math.round(bonus3Number); // otherwise round to an int
	
	bonus1 = ["stats.def", "+", standardItemScaling(adjustedIndex, 3)],
	bonus2 = bonus2Target[0] == "" ? null : [bonus2Target[0], bonus2Target[1], bonus2Number],
	bonus3 = bonus3Target[0] == "" ? null : [bonus3Target[0], bonus3Target[1], bonus3Number]
	
	armour = new Item("armour", exactIndex, selectedArmour[0], armourName[0], bonus1, bonus2, bonus3);
	
	return armour;
}


function generateWeaponName(base, coeff, fin) {
	// Add data from the texts info at the start or end of the item.
	// Empty strings in the weapon texts list to allow for possibly empty name appends.
	prepend = randInt(1,5) < 3 ? randomFromCollection(weaponTexts[fin][0]) : empty_bonus;
	append = randInt(1,5) < 3 ? randomFromCollection(weaponTexts[fin][1]) : empty_bonus;
	
	// Also add a "+X" to the weapon base name if it's "prestiged" (loops)
	prestige = "";
	loops = Math.floor(Math.round(coeff) / 10);
	if (loops > 0)
		prestige = " +" + loops.toString();
	
	// Weapon name can contribute to stats somewhat
	return [prepend[0] + base + append[0] + prestige, [prepend[1], append[1]]];
}


function generateWeapon(baseCoeff) {
	// Rarity coefficient is passed into the function.
	// This determines the final image and words used for the weapon.
	// Rarity coefficient is a float from 0 to 9. If it is above, then it will loop around in item type and sprite but retain stat scaling.
	// This is to allow "rarity prestiging".
	// Apply a modifier of +-0.4 to the coefficient then round to the nearest int to get the sprite and name generation.
	exactIndex = baseCoeff + (randInt(-4000, 4000) / 10000);
	finalIndex = Math.round(exactIndex) % 10;
	adjustedIndex = exactIndex + 1.5; // buff early weapons, mostly
	
	// console.log(adjustedIndex, finalIndex);
	
	selectedWeapon = randomFromCollection(weaponInfo[finalIndex]);
	// We now have a sprite and a base name. From here, generate the name then the stats.
	weaponName = generateWeaponName(selectedWeapon[1], exactIndex, finalIndex);
	
	// we have a name! so generate the item
	// ATK is always the first thing to generate.
	// For now, generate with an ATK based on 3^adjustedIndex. (This essentially means that weapon rarities will follow orders of 3^n for their level equivalent.)
	// Weapons should generate with a flat ATK bonus as their first bonus and then two secondary bonuses based on their tags.
	// Then, apply the function in weaponName[1][2] with the value in weaponName[1][3] to get the final value for the bonus.
	bonus2Target = weaponName[1][0];
	bonus3Target = weaponName[1][1];
	
	// Apply variance to both bonus2 and bonus3 (+-15%)
	bonus2Variance = randInt(85, 115) / 100.0;
	bonus3Variance = randInt(85, 115) / 100.0;
	
	bonus2Number = Math.round(bonus2Target[2](adjustedIndex, bonus2Target[3]) * 100 * bonus2Variance) / 100;
	if (bonus2Target[1] == "*")
		bonus2Number += 1; // make sure it generates as an actual multiplier
	else
		bonus2Number = Math.round(bonus2Number); // otherwise round to an int
	
	bonus3Number = Math.round(bonus3Target[2](adjustedIndex, bonus3Target[3]) * 100 * bonus3Variance) / 100;
	if (bonus3Target[1] == "*")
		bonus3Number += 1; // make sure it generates as an actual multiplier
	else
		bonus3Number = Math.round(bonus3Number); // otherwise round to an int
	
	bonus1 = ["stats.atk", "+", standardItemScaling(adjustedIndex, 3)],
	bonus2 = bonus2Target[0] == "" ? null : [bonus2Target[0], bonus2Target[1], bonus2Number],
	bonus3 = bonus3Target[0] == "" ? null : [bonus3Target[0], bonus3Target[1], bonus3Number]
	
	weapon = new Item("weapon", exactIndex, selectedWeapon[0], weaponName[0], bonus1, bonus2, bonus3);
	
	// console.log(weapon.bonus2);
	
	return weapon;
}