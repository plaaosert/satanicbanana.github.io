accessoryTexts = [
	[ // R0
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R1
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R2
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R3
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R4
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R5
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R6
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R7
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R8
		[
			// unset
		], 
		
		[
			// unset
		]
	],
	
	[ // R9
		[
			// unset
		], 
		
		[
			// unset
		]
	],
];

// then add the multi-rarity prefixes to the master list
multiRPrefixes = [
	["Holy ",          ["stats.atk", "*", sqrt, 0.125], [4, 7]],
	["Divine ",        ["stats.atk", "*", sqrt, 0.15], [6, 9]],
	["Keen ",          ["stats.agi", "+", standardItemScaling, 0.2], [0, 5]],
	["Swift ",         ["stats.agi", "*", sqrt, 0.15], [4, 9]],
	["Bulky ",         ["stats.def", "+", standardItemScaling, 0.5], [0, 5]],
	["Lucky ",         ["stats.luc", "*", sqrt, 0.15], [4, 9]],
	["Fortuitous ",    ["bonuses.loot_chance", "*", sqrt, 0.2], [2, 9]],
	["Serendipitous ", ["bonuses.gold_bonus", "*", linear, 0.085], [2, 9]],
	["Bloodied ",      ["bonuses.apl", "+", sqrt, 1.05], [4, 9]],
	["Defensive ",     ["bonuses.dpl", "+", sqrt, 0.85], [4, 9]],
	["Invigorating ",  ["bonuses.hpl", "+", sqrt, 10.81], [5, 9]],
	["Arcane ",        ["bonuses.mpl", "+", sqrt, 1.69], [5, 9]],
	["Weightless ",    ["bonuses.agl", "+", sqrt, 0.42], [3, 7]],
	["Blessed ",       ["bonuses.lpl", "+", sqrt, 0.36], [3, 7]],
]


for (i=0; i<multiRPrefixes.length; i++) {
	prefx = multiRPrefixes[i];
	for (j=prefx[2][0]; j<=prefx[2][1]; j++) {
		accessoryTexts[j][0].push([prefx[0], prefx[1]]);
	}
}

// then add the multi-rarity suffixes to the master list
multiRSuffixes = [
	[" of Power",           ["stats.atk", "*", sqrt, 0.075], [4, 7]],
	[" of the Holy",        ["stats.atk", "*", sqrt, 0.1], [6, 9]],
	[" (Damaged)",          ["stats.hp", "*", constant, -0.07], [0, 5]],
	[" of Fire",            ["stats.atk", "*", sqrt, 0.0875], [3, 6]],
	[" of Frost",           ["stats.def", "+", standardItemScaling, 0.3], [0, 5]],
	[" of Thunder",         ["stats.agi", "*", sqrt, 0.1], [4, 9]],
	[" of the Abyss",       ["stats.mp", "*", linear, 0.1], [6, 9]],
	[" of Fortune",         ["bonuses.loot_chance", "*", linear, 0.04], [2, 9]],
	[" of the Learned",     ["bonuses.xp_bonus", "*", linear, 0.05], [2, 9]],
]


for (i=0; i<multiRSuffixes.length; i++) {
	sufx = multiRSuffixes[i];
	for (j=sufx[2][0]; j<=sufx[2][1]; j++) {
		accessoryTexts[j][1].push([sufx[0], sufx[1]]);
	}
}