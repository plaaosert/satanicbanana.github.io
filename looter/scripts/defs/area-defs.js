area_defs = [
	{
		id: "001",
		name: "Grasslands",
		desc: "A peaceful place with no real dangers to speak of. Probably.",
		avg_level: 0,
		
		min_encounter: 5, // in seconds
		max_encounter: 15,
		// atk def hp mp
		// should sum to 1. higher means enemies are more challenging despite their level (so worth less xp compared to the challenge)
		spawn_bias: [0.15, 0.1, 0.3, 0.2],
		special: []
	},
	{
		id: "003",
		name: "Grasslands (with tree)",
		desc: "The addition of the tree increases this area's propensity for dangerous encounters by several orders of magnitude.",
		avg_level: 2,
		
		min_encounter: 5,
		max_encounter: 15,
		spawn_bias: [0.3, 0.2, 0.2, 0.3],
		special: []
	},
	{
		id: "005",
		name: "Hillside",
		desc: "While they are completely harmless and utterly unsalvageable, we did notice some strange miniature robot-like designs here, all outfitted with seemingly interchangeable parts.",
		avg_level: 30,
		
		min_encounter: 5,
		max_encounter: 15,
		spawn_bias: [0.3, 0.2, 0.2, 0.3],
		special: []
	},
	{
		id: "002",
		name: "THJE HELL TREE",
		desc: "ONLY PAIN AND MISERY ABOUND IN THIS WORLD. UNWARY TRAVELLER, BEWARE...",
		avg_level: 1e6,
		
		min_encounter: 60,
		max_encounter: 600,
		spawn_bias: [0.5, 0.5, 1, 0.1],
		special: [["double_hp", 0.1], ["double_atk", 0.1]]
	},
]