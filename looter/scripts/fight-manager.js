function initBattles(areaData) {
	// Make sure fight controller has player focused
	fightController.char1 = player;
	
	player.calculate_all_stats();
	
	// Then enter the area loop.
	// (Ticks happen 10 times a second)
	// Consists of:
	// - wait for the number of ticks until encounter to elapse
	// - spawn the monster, do player turn
	// - every 5 ticks, do the other character's turn
	// - if the enemy dies, go back to the start
	// - otherwise, drop out and end
	
	areaController.next_encounter = -1;
	areaController.stepcount = 0;
	areaController.time_begin = Date.now();
	areaController.area_data = areaData;
	
	// BEGIN !
	console.log("starting loop in " + areaController.area_data.name);
	areaController.interval_object = setInterval(areaTick, 50);
}


function areaTick() {
	areaController.stepcount++;
	// check here for lag. if the current time is 0.1 out of the predicted, add the number of ticks there should be
	currentTime = Date.now();
	expected = Math.floor((currentTime - areaController.time_begin) / 50);
	if (expected > areaController.stepcount) {
		console.log("lag detected. changing from", areaController.stepcount, "to", expected, "ticks");
		areaController.stepcount = expected; 
		// this might have to be switched with running the function repeatedly to make up for lost time.
		// this will only need to be done if there's complex behaviour (like random item / event spawns?)
	}
	
	if (fightController.current_turn > 0) {
		// only do something if the stepcount is > (battle_start + (battle_turns * 5))
		if (areaController.stepcount > fightController.battle_start + (fightController.battle_turns * 5)) {
			fightController.battle_turns++;
			
			// no branches so it's technically micro-optimised but instantly shoots itself in the foot by declaring two arbitrary lists lol
			char_in_context = [fightController.char1, fightController.char2][fightController.current_turn - 1];
			target = [fightController.char2, fightController.char1][fightController.current_turn - 1];
			
			// enemy and player templates share the same attributes required for fighting. hooray for polymorphism
			dmg_result = doAttack(char_in_context, target);
			// attacking always provides a base amount of MP plus any bonuses
			char_in_context.mp += 5;
			if (char_in_context.current_mp > char_in_context.stats.max_mp) {
				char_in_context.current_mp = char_in_context.stats.max_mp;
			}
			
			console.log(char_in_context.name + " dealt " + dmg_result.damage + " damage to " + target.name + " (" + target.current_hp + " / " + target.stats.hp + ")");
			
			if (dmg_result.dead) { // if someone dies
				console.log("ha ha ha " + target.name + " died");
				fightController.current_turn = -2; // resolve it next turn
			} else {
				// otherwise just switch the turn
				fightController.current_turn = 3 - fightController.current_turn; // toggle from 1 to 2 and vice versa
			}
		}
		
	} else if (fightController.current_turn == -2) {
		// the player is always char1
		if (fightController.char1.dead) {
			console.log("PLAYER HAS DIED!!");
			clearInterval(areaController.interval_object) // stop the searching loop
			// then handle death
			// and basically quit out here
		} else {
			console.log("ENEMY DIED!!!");
			// call looting, gold gain, xp gain routines
			// then do nothing since we just return to the loop
			fightController.char1.gain_xp(fightController.char2.level + 2);
		}
		
		// we always reset current turn back to -1 and next encounter to unset
		fightController.current_turn = -1;
		areaController.next_encounter = -1;
		
		show_wait_screen();
		
	} else {
		// wait for an enemy, or set the spawn timer if next_encounter is -1
		if (areaController.next_encounter == -1) {
			// set next_encounter to stepcount + random between min and max enemy appearance rate.
			// this can also be affected by player items but should never dip below 1
			min_next = Math.max(1, areaController.area_data.min_encounter);
			max_next = Math.max(2, areaController.area_data.max_encounter); // min of 2 since randInt returns exclusive int between min and max - so randInt(1, 2) = 1 always
			areaController.next_encounter = areaController.stepcount + (randInt(min_next, max_next) * 20);
			console.log("currently", areaController.stepcount + ". next encounter at", areaController.next_encounter);
			
			// call rendering function
			refresh_enemy_spawn_time(areaController.next_encounter - areaController.stepcount);
		} else {
			if (areaController.next_encounter <= areaController.stepcount) {
				fightController.current_turn = 1; // the first turn is taken on the NEXT battle step
				areaController.battle_stepcount = 0;
				
				fightController.char2 = generateEnemy(areaController.area_data);
				fightController.battle_start = areaController.stepcount;
				fightController.battle_turns = 1;
				console.log("tried to spawn enemy", fightController.char2);
				
				static_bars[2].relink(fightController.char2, "current_hp", fightController.char2, "hp");
				show_enemy_screen();
			}
			
			// call rendering function
			refresh_enemy_spawn_time(areaController.next_encounter - areaController.stepcount);
		}
	}
	
	update_static_bars();
}


areaController = {
	area_data: null, // set to the current area's constants
	
	interval_object: null, // gotta store it somewhere
	next_encounter: -1, // global stepcount at which the next encounter pops
	stepcount: 0, // global stepcount. increments every tick, subject to setTimeout()'s lag funnies. 10 times a second, or once every 100ms. is not updated while offline.
	time_begin: -1, // time started as time since epoch. used for showing how long the area has been active
}


fightController = {
	char1: null,
	char2: null,
	
	current_turn: -1, // -1 means inactive. 1/2 means the turn. -2 means waiting to resolve result
	battle_start: -1, // measured in steps
	battle_turns: 0 // only updated during battle and is used to make sure turns are taken every 5 steps, among other things
}

