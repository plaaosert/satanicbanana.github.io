class Skill {
	static id_inc = 0;
	
	constructor(name, fname, bonus, desc, cost) {
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
		"Test Skill 1", null, "This skill does nothing and is a test.", 1
	),
	
	new Skill(
		"Test Skill 2", null, "No matter what you think, this skill does NOTHING AT ALL.", 1
	),
	
	new Skill(
		"Test Skill 3", null, "I've been told by my informant that this skill is of no value. No use, no purpose. Don't investigate further.", 1
	),
	
	new Skill(
		"Test Skill 4", null, "No", 1
	),
	
	new Skill(
		"UNSET", null, "UNSET", 5
	),
]