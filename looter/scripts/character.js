// functions used by all characters, such as taking damage or finding crit chance
// inheritance looks very clunky in js (lol)
function doAttack(actor, target) {
	// damage taken is reduced by up to 40% of max hp by def, at which point the rest of the resist is applied diminishingly (^0.8). 
	// this means you have to level both to get good protection.
	crit_pick = randInt(0, 100000) / 100000;
	crit = crit_pick < actor.bonuses.crit_chance;
	
	damage = actor.stats.atk
	if (crit)
		damage *= actor.bonuses.crit_damage;
	
	damageAmount = dealDamage(target, damage);
	
	return {damage: damageAmount, dead: target.dead, crit: crit};
}

function dealDamage(target, damage) {
	/*
	reduction = target.stats.def;
	threshold = target.stats.hp * 0.4;
	if (reduction > threshold) {
		reduction = threshold + Math.round((reduction - threshold) ** 0.8);
	}
	
	damageAmount = Math.round(Math.max(1, damage - reduction));
	*/
	
	damageAmount = Math.round(Math.max(0, (damage * damage) / (damage + target.stats.def)));
	
	target.current_hp -= damageAmount;
	target.dead = target.current_hp <= 0; // idiot proofing
	
	return damageAmount
}