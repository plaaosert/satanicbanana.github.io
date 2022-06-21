class Skill {
	static id_inc = 0;
	
	constructor(name, bonus, cost, desc) {
		this.id = Skill.id_inc;
		Skill.id_inc += 1;
		
		this.name = name;
		this.fname = this.id.toString().padStart(3, "0");
		this.bonus = bonus;
		this.desc = desc;
		this.cost = cost;
	}
}

skills_list = [
	new Skill(
		"Swordplay", "Increase ATK by **+7** per level.", 2, "Remember all those lessons back in hero school? You'd better."
	),
	
	new Skill(
		"Embers", "Increase ATK by **+1%** per level.", 2
	),
	
	new Skill(
		"Flow", "Increase AGI by **+3** per level.", 2
	),
	
	new Skill(
		"Magic Essence", "Increase MP gain on hit by **+1** per level.", 2
	),
	
	new Skill(
		"Discipline", "Increase ATK by **+15** and AGI by **+10** per level.", 5
	),
	
	new Skill(
		"Essence of Fire", "Gain **+2** MP every time you take damage.", 5
	),
	
	new Skill(
		"Patience", "Increase DEF by **+2%** per level. Giga Blast deals **+1%** more damage per level.", 5
	),
	
	new Skill(
		"Arcane Bestowal", "When you kill a monster, restore **+0.25%** max MP.", 5
	),
	
	new Skill(
		"UNSET", "UNSET", 10
	),
]